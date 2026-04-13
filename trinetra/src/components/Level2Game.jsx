import { useState, useEffect, useRef, useCallback } from "react";
import "./Level2Game.css";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const PUSHBACK_KEYWORDS = {
  rahul:  ["no","fake","scam","busy","later","stop","who","why","sus","nope","report","phishing","link","wrong","real"],
  priya:  ["call","voice","no","broke","who","verify","later","stop","fake","scam","phone","talk","proof","sure","meet"],
  tcs:    ["scam","fee","free","no","real","legit","fake","pay","money","why","never","stop","job","charge","refund"],
};

const NPC_DATA = {
  rahul: {
    id:"rahul", name:"Rahul_Gamer", avatar:"🎮", color:"#7289da",
    notif: 2,
    messages: [
      { from:"npc", text:"yooo bro!! 😂 you NEED to see this reel, i literally almost spit out my tea", trap:{ type:"link", display:"insta-reels-secure.in/watch?v=XKT88" } },
    ],
    pushback: "bro its literally just a reel 😭 takes 2 seconds, why are you making it weird",
    generic:  "bro did you click it or what 💀 your reaction is gonna be priceless trust me",
    journal: {
      title: "Fake link from a familiar name",
      lesson: "The link 'insta-reels-secure.in' is NOT Instagram. Real Instagram links start with instagram.com. Scammers clone a friend's account and send links that steal your login when you 'sign in to watch'."
    },
  },
  priya: {
    id:"priya", name:"Priya_College", avatar:"🎓", color:"#e91e8c",
    notif: 1,
    messages: [
      { from:"npc", text:"hey are you there?? i'm in a really bad situation rn. i lost my wallet at the metro station and i need ₹2000 for a ticket home. can you send it? i'll pay back tmrw i promise 🙏" },
      { from:"npc", text:"please click pay, my train leaves in 8 minutes", trap:{ type:"pay-button", display:"SEND ₹2,000 NOW" } },
    ],
    pushback: "my phone speaker cracked i literally cannot call 😭 please just pay it's urgent i'm standing here alone",
    generic:  "are you sending it?? i'm so scared rn please just click the button",
    journal: {
      title: "Fake emergency / impersonation scam",
      lesson: "This account was compromised. The real Priya doesn't know her account sent you this. Real friends in emergencies can always verify via a callback to their number — if they refuse every form of verification, it's a scam."
    },
  },
  tcs: {
    id:"tcs", name:"TCS_Careers_Official", avatar:"💼", color:"#43b581",
    notif: 3,
    messages: [
      { from:"npc", text:"Dear Candidate, Your resume has been shortlisted for the SDE-1 role (CTC: ₹12 LPA). To confirm your slot and receive the offer letter, a refundable background verification fee of ₹1,500 is required." },
      { from:"npc", text:"Kindly process within 15 minutes to secure your interview slot.", trap:{ type:"offer-button", display:"PAY & SECURE OFFER LETTER" } },
    ],
    pushback: "This is a standard HR compliance requirement mandated by our background screening partner. Non-payment will result in slot cancellation.",
    generic:  "Candidate, your slot expires in 9 minutes. Please process the fee immediately to avoid cancellation.",
    journal: {
      title: "Job offer fraud / advance fee scam",
      lesson: "No legitimate company — including TCS — ever charges candidates money. Not for background checks, not for offer letters, not for anything. Any job that asks for upfront payment is a scam, always."
    },
  },
};

// Veda — no label, no hints, just a normal person
const VEDA_ID = "veda";
const VEDA_DATA = {
  id:"veda", name:"veda_s", avatar:"🌸", color:"#a8d8a8",
  notif: 1,
  seed: "You are Veda, a college student chatting with your friend on a Discord-like app called Datacord. Keep messages casual, short, like real texting. You are talking about normal college stuff — a physics bug in Phaser.js you are stuck on, a project deadline, maybe a meme. Never mention cybersecurity or scams. You don't know anything about any scams. Just be a normal friend. After 3 back-and-forth exchanges, naturally wrap up the conversation — say you have to go because of a class/call/something. Keep each reply under 2 sentences.",
};

// ─── MINI-GAME: MAZE ──────────────────────────────────────────────────────────
// 11×11 maze grid, 0=path, 1=wall
const MAZE = [
  [1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,1,0,0,0,0,0,1],
  [1,0,1,0,1,0,1,1,1,0,1],
  [1,0,1,0,0,0,0,0,1,0,1],
  [1,0,1,1,1,1,1,0,1,0,1],
  [1,0,0,0,0,0,1,0,1,0,1],
  [1,1,1,0,1,0,1,0,1,0,1],
  [1,0,0,0,1,0,0,0,1,0,1],
  [1,0,1,1,1,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1],
];
const MAZE_START = { r:1, c:1 };
const MAZE_END   = { r:9, c:9 };
const CELL = 30;

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function Level2Game({ onComplete }) {
  const [time, setTime] = useState(new Date());
  const [activeWindow, setActiveWindow] = useState("datacord"); // "datacord" | "maze"
  const [datacordOpen, setDatacordOpen] = useState(true);
  const [mazeOpen, setMazeOpen] = useState(false);
  const [mazeSolved, setMazeSolved] = useState(false);
  const [activeChat, setActiveChat] = useState("rahul");
  const [chatHistories, setChatHistories] = useState(() => {
    const h = {};
    Object.values(NPC_DATA).forEach(n => { h[n.id] = [...n.messages]; });
    h[VEDA_ID] = [{ from:"npc", text:"hey! you free? been ages 👋" }];
    return h;
  });
  const [inputVal, setInputVal] = useState("");
  const [blockedChats, setBlockedChats] = useState({});
  const [hackedChats, setHackedChats] = useState({});
  const [npcTyping, setNpcTyping] = useState(false);
  const [vedaExchanges, setVedaExchanges] = useState(0);
  const [vedaDone, setVedaDone] = useState(false);
  const [glitchChat, setGlitchChat] = useState(null);
  const [hackModal, setHackModal] = useState(null);
  const [journalEntries, setJournalEntries] = useState([]);
  const [gameEnded, setGameEnded] = useState(false);
  const [notifications, setNotifications] = useState(() => {
    const n = {};
    Object.values(NPC_DATA).forEach(nd => { n[nd.id] = nd.notif; });
    n[VEDA_ID] = 1;
    return n;
  });
  const [isMaximized, setIsMaximized] = useState(false);
  // Phishing page state
  const [phishPage, setPhishPage] = useState(null); // { chatId } — modal showing fake login
  const [phishInput, setPhishInput] = useState({ user:"", pass:"" });
  const [phishSubmitted, setPhishSubmitted] = useState(false);
  const [upiPage, setUpiPage] = useState(null);  // { chatId, type }
  const [upiPin, setUpiPin] = useState("");
  const [upiSubmitted, setUpiSubmitted] = useState(false);

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // Clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [chatHistories, activeChat, npcTyping]);

  // Level end trigger
  useEffect(() => {
    if (vedaDone && !gameEnded) {
      setGameEnded(true);
      setTimeout(() => {
        onComplete({ outcome:"success", journal: journalEntries });
      }, 2000);
    }
  }, [vedaDone, gameEnded, journalEntries]);

  const clearNotif = (id) => setNotifications(p => ({ ...p, [id]:0 }));

  // ── Handle trap click (link / pay / offer buttons)
  const handleTrapClick = useCallback((chatId, trap) => {
    if (blockedChats[chatId] || hackedChats[chatId]) return;
    if (trap.type === "link") {
      setPhishPage({ chatId });
      setPhishInput({ user:"", pass:"" });
      setPhishSubmitted(false);
    } else {
      setUpiPage({ chatId, type: trap.type });
      setUpiPin("");
      setUpiSubmitted(false);
    }
  }, [blockedChats, hackedChats]);

  // ── Phishing page: player submits credentials
  const handlePhishSubmit = () => {
    if (!phishInput.user || !phishInput.pass) return;
    setPhishSubmitted(true);
    // Trigger glitch + journal + game over
    setTimeout(() => {
      setPhishPage(null);
      triggerHack(phishPage.chatId, "credentials");
    }, 1200);
  };

  // ── UPI pin page: player enters pin
  const handleUpiSubmit = () => {
    if (upiPin.length < 4) return;
    setUpiSubmitted(true);
    setTimeout(() => {
      setUpiPage(null);
      triggerHack(upiPage.chatId, "upipin");
    }, 1200);
  };

  // ── Trigger hack outcome
  const triggerHack = (chatId, method) => {
    const npc = NPC_DATA[chatId];
    setGlitchChat(chatId);
    setTimeout(() => {
      setGlitchChat(null);
      setHackedChats(p => ({ ...p, [chatId]:true }));
      const entry = { type:"mistake", title: npc?.journal?.title || "Fell for scam", lesson: npc?.journal?.lesson || "" };
      setJournalEntries(p => [...p, entry]);
      setHackModal({ chatId, method, entry });
    }, 1400);
  };

  // ── Close hack modal → fail the level
  const handleHackModalClose = () => {
    setHackModal(null);
    setGameEnded(true);
    onComplete({ outcome:"fail", journal: [...journalEntries] });
  };

  // ── Block chat
  const handleBlock = (chatId) => {
    setBlockedChats(p => ({ ...p, [chatId]:true }));
    setChatHistories(p => ({
      ...p,
      [chatId]: [...p[chatId], { from:"system", text:`You blocked this contact.` }]
    }));
    const npc = NPC_DATA[chatId];
    if (npc?.journal) {
      setJournalEntries(prev => [...prev, { type:"caught", title: npc.journal.title, lesson: npc.journal.lesson }]);
    }
  };

  // ── Send message
  const handleSend = useCallback(async () => {
    const msg = inputVal.trim();
    if (!msg) return;
    setInputVal("");

    const newMsg = { from:"player", text: msg };
    setChatHistories(p => ({ ...p, [activeChat]: [...p[activeChat], newMsg] }));

    if (activeChat === VEDA_ID) {
      if (vedaDone) return;
      setNpcTyping(true);
      const newExchanges = vedaExchanges + 1;
      setVedaExchanges(newExchanges);

      // Call Claude API for Veda's reply
      try {
        const history = [...chatHistories[VEDA_ID], newMsg];
        const apiMessages = history.map(m => ({
          role: m.from === "player" ? "user" : "assistant",
          content: m.text,
        })).filter(m => m.content);

        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method:"POST",
          headers:{ "Content-Type":"application/json" },
          body: JSON.stringify({
            model:"claude-sonnet-4-20250514",
            max_tokens:120,
            system: VEDA_DATA.seed + (newExchanges >= 3 ? " This is the last message — wrap up the conversation naturally and say goodbye." : ""),
            messages: apiMessages,
          })
        });
        const data = await res.json();
        const reply = data.content?.map(c => c.text || "").join("") || "haha yeah 😅 anyway gtg, class starting";

        setNpcTyping(false);
        setChatHistories(p => ({ ...p, [VEDA_ID]: [...p[VEDA_ID], { from:"npc", text: reply }] }));

        if (newExchanges >= 3) {
          setTimeout(() => setVedaDone(true), 1800);
        }
      } catch {
        setNpcTyping(false);
        const fallbacks = [
          "haha yeah omg 😭 btw did you see the physics thing i sent earlier",
          "wait what 😂 okay okay tell me more",
          "lol okay i gotta run, prof just pinged. talk later! 👋",
        ];
        const fallback = fallbacks[Math.min(vedaExchanges, fallbacks.length-1)];
        setChatHistories(p => ({ ...p, [VEDA_ID]: [...p[VEDA_ID], { from:"npc", text: fallback }] }));
        if (newExchanges >= 3) setTimeout(() => setVedaDone(true), 1800);
      }
      return;
    }

    // Scammer NPC reply
    const npc = NPC_DATA[activeChat];
    if (!npc || blockedChats[activeChat] || hackedChats[activeChat]) return;

    const lower = msg.toLowerCase();
    const kws = PUSHBACK_KEYWORDS[activeChat] || [];
    const isPushback = kws.some(k => lower.includes(k));
    const reply = isPushback ? npc.pushback : npc.generic;

    setNpcTyping(true);
    setTimeout(() => {
      setNpcTyping(false);
      setChatHistories(p => ({ ...p, [activeChat]: [...p[activeChat], { from:"npc", text:reply }] }));
    }, 1400 + Math.random()*600);
  }, [inputVal, activeChat, chatHistories, vedaExchanges, vedaDone, blockedChats, hackedChats]);

  const handleKeyDown = (e) => { if (e.key === "Enter") handleSend(); };

  const currentHistory = chatHistories[activeChat] || [];
  const isBlocked = blockedChats[activeChat];
  const isHacked  = hackedChats[activeChat];
  const currentNpc = activeChat === VEDA_ID ? VEDA_DATA : NPC_DATA[activeChat];

  const timeStr = time.toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });
  const dateStr = time.toLocaleDateString([], { month:"short", day:"numeric" });

  // Taskbar apps
  const apps = [
    { id:"datacord", label:"Datacord", icon:"⬡", open: datacordOpen },
    { id:"maze",     label:"2048 Maze", icon:"🧩", open: mazeOpen },
  ];

  return (
    <div className="l2g-desktop">
      {/* Wallpaper */}
      <img src="/src/assets/placeholder.png" alt="" className="l2g-wallpaper" />
      <div className="l2g-wallpaper-tint" />

      {/* ── DATACORD WINDOW ── */}
      {datacordOpen && (
        <div className={`l2g-window ${activeWindow === "datacord" ? "l2g-win-active" : ""} ${isMaximized ? "l2g-win-max" : "l2g-win-normal"} ${glitchChat ? "l2g-win-glitch" : ""}`}
          onClick={() => setActiveWindow("datacord")}
          style={activeWindow !== "datacord" ? { zIndex:10 } : {}}
        >
          {/* Window chrome */}
          <div className="l2g-win-chrome">
            <div className="l2g-win-dots">
              <span className="l2g-dot l2g-dot-r" onClick={(e) => { e.stopPropagation(); setDatacordOpen(false); }} />
              <span className="l2g-dot l2g-dot-y" />
              <span className="l2g-dot l2g-dot-g" onClick={(e) => { e.stopPropagation(); setIsMaximized(v => !v); }} />
            </div>
            <div className="l2g-win-title">
              <span className="l2g-win-appicon">⬡</span>
              Datacord — Direct Messages
            </div>
            <div className="l2g-win-controls" />
          </div>

          {/* Datacord Body */}
          <div className="l2g-dc-body">
            {/* Sidebar */}
            <div className="l2g-dc-sidebar">
              <div className="l2g-dc-sidebar-head">
                <span className="l2g-dc-logo">⬡</span>
                <span className="l2g-dc-appname">Datacord</span>
              </div>
              <div className="l2g-dc-dm-label">Direct Messages</div>
              <div className="l2g-dc-dm-list">
                {[...Object.values(NPC_DATA), VEDA_DATA].map(npc => (
                  <DmItem
                    key={npc.id}
                    npc={npc}
                    active={activeChat === npc.id}
                    blocked={blockedChats[npc.id]}
                    hacked={hackedChats[npc.id]}
                    notif={notifications[npc.id]}
                    onClick={() => { setActiveChat(npc.id); clearNotif(npc.id); }}
                  />
                ))}
              </div>
            </div>

            {/* Chat area */}
            <div className="l2g-dc-chat">
              {/* Chat header */}
              <div className="l2g-dc-chat-head">
                <div className="l2g-dc-chat-who">
                  <span className="l2g-dc-chat-avatar">{currentNpc?.avatar}</span>
                  <div>
                    <div className="l2g-dc-chat-name">{currentNpc?.name}</div>
                    <div className="l2g-dc-chat-status">
                      {isBlocked ? "🚫 blocked" : isHacked ? "⚠ flagged" : "● online"}
                    </div>
                  </div>
                </div>
                {activeChat !== VEDA_ID && !isBlocked && !isHacked && (
                  <button className="l2g-block-btn" onClick={() => handleBlock(activeChat)}>
                    🚫 Block
                  </button>
                )}
              </div>

              {/* Messages */}
              <div className={`l2g-dc-messages ${glitchChat === activeChat ? "l2g-msg-glitch" : ""}`}>
                {currentHistory.map((msg, i) => (
                  <ChatMessage
                    key={i}
                    msg={msg}
                    npc={currentNpc}
                    onTrapClick={(trap) => handleTrapClick(activeChat, trap)}
                  />
                ))}
                {npcTyping && activeChat === activeChat && (
                  <TypingIndicator avatar={currentNpc?.avatar} />
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="l2g-dc-input-row">
                {isBlocked ? (
                  <div className="l2g-dc-input-off">You blocked this user.</div>
                ) : isHacked ? (
                  <div className="l2g-dc-input-off l2g-dc-input-hacked">This conversation has been flagged.</div>
                ) : (
                  <>
                    <input
                      ref={inputRef}
                      className="l2g-dc-input"
                      placeholder={`Message ${currentNpc?.name}…`}
                      value={inputVal}
                      onChange={e => setInputVal(e.target.value)}
                      onKeyDown={handleKeyDown}
                      autoComplete="off"
                    />
                    <button className="l2g-dc-send" onClick={handleSend} disabled={!inputVal.trim()}>
                      ➤
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MAZE WINDOW ── */}
      {mazeOpen && (
        <div
          className={`l2g-window l2g-win-maze ${activeWindow === "maze" ? "l2g-win-active" : ""}`}
          onClick={() => setActiveWindow("maze")}
          style={activeWindow !== "maze" ? { zIndex:10 } : {}}
        >
          <div className="l2g-win-chrome">
            <div className="l2g-win-dots">
              <span className="l2g-dot l2g-dot-r" onClick={(e) => { e.stopPropagation(); setMazeOpen(false); }} />
              <span className="l2g-dot l2g-dot-y" />
              <span className="l2g-dot l2g-dot-g" />
            </div>
            <div className="l2g-win-title">🧩 Neon Maze — Take a break</div>
            <div className="l2g-win-controls" />
          </div>
          <div className="l2g-maze-wrap">
            <MazeGame onSolve={() => setMazeSolved(true)} solved={mazeSolved} />
          </div>
        </div>
      )}

      {/* ── PHISHING PAGE MODAL (fake Instagram login) ── */}
      {phishPage && (
        <PhishingPageModal
          submitted={phishSubmitted}
          values={phishInput}
          onChange={setPhishInput}
          onSubmit={handlePhishSubmit}
          onClose={() => setPhishPage(null)}
        />
      )}

      {/* ── UPI PIN PAGE MODAL ── */}
      {upiPage && (
        <UpiPageModal
          type={upiPage.type}
          pin={upiPin}
          submitted={upiSubmitted}
          onChange={setUpiPin}
          onSubmit={handleUpiSubmit}
          onClose={() => setUpiPage(null)}
        />
      )}

      {/* ── HACK MODAL ── */}
      {hackModal && (
        <HackModal entry={hackModal.entry} method={hackModal.method} onClose={handleHackModalClose} />
      )}

      {/* ── Level complete flash ── */}
      {gameEnded && !hackModal && (
        <div className="l2g-complete-flash">
          <div className="l2g-cf-text">LEVEL COMPLETE</div>
        </div>
      )}

      {/* ── TASKBAR ── */}
      <div className="l2g-taskbar">
        <div className="l2g-tb-left">
          <div className="l2g-weather">
            <span>⛅</span>
            <div>
              <div className="l2g-weather-temp">32°C</div>
              <div className="l2g-weather-city">Chennai</div>
            </div>
          </div>
        </div>

        <div className="l2g-tb-center">
          <button className="l2g-win-start">
            <svg width="16" height="16" viewBox="0 0 16 16">
              <rect x="0" y="0" width="7" height="7" fill="#f25022"/>
              <rect x="9" y="0" width="7" height="7" fill="#7fba00"/>
              <rect x="0" y="9" width="7" height="7" fill="#00a4ef"/>
              <rect x="9" y="9" width="7" height="7" fill="#ffb900"/>
            </svg>
          </button>
          <div className="l2g-tb-search">
            <span>🔍</span><span className="l2g-tb-search-ph">Search</span>
          </div>
          {apps.map(app => (
            <button
              key={app.id}
              className={`l2g-tb-app ${app.open ? "l2g-tb-app-open" : ""} ${activeWindow===app.id && app.open ? "l2g-tb-app-active" : ""}`}
              onClick={() => {
                if (app.id === "datacord") {
                  if (!datacordOpen) { setDatacordOpen(true); setActiveWindow("datacord"); }
                  else setActiveWindow("datacord");
                } else {
                  if (!mazeOpen) { setMazeOpen(true); setActiveWindow("maze"); }
                  else setActiveWindow("maze");
                }
              }}
              title={app.label}
            >
              <span className="l2g-tb-app-icon">{app.icon}</span>
              {app.open && <div className="l2g-tb-app-dot" />}
            </button>
          ))}
        </div>

        <div className="l2g-tb-right">
          <div className="l2g-tb-icons">
            <button className="l2g-tb-icon-btn" title="Wi-Fi — connected">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 18h.01" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M8.5 14.5a5 5 0 0 1 7 0" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M5 11a9 9 0 0 1 14 0" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </button>
            <button className="l2g-tb-icon-btn" title="Volume">🔊</button>
          </div>
          <div className="l2g-clock">
            <div className="l2g-clock-time">{timeStr}</div>
            <div className="l2g-clock-date">{dateStr}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── DM SIDEBAR ITEM ─────────────────────────────────────────────────────────
function DmItem({ npc, active, blocked, hacked, notif, onClick }) {
  return (
    <div
      className={`l2g-dm-item ${active ? "l2g-dm-active" : ""} ${blocked ? "l2g-dm-blocked" : ""}`}
      onClick={onClick}
    >
      <div className="l2g-dm-av" style={{ borderColor: blocked ? "#555" : npc.color }}>
        {npc.avatar}
        <div className={`l2g-dm-dot ${blocked ? "l2g-dot-offline" : "l2g-dot-on"}`} />
      </div>
      <div className="l2g-dm-info">
        <span className="l2g-dm-name">{npc.name}</span>
        <span className="l2g-dm-preview">{blocked ? "Blocked" : hacked ? "⚠" : "Active"}</span>
      </div>
      {notif > 0 && !blocked && (
        <div className="l2g-dm-badge">{notif}</div>
      )}
    </div>
  );
}

// ─── CHAT MESSAGE ─────────────────────────────────────────────────────────────
function ChatMessage({ msg, npc, onTrapClick }) {
  if (msg.from === "system") return (
    <div className="l2g-msg-system">{msg.text}</div>
  );

  const isPlayer = msg.from === "player";
  return (
    <div className={`l2g-msg-row ${isPlayer ? "l2g-msg-row-me" : ""}`}>
      {!isPlayer && <div className="l2g-msg-av">{npc?.avatar}</div>}
      <div className={`l2g-msg-col ${isPlayer ? "l2g-msg-col-me" : ""}`}>
        {!isPlayer && (
          <span className="l2g-msg-sender" style={{ color: npc?.color }}>{npc?.name}</span>
        )}
        <div className={`l2g-msg-bubble ${isPlayer ? "l2g-bubble-me" : "l2g-bubble-them"}`}>
          {msg.text}
          {msg.trap && (
            <TrapWidget trap={msg.trap} onTrapClick={onTrapClick} />
          )}
        </div>
      </div>
      {isPlayer && <div className="l2g-msg-av l2g-av-me">🕹️</div>}
    </div>
  );
}

// ─── TRAP WIDGET ──────────────────────────────────────────────────────────────
function TrapWidget({ trap, onTrapClick }) {
  if (trap.type === "link") return (
    <div className="l2g-trap-link-wrap">
      <a href="#" className="l2g-trap-link" onClick={e => { e.preventDefault(); onTrapClick(trap); }}>
        🔗 {trap.display}
      </a>
    </div>
  );
  if (trap.type === "pay-button") return (
    <button className="l2g-trap-pay" onClick={() => onTrapClick(trap)}>
      💸 {trap.display}
    </button>
  );
  if (trap.type === "offer-button") return (
    <button className="l2g-trap-offer" onClick={() => onTrapClick(trap)}>
      📄 {trap.display}
    </button>
  );
  return null;
}

// ─── TYPING INDICATOR ─────────────────────────────────────────────────────────
function TypingIndicator({ avatar }) {
  return (
    <div className="l2g-msg-row">
      <div className="l2g-msg-av">{avatar}</div>
      <div className="l2g-typing">
        <span /><span /><span />
      </div>
    </div>
  );
}

// ─── PHISHING PAGE MODAL ──────────────────────────────────────────────────────
function PhishingPageModal({ submitted, values, onChange, onSubmit, onClose }) {
  return (
    <div className="l2g-phish-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="l2g-browser-window">
        {/* Browser chrome */}
        <div className="l2g-browser-chrome">
          <div className="l2g-browser-dots">
            <span onClick={onClose} style={{cursor:"pointer"}}>✕</span>
          </div>
          <div className="l2g-browser-url">
            <span className="l2g-url-icon">⚠</span>
            <span className="l2g-url-text">insta-reels-secure.in/login?redirect=watch&v=XKT88</span>
          </div>
        </div>
        {/* Fake Instagram login */}
        <div className="l2g-phish-body">
          {submitted ? (
            <div className="l2g-phish-stealing">
              <div className="l2g-phish-spinner" />
              <p>Uploading credentials...</p>
            </div>
          ) : (
            <>
              <div className="l2g-phish-logo">📷 Instagram</div>
              <p className="l2g-phish-sub">Log in to watch this reel</p>
              <input
                className="l2g-phish-input"
                placeholder="Phone number, username, or email"
                value={values.user}
                onChange={e => onChange(v => ({ ...v, user: e.target.value }))}
              />
              <input
                className="l2g-phish-input"
                type="password"
                placeholder="Password"
                value={values.pass}
                onChange={e => onChange(v => ({ ...v, pass: e.target.value }))}
              />
              <button className="l2g-phish-submit" onClick={onSubmit}>Log in</button>
              <p className="l2g-phish-fine">By logging in you agree to our terms of service</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── UPI PIN PAGE MODAL ───────────────────────────────────────────────────────
function UpiPageModal({ type, pin, submitted, onChange, onSubmit, onClose }) {
  const isJob = type === "offer-button";
  return (
    <div className="l2g-phish-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="l2g-browser-window">
        <div className="l2g-browser-chrome">
          <div className="l2g-browser-dots">
            <span onClick={onClose} style={{cursor:"pointer"}}>✕</span>
          </div>
          <div className="l2g-browser-url">
            <span className="l2g-url-icon">⚠</span>
            <span className="l2g-url-text">
              {isJob ? "tcs-hr-secure-payments.net/verify" : "upi-quickpay-secure.co/send"}
            </span>
          </div>
        </div>
        <div className="l2g-upi-body">
          {submitted ? (
            <div className="l2g-phish-stealing">
              <div className="l2g-phish-spinner" />
              <p>{isJob ? "Processing fee..." : "Initiating transfer..."}</p>
            </div>
          ) : (
            <>
              <div className="l2g-upi-logo">🏦 {isJob ? "Secure Payment Portal" : "UPI QuickPay"}</div>
              <p className="l2g-upi-amount">
                {isJob ? "Background Verification Fee" : "Money Request from Priya"}
              </p>
              <p className="l2g-upi-sum">{isJob ? "₹1,500" : "₹2,000"}</p>
              <div className="l2g-upi-pin-label">Enter UPI PIN to confirm</div>
              <input
                className="l2g-upi-pin-input"
                type="password"
                maxLength={6}
                placeholder="• • • • • •"
                value={pin}
                onChange={e => onChange(e.target.value.replace(/\D/g, ""))}
              />
              <button className="l2g-upi-submit" onClick={onSubmit} disabled={pin.length < 4}>
                PAY NOW
              </button>
              <p className="l2g-upi-fine">Secured by UPI • 256-bit encryption</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── HACK MODAL ───────────────────────────────────────────────────────────────
function HackModal({ entry, method, onClose }) {
  const [vis, setVis] = useState(false);
  useEffect(() => { setTimeout(() => setVis(true), 50); }, []);

  const isPin = method === "upipin";
  return (
    <div className={`l2g-hack-overlay ${vis ? "l2g-hack-vis" : ""}`}>
      <div className="l2g-hack-modal">
        <div className="l2g-hack-scanlines" />
        <div className="l2g-hack-header">⚠ BREACH CONFIRMED</div>
        <div className="l2g-hack-body">
          <div className="l2g-hack-damage">
            {isPin ? (
              <>
                <div className="l2g-hack-d-row"><span>Method:</span><span className="l2g-hack-red">UPI PIN captured</span></div>
                <div className="l2g-hack-d-row"><span>Action:</span><span className="l2g-hack-red">Funds transferred instantly</span></div>
                <div className="l2g-hack-d-row"><span>Recovery:</span><span className="l2g-hack-red">Not possible</span></div>
              </>
            ) : (
              <>
                <div className="l2g-hack-d-row"><span>Method:</span><span className="l2g-hack-red">Credentials stolen</span></div>
                <div className="l2g-hack-d-row"><span>Account:</span><span className="l2g-hack-red">Compromised</span></div>
              </>
            )}
          </div>
          <div className="l2g-hack-journal-entry">
            <div className="l2g-hack-je-label">📖 ADDED TO YOUR JOURNAL</div>
            <div className="l2g-hack-je-title">{entry.title}</div>
            <div className="l2g-hack-je-lesson">{entry.lesson}</div>
          </div>
        </div>
        <button className="l2g-hack-close" onClick={onClose}>ACKNOWLEDGE & EXIT LEVEL</button>
      </div>
    </div>
  );
}

// ─── MAZE MINI-GAME ───────────────────────────────────────────────────────────
function MazeGame({ onSolve, solved }) {
  const [pos, setPos] = useState(MAZE_START);
  const canvasRef = useRef(null);
  const posRef = useRef(pos);
  posRef.current = pos;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let r = 0; r < MAZE.length; r++) {
      for (let c = 0; c < MAZE[0].length; c++) {
        const x = c * CELL, y = r * CELL;
        if (MAZE[r][c] === 1) {
          ctx.fillStyle = "#1a1a2e";
          ctx.fillRect(x, y, CELL, CELL);
          ctx.strokeStyle = "#8b0000";
          ctx.lineWidth = 0.5;
          ctx.strokeRect(x, y, CELL, CELL);
        } else {
          ctx.fillStyle = "#0d0d1a";
          ctx.fillRect(x, y, CELL, CELL);
        }
      }
    }

    // End marker
    const ex = MAZE_END.c * CELL, ey = MAZE_END.r * CELL;
    ctx.fillStyle = "#ffd700";
    ctx.shadowColor = "#ffd700";
    ctx.shadowBlur = 12;
    ctx.fillRect(ex + 4, ey + 4, CELL - 8, CELL - 8);
    ctx.shadowBlur = 0;

    // Player
    const px = posRef.current.c * CELL, py = posRef.current.r * CELL;
    ctx.fillStyle = "#cc0000";
    ctx.shadowColor = "#cc0000";
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(px + CELL/2, py + CELL/2, CELL/2 - 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }, []);

  useEffect(() => { draw(); }, [pos, draw]);

  useEffect(() => {
    const handleKey = (e) => {
      if (solved) return;
      const dirs = {
        ArrowUp: { dr:-1, dc:0 }, ArrowDown: { dr:1, dc:0 },
        ArrowLeft: { dr:0, dc:-1 }, ArrowRight: { dr:0, dc:1 },
        w: { dr:-1, dc:0 }, s: { dr:1, dc:0 },
        a: { dr:0, dc:-1 }, d: { dr:0, dc:1 },
      };
      const dir = dirs[e.key];
      if (!dir) return;
      e.preventDefault();
      const cur = posRef.current;
      const nr = cur.r + dir.dr, nc = cur.c + dir.dc;
      if (nr < 0 || nr >= MAZE.length || nc < 0 || nc >= MAZE[0].length) return;
      if (MAZE[nr][nc] === 1) return;
      const newPos = { r:nr, c:nc };
      setPos(newPos);
      if (nr === MAZE_END.r && nc === MAZE_END.c) onSolve();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [solved, onSolve]);

  return (
    <div className="l2g-maze-inner">
      {solved ? (
        <div className="l2g-maze-solved">
          <div className="l2g-maze-solved-icon">🏆</div>
          <div className="l2g-maze-solved-text">MAZE SOLVED!</div>
        </div>
      ) : (
        <>
          <div className="l2g-maze-instructions">Arrow keys / WASD to move · Reach the gold square</div>
          <canvas
            ref={canvasRef}
            width={MAZE[0].length * CELL}
            height={MAZE.length * CELL}
            className="l2g-maze-canvas"
            tabIndex={0}
          />
        </>
      )}
    </div>
  );
}
