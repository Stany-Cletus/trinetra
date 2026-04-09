import { useEffect, useRef, useState } from "react";
import "./Level1Game.css";

// ── Constants ──────────────────────────────────────────────────────────────
const W = 1280;
const H = 600;
const GRAVITY = 0.55;
const JUMP_FORCE = -13;
const PLAYER_SPEED = 4.5;
const TILE = 40;

// Letters to collect, in order
const LETTERS = ["T", "R", "I", "N", "E", "T", "R", "A"];

// ── Map Layout ─────────────────────────────────────────────────────────────
// Each row from left to right, 0=air, 1=solid, 2=spike, 3=ladder(unused), 9=void-below
// We define the world as a series of "rooms" joined by a scroll
// Total map width: 3200px (80 tiles), height: 600 (15 tiles)
const MAP_COLS = 80;
const MAP_ROWS = 15;

function buildMap() {
  // Initialize all air
  const map = Array.from({ length: MAP_ROWS }, () => Array(MAP_COLS).fill(0));

  // Helper to fill solid row segment
  const fill = (row, colStart, colEnd, val = 1) => {
    for (let c = colStart; c <= colEnd; c++) map[row][c] = val;
  };

  // Ground floor
  fill(14, 0, 79);

  // === ZONE 1: Starting area (cols 0–18) ===
  fill(14, 0, 18);
  // Platforms
  fill(10, 3, 7);
  fill(7, 5, 9);
  fill(10, 11, 14);
  // Pit from 19–22 (no ground) → forces jump or fall
  for (let r = 13; r <= 14; r++) for (let c = 19; c <= 22; c++) map[r][c] = 0;

  // === ZONE 2: Pit crossing (cols 19–22) - must jump ===
  // Single narrow platform midway
  fill(12, 20, 20);

  // === ZONE 3: Mid section (cols 23–48) ===
  fill(14, 23, 48);
  fill(11, 24, 28);
  fill(8, 27, 31);
  fill(11, 33, 37);
  fill(9, 36, 40);
  fill(12, 42, 46);
  fill(7, 44, 49);
  // Spike trap
  fill(14, 29, 31, 2);

  // False path wall (col 49) — solid wall they hit if they go too high
  fill(6, 49, 55);  // ceiling that blocks wrong path

  // === ZONE 4: False branch (cols 49–60) upper left path ===
  fill(14, 49, 60);
  fill(11, 50, 54);
  fill(8, 52, 57);
  // Dead end — spikes at end
  fill(14, 58, 62, 2);
  fill(14, 63, 64);  // tiny platform to survive

  // === ZONE 5: Correct path continues right (cols 49–67) lower ===
  // Hidden lower path below z3 — lower floor dip
  fill(14, 48, 68);
  fill(11, 52, 56);
  fill(9, 58, 62);
  fill(12, 64, 68);

  // === ZONE 6: Pre-finish (cols 68–79) ===
  fill(14, 68, 79);
  fill(11, 69, 73);
  fill(8, 72, 76);
  // Spikes
  fill(14, 71, 73, 2);
  // Final stretch
  fill(10, 75, 78);

  return map;
}

// ── Letter positions (world coordinates) ──────────────────────────────────
// Placed along the CORRECT path, in order
const LETTER_PICKUPS = [
  { id: 0, letter: "T", x: 4 * TILE + 20,  y: 9 * TILE },
  { id: 1, letter: "R", x: 7 * TILE,       y: 6 * TILE },
  { id: 2, letter: "I", x: 20 * TILE,      y: 11 * TILE },
  { id: 3, letter: "N", x: 28 * TILE,      y: 7 * TILE },
  { id: 4, letter: "E", x: 38 * TILE,      y: 8 * TILE },
  { id: 5, letter: "T", x: 53 * TILE,      y: 10 * TILE },
  { id: 6, letter: "R", x: 61 * TILE,      y: 8 * TILE },
  { id: 7, letter: "A", x: 76 * TILE,      y: 9 * TILE },
];

// ── Finish line ────────────────────────────────────────────────────────────
const FINISH = { x: 78 * TILE, y: 10 * TILE, w: 40, h: TILE * 4 };

// ── Spike trap areas ───────────────────────────────────────────────────────
function getSpikeRects(map) {
  const spikes = [];
  for (let r = 0; r < MAP_ROWS; r++) {
    for (let c = 0; c < MAP_COLS; c++) {
      if (map[r][c] === 2) {
        spikes.push({ x: c * TILE, y: r * TILE, w: TILE, h: 12 });
      }
    }
  }
  return spikes;
}

// ── Player sprite renderer (canvas) ───────────────────────────────────────
function drawPlayer(ctx, x, y, frame, dir, isJumping, isDead) {
  ctx.save();
  if (dir === -1) {
    ctx.translate(x + 20, y);
    ctx.scale(-1, 1);
    ctx.translate(-20, 0);
  } else {
    ctx.translate(x, y);
  }

  const t = frame / 8;
  const legSwing = Math.sin(t * Math.PI * 2) * 6;

  if (isDead) {
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = "#cc0000";
    ctx.beginPath();
    ctx.ellipse(20, 28, 18, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.beginPath();
  ctx.ellipse(20, 52, 12, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cloak / body
  ctx.fillStyle = "#1a1a2e";
  ctx.beginPath();
  ctx.moveTo(6, 20);
  ctx.lineTo(34, 20);
  ctx.lineTo(36, 50);
  ctx.lineTo(4, 50);
  ctx.closePath();
  ctx.fill();

  // Cloak shimmer
  ctx.fillStyle = "rgba(80,0,180,0.15)";
  ctx.fillRect(8, 22, 8, 28);

  // Hood
  ctx.fillStyle = "#0d0d1a";
  ctx.beginPath();
  ctx.arc(20, 14, 12, 0, Math.PI * 2);
  ctx.fill();

  // Mask (cyberpunk face)
  ctx.fillStyle = "#2a2a4a";
  ctx.fillRect(10, 10, 20, 14);

  // Glowing eyes
  const eyeGlow = (Math.sin(frame * 0.15) + 1) * 0.5;
  ctx.fillStyle = `rgba(0, 229, 255, ${0.6 + eyeGlow * 0.4})`;
  ctx.shadowColor = "#00e5ff";
  ctx.shadowBlur = 6 + eyeGlow * 4;
  ctx.fillRect(12, 14, 5, 4);
  ctx.fillRect(23, 14, 5, 4);
  ctx.shadowBlur = 0;

  // Circuit lines on mask
  ctx.strokeStyle = "rgba(0, 229, 255, 0.3)";
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(15, 18); ctx.lineTo(25, 18);
  ctx.stroke();

  // Legs
  const isRunning = !isJumping;
  ctx.fillStyle = "#0d0d1a";

  if (isRunning) {
    // Left leg
    ctx.save();
    ctx.translate(13, 42);
    ctx.rotate(legSwing * 0.07);
    ctx.fillRect(-4, 0, 8, 14);
    ctx.restore();
    // Right leg
    ctx.save();
    ctx.translate(27, 42);
    ctx.rotate(-legSwing * 0.07);
    ctx.fillRect(-4, 0, 8, 14);
    ctx.restore();
  } else {
    // Jump legs
    ctx.fillRect(9, 42, 8, 10);
    ctx.fillRect(23, 42, 8, 10);
  }

  // Shoulder armor plates
  ctx.fillStyle = "#444466";
  ctx.fillRect(4, 20, 10, 6);
  ctx.fillRect(26, 20, 10, 6);

  // Red circuit on shoulder
  ctx.fillStyle = "rgba(200, 0, 0, 0.6)";
  ctx.fillRect(5, 21, 8, 2);
  ctx.fillRect(27, 21, 8, 2);

  ctx.restore();
}

// ── Ghost / enemy ──────────────────────────────────────────────────────────
function drawGhost(ctx, x, y, frame, camX) {
  const sx = x - camX;
  if (sx < -80 || sx > W + 80) return;

  ctx.save();
  ctx.translate(sx, y);

  const bob = Math.sin(frame * 0.05) * 6;
  ctx.translate(0, bob);

  const alpha = 0.5 + Math.sin(frame * 0.08) * 0.2;
  ctx.globalAlpha = alpha;

  // Ghost body
  ctx.fillStyle = "#aaaacc";
  ctx.beginPath();
  ctx.arc(20, 20, 18, Math.PI, 0, false);
  ctx.lineTo(38, 44);
  // Wavy bottom
  for (let i = 0; i < 4; i++) {
    const px = 38 - i * 10;
    ctx.quadraticCurveTo(px - 5, 44 + (i % 2 === 0 ? 8 : -2), px - 10, 44);
  }
  ctx.lineTo(2, 44);
  ctx.closePath();
  ctx.fill();

  // Eyes
  ctx.fillStyle = "#cc0000";
  ctx.fillRect(10, 16, 7, 7);
  ctx.fillRect(23, 16, 7, 7);

  ctx.globalAlpha = 1;
  ctx.restore();
}

// ── Draw letter pickup ─────────────────────────────────────────────────────
function drawLetterPickup(ctx, lp, camX, frame) {
  const sx = lp.x - camX;
  if (sx < -60 || sx > W + 60) return;

  const bob = Math.sin(frame * 0.06 + lp.id) * 4;

  ctx.save();
  ctx.translate(sx + 20, lp.y + bob);

  // Glow aura
  const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, 30);
  grd.addColorStop(0, "rgba(200, 0, 0, 0.4)");
  grd.addColorStop(1, "transparent");
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.arc(0, 0, 30, 0, Math.PI * 2);
  ctx.fill();

  // Orb
  ctx.fillStyle = "#8b0000";
  ctx.beginPath();
  ctx.arc(0, 0, 16, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#cc0000";
  ctx.lineWidth = 2;
  ctx.shadowColor = "#cc0000";
  ctx.shadowBlur = 10;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Letter
  ctx.fillStyle = "#fff";
  ctx.font = "bold 16px 'Cinzel Decorative', serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(lp.letter, 0, 1);

  ctx.restore();
}

// ── Draw background ────────────────────────────────────────────────────────
function drawBackground(ctx, camX, frame) {
  // Deep background gradient
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#0a0008");
  bg.addColorStop(0.5, "#120010");
  bg.addColorStop(1, "#050005");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Parallax trees (far)
  ctx.fillStyle = "rgba(20, 5, 20, 0.8)";
  for (let i = 0; i < 18; i++) {
    const tx = ((i * 180 - camX * 0.15) % (W + 100)) - 50;
    const th = 80 + (i % 3) * 40;
    ctx.fillRect(tx, H - th - 80, 22 + (i % 3) * 8, th);
    // Tree top
    ctx.beginPath();
    ctx.moveTo(tx + 15, H - th - 80);
    ctx.lineTo(tx - 10, H - th - 40);
    ctx.lineTo(tx + 40, H - th - 40);
    ctx.closePath();
    ctx.fill();
  }

  // Mid parallax — ruins
  ctx.fillStyle = "rgba(30, 10, 30, 0.9)";
  for (let i = 0; i < 8; i++) {
    const rx = ((i * 350 - camX * 0.35) % (W + 200)) - 100;
    ctx.fillRect(rx, H - 180, 60, 140);
    ctx.fillRect(rx + 20, H - 220, 20, 40); // pillar top
    // Windows
    ctx.fillStyle = "rgba(200, 0, 0, 0.15)";
    ctx.fillRect(rx + 8, H - 160, 12, 16);
    ctx.fillRect(rx + 36, H - 160, 12, 16);
    ctx.fillStyle = "rgba(30, 10, 30, 0.9)";
  }

  // Fog wisps
  ctx.save();
  for (let i = 0; i < 5; i++) {
    const fx = ((i * 280 + frame * 0.4 - camX * 0.1) % (W + 200)) - 100;
    const fy = H - 120 + (i % 3) * 20;
    const grd = ctx.createRadialGradient(fx, fy, 0, fx, fy, 100);
    grd.addColorStop(0, "rgba(150, 80, 150, 0.06)");
    grd.addColorStop(1, "transparent");
    ctx.fillStyle = grd;
    ctx.fillRect(fx - 100, fy - 60, 200, 120);
  }
  ctx.restore();

  // Fireflies
  for (let i = 0; i < 12; i++) {
    const fα = (Math.sin(frame * 0.07 + i * 1.3) + 1) * 0.5;
    const fx = ((i * 220 + frame * (0.3 + i * 0.02) - camX * 0.05) % (W + 40));
    const fy = 80 + (i * 37) % (H - 180) + Math.sin(frame * 0.04 + i) * 20;
    ctx.save();
    ctx.globalAlpha = fα * 0.7;
    ctx.fillStyle = "#aaff44";
    ctx.shadowColor = "#88ff00";
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(fx, fy, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// ── Draw map tiles ─────────────────────────────────────────────────────────
function drawMap(ctx, map, camX) {
  const startCol = Math.max(0, Math.floor(camX / TILE) - 1);
  const endCol = Math.min(MAP_COLS - 1, Math.ceil((camX + W) / TILE) + 1);

  for (let r = 0; r < MAP_ROWS; r++) {
    for (let c = startCol; c <= endCol; c++) {
      const tile = map[r][c];
      if (tile === 0) continue;

      const sx = c * TILE - camX;
      const sy = r * TILE;

      if (tile === 1) {
        // Stone platform
        const grd = ctx.createLinearGradient(sx, sy, sx, sy + TILE);
        grd.addColorStop(0, "#2a1f2a");
        grd.addColorStop(1, "#1a1018");
        ctx.fillStyle = grd;
        ctx.fillRect(sx, sy, TILE, TILE);

        // Mossy top highlight
        if (r === 0 || map[r - 1][c] === 0) {
          ctx.fillStyle = "#3a2840";
          ctx.fillRect(sx, sy, TILE, 4);
          // Random moss patches
          if ((r * 7 + c * 13) % 5 < 2) {
            ctx.fillStyle = "rgba(40, 80, 30, 0.6)";
            ctx.fillRect(sx + 4, sy, (c % 3 + 1) * 8, 3);
          }
        }

        // Grid lines
        ctx.strokeStyle = "rgba(80, 40, 80, 0.3)";
        ctx.lineWidth = 0.5;
        ctx.strokeRect(sx, sy, TILE, TILE);

        // Brick detail
        if (TILE >= 32) {
          ctx.strokeStyle = "rgba(50, 30, 50, 0.5)";
          ctx.beginPath();
          ctx.moveTo(sx + TILE / 2, sy);
          ctx.lineTo(sx + TILE / 2, sy + TILE);
          ctx.stroke();
        }
      } else if (tile === 2) {
        // Spike
        ctx.fillStyle = "#cc0000";
        for (let s = 0; s < 3; s++) {
          ctx.beginPath();
          ctx.moveTo(sx + s * 13 + 4, sy + TILE);
          ctx.lineTo(sx + s * 13 + 11, sy + TILE);
          ctx.lineTo(sx + s * 13 + 7, sy + TILE - 16);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#ff0000";
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
        // Blood drips
        ctx.fillStyle = "rgba(180, 0, 0, 0.4)";
        ctx.fillRect(sx + 6, sy + TILE - 2, 3, 6);
        ctx.fillRect(sx + 16, sy + TILE - 2, 3, 8);
      }
    }
  }
}

// ── Main game component ────────────────────────────────────────────────────
export default function Level1Game({ onComplete }) {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const [hud, setHud] = useState({ letters: [], lives: 3, coins: 0, msg: "" });
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const map = buildMap();
    const spikes = getSpikeRects(map);

    const state = {
      player: {
        x: 2 * TILE,
        y: 12 * TILE,
        vx: 0,
        vy: 0,
        w: 40,
        h: 52,
        onGround: false,
        dir: 1,
        frame: 0,
        lives: 3,
        invincible: 0,
        dead: false,
      },
      camX: 0,
      frame: 0,
      keys: {},
      letters: [...LETTER_PICKUPS.map(l => ({ ...l, collected: false }))],
      collectedLetters: [],
      finished: false,
      ghosts: [
        { x: 12 * TILE, y: 9 * TILE, dir: 1, speed: 1.2, range: 4 },
        { x: 35 * TILE, y: 10 * TILE, dir: -1, speed: 1.5, range: 5 },
        { x: 60 * TILE, y: 8 * TILE, dir: 1, speed: 1.8, range: 3 },
      ],
      msg: "",
      msgTimer: 0,
    };
    gameRef.current = state;

    const keys = state.keys;

    const onKey = (e, down) => {
      keys[e.code] = down;
      e.preventDefault();
    };
    window.addEventListener("keydown", e => onKey(e, true));
    window.addEventListener("keyup", e => onKey(e, false));

    function isSolid(wx, wy) {
      const c = Math.floor(wx / TILE);
      const r = Math.floor(wy / TILE);
      if (r < 0 || r >= MAP_ROWS || c < 0 || c >= MAP_COLS) return false;
      return map[r][c] === 1;
    }

    function collidesSpike(px, py, pw, ph) {
      return spikes.some(s =>
        px < s.x + s.w && px + pw > s.x &&
        py < s.y + s.h && py + ph > s.y
      );
    }

    function respawnPlayer(p) {
      p.x = 2 * TILE;
      p.y = 12 * TILE;
      p.vx = 0; p.vy = 0;
      p.invincible = 120;
      p.dead = false;
      state.camX = 0;
    }

    let animId;
    function loop() {
      const s = gameRef.current;
      const p = s.player;
      s.frame++;
      p.frame++;

      if (p.invincible > 0) p.invincible--;

      // Input
      if (!p.dead && !s.finished) {
        const left = keys["ArrowLeft"] || keys["KeyA"];
        const right = keys["ArrowRight"] || keys["KeyD"];
        const jump = keys["ArrowUp"] || keys["KeyW"] || keys["Space"];

        if (left) { p.vx = -PLAYER_SPEED; p.dir = -1; }
        else if (right) { p.vx = PLAYER_SPEED; p.dir = 1; }
        else p.vx *= 0.8;

        if (jump && p.onGround) {
          p.vy = JUMP_FORCE;
          p.onGround = false;
        }
      }

      // Physics
      p.vy += GRAVITY;
      p.vy = Math.min(p.vy, 18);

      // X movement
      p.x += p.vx;
      p.x = Math.max(0, p.x);

      // X collision
      const corners = [
        [p.x, p.y + 10],
        [p.x + p.w, p.y + 10],
        [p.x, p.y + p.h],
        [p.x + p.w, p.y + p.h],
      ];
      if (p.vx > 0) {
        if (isSolid(p.x + p.w, p.y + 10) || isSolid(p.x + p.w, p.y + p.h - 4)) {
          p.x = Math.floor((p.x + p.w) / TILE) * TILE - p.w;
          p.vx = 0;
        }
      } else if (p.vx < 0) {
        if (isSolid(p.x, p.y + 10) || isSolid(p.x, p.y + p.h - 4)) {
          p.x = Math.ceil(p.x / TILE) * TILE;
          p.vx = 0;
        }
      }

      // Y movement
      p.y += p.vy;
      p.onGround = false;

      if (p.vy > 0) {
        if (isSolid(p.x + 4, p.y + p.h) || isSolid(p.x + p.w - 4, p.y + p.h)) {
          p.y = Math.floor((p.y + p.h) / TILE) * TILE - p.h;
          p.vy = 0;
          p.onGround = true;
        }
      } else if (p.vy < 0) {
        if (isSolid(p.x + 4, p.y) || isSolid(p.x + p.w - 4, p.y)) {
          p.y = Math.ceil(p.y / TILE) * TILE;
          p.vy = 0;
        }
      }

      // Fall into void
      if (p.y > MAP_ROWS * TILE) {
        p.lives--;
        if (p.lives <= 0) {
          setGameOver(true);
          return;
        }
        respawnPlayer(p);
        setHud(h => ({ ...h, lives: p.lives, msg: "💀 Respawning..." }));
        state.msg = "💀 Respawning...";
        state.msgTimer = 90;
      }

      // Spike collision
      if (!p.dead && p.invincible === 0 && collidesSpike(p.x, p.y, p.w, p.h)) {
        p.lives--;
        if (p.lives <= 0) {
          setGameOver(true);
          return;
        }
        respawnPlayer(p);
        setHud(h => ({ ...h, lives: p.lives, msg: "⚠ Spikes!" }));
        state.msgTimer = 90;
      }

      // Ghost movement & collision
      s.ghosts.forEach(g => {
        g.x += g.dir * g.speed;
        const cx = g.x / TILE;
        if (cx < (g.startX || g.x / TILE) - g.range || cx > (g.startX || g.x / TILE) + g.range) {
          g.dir *= -1;
          if (!g.startX) g.startX = g.x / TILE;
        }
        if (!isSolid(g.x / TILE | 0, (g.y + 50) / TILE | 0) === false) g.dir *= -1;

        // Ghost-player collision
        if (p.invincible === 0 &&
          p.x < g.x + 36 && p.x + p.w > g.x &&
          p.y < g.y + 50 && p.y + p.h > g.y) {
          p.lives--;
          if (p.lives <= 0) {
            setGameOver(true);
            return;
          }
          respawnPlayer(p);
          setHud(h => ({ ...h, lives: p.lives, msg: "👻 Ghost got you!" }));
          state.msgTimer = 90;
        }
      });

      // Letter pickup
      s.letters.forEach(lp => {
        if (lp.collected) return;
        if (p.x < lp.x + 40 && p.x + p.w > lp.x &&
          p.y < lp.y + 32 && p.y + p.h > lp.y) {
          lp.collected = true;
          s.collectedLetters.push(lp.letter);
          state.msg = `✦ "${lp.letter}" collected!`;
          state.msgTimer = 80;
          setHud(h => ({
            ...h,
            letters: [...s.collectedLetters],
            msg: `✦ "${lp.letter}" collected!`,
          }));
        }
      });

      // Finish line
      if (!s.finished &&
        p.x < FINISH.x + FINISH.w && p.x + p.w > FINISH.x &&
        p.y < FINISH.y + FINISH.h && p.y + p.h > FINISH.y) {
        s.finished = true;
        setWon(true);
        setHud(h => ({ ...h, coins: 100, msg: "🏆 COMPLETE! +100 Coins!" }));
        setTimeout(() => {
          onComplete({ coins: 100, letters: s.collectedLetters });
        }, 2500);
      }

      // Camera
      const targetCam = p.x - W / 3;
      s.camX += (targetCam - s.camX) * 0.1;
      s.camX = Math.max(0, Math.min(s.camX, MAP_COLS * TILE - W));

      // Message timer
      if (state.msgTimer > 0) state.msgTimer--;

      // ── Draw ──
      drawBackground(ctx, s.camX, s.frame);
      drawMap(ctx, map, s.camX);

      // Draw finish line
      const fx = FINISH.x - s.camX;
      if (fx > -60 && fx < W + 60) {
        const fgrd = ctx.createLinearGradient(fx, 0, fx + FINISH.w, 0);
        fgrd.addColorStop(0, "rgba(255, 215, 0, 0)");
        fgrd.addColorStop(0.5, "rgba(255, 215, 0, 0.3)");
        fgrd.addColorStop(1, "rgba(255, 215, 0, 0)");
        ctx.fillStyle = fgrd;
        ctx.fillRect(fx, FINISH.y, FINISH.w, FINISH.h);
        ctx.strokeStyle = "#ffd700";
        ctx.lineWidth = 3;
        ctx.shadowColor = "#ffd700";
        ctx.shadowBlur = 16;
        ctx.strokeRect(fx, FINISH.y, FINISH.w, FINISH.h);
        ctx.shadowBlur = 0;
        ctx.font = "bold 11px 'Share Tech Mono', monospace";
        ctx.fillStyle = "#ffd700";
        ctx.textAlign = "center";
        ctx.fillText("FINISH", fx + FINISH.w / 2, FINISH.y - 8);
      }

      // Draw letter pickups
      s.letters.forEach(lp => {
        if (!lp.collected) drawLetterPickup(ctx, lp, s.camX, s.frame);
      });

      // Draw ghosts
      s.ghosts.forEach(g => drawGhost(ctx, g.x, g.y, s.frame, s.camX));

      // Draw player (blink when invincible)
      if (p.invincible === 0 || Math.floor(p.invincible / 6) % 2 === 0) {
        drawPlayer(
          ctx,
          p.x - s.camX,
          p.y,
          p.frame,
          p.dir,
          !p.onGround,
          p.dead
        );
      }

      animId = requestAnimationFrame(loop);
    }

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("keydown", e => onKey(e, true));
      window.removeEventListener("keyup", e => onKey(e, false));
    };
  }, [onComplete]);

  return (
    <div className="game-root">
      {/* HUD */}
      <div className="game-hud">
        <div className="hud-left">
          <div className="hud-lives">
            {Array.from({ length: 3 }, (_, i) => (
              <span key={i} className={`hud-heart ${i < hud.lives ? "alive" : "dead"}`}>♥</span>
            ))}
          </div>
          <div className="hud-coins">⬡ {hud.coins}</div>
        </div>
        <div className="hud-center">
          <div className="hud-letters">
            {LETTERS.map((l, i) => (
              <span
                key={i}
                className={`hud-letter ${hud.letters[i] ? "collected" : "empty"}`}
              >
                {hud.letters[i] || l}
              </span>
            ))}
          </div>
        </div>
        <div className="hud-right">
          <div className="hud-controls">
            <span>WASD / ↑←→ to move &nbsp; SPACE to jump</span>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <canvas ref={canvasRef} width={W} height={H} className="game-canvas" />

      {/* Message overlay */}
      {hud.msg && !won && !gameOver && (
        <div className="game-msg">{hud.msg}</div>
      )}

      {/* Win overlay */}
      {won && (
        <div className="game-win-overlay">
          <div className="game-win-card">
            <div className="win-title">VERIFICATION COMPLETE</div>
            <div className="win-letters">
              {hud.letters.map((l, i) => (
                <span key={i} className="win-letter">{l}</span>
              ))}
            </div>
            <div className="win-coins">+100 COINS EARNED</div>
            <div className="win-sub">Syncing to network...</div>
          </div>
        </div>
      )}

      {/* Game Over overlay */}
      {gameOver && (
        <div className="game-over-overlay">
          <div className="game-over-card">
            <div className="go-title">ACCESS TERMINATED</div>
            <p className="go-sub">You have been eliminated</p>
            <button className="go-retry-btn" onClick={() => window.location.reload()}>
              RETRY
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
