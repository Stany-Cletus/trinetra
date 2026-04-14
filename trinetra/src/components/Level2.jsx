import { useEffect, useRef, useState } from "react";
import Level2Game from "./Level2Game";
import "./Level2.css";

const STAGES = {
  MRX_LANDING: "mrx_landing",
  BUFFERING: "buffering",
  NO_NETWORK: "no_network",
  TASKBAR: "taskbar",
  WIFI_DIALOG: "wifi_dialog",
  WARNING: "warning",
  PASSWORD: "password",
  MAZE_GAME: "maze_game",
  PENCIL_GAME: "pencil_game",
  UPLOAD: "upload",
  COMPLETE: "complete",
};

const WIFI_NETWORKS = [
  { id: "IITT", label: "IITT", status: "Free", type: "free" },
  { id: "Darknet", label: "Darknet", status: "Password required", type: "password" },
  { id: "Thiruvarul", label: "Thiruvarul", status: "Password required", type: "password" },
  { id: "BlueWave", label: "BlueWave", status: "Password required", type: "password" },
];

const PENCILS = [
  { id: 1, order: 1, label: "Red Pencil", color: "#ef476f" },
  { id: 2, order: 2, label: "Yellow Pencil", color: "#ffd166" },
  { id: 3, order: 3, label: "Green Pencil", color: "#06d6a0" },
  { id: 4, order: 4, label: "Blue Pencil", color: "#118ab2" },
  { id: 5, order: 5, label: "Purple Pencil", color: "#7209b7" },
  { id: 6, order: 6, label: "Orange Pencil", color: "#fb8500" },
  { id: 7, order: 7, label: "Teal Pencil", color: "#8ac926" },
  { id: 8, order: 8, label: "Navy Pencil", color: "#073b4c" },
];

function shuffle(array) {
  const list = [...array];
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

function formatTime(date) {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const suffix = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  const mins = minutes.toString().padStart(2, "0");
  return `${hours}:${mins} ${suffix}`;
}

export default function Level2() {
  const [stage, setStage] = useState(STAGES.MRX_LANDING);
  const [showWifiPanel, setShowWifiPanel] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState("IITT");
  const [password, setPassword] = useState("");
  const [wifiError, setWifiError] = useState("");
  const [pencils, setPencils] = useState(() => shuffle(PENCILS));
  const [nextOrder, setNextOrder] = useState(1);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [fileName, setFileName] = useState("No file chosen");
  const [fileUploaded, setFileUploaded] = useState(false);
  const [uploadedPhoto, setUploadedPhoto] = useState(null);
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [totalCoins, setTotalCoins] = useState(0);
  const [currentTime, setCurrentTime] = useState(() => formatTime(new Date()));
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (stage === STAGES.BUFFERING) {
      const timer = setTimeout(() => setStage(STAGES.NO_NETWORK), 2000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [stage]);

  useEffect(() => {
    if (stage === STAGES.NO_NETWORK) {
      const timer = setTimeout(() => setStage(STAGES.TASKBAR), 2000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [stage]);

  useEffect(() => {
    if (stage === STAGES.WARNING) {
      const timer = setTimeout(() => {
        setStage(STAGES.TASKBAR);
        setShowWifiPanel(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [stage]);

  useEffect(() => {
    if (stage === STAGES.PENCIL_GAME && gameFinished) {
      const timer = setTimeout(() => setStage(STAGES.UPLOAD), 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [stage, gameFinished]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(formatTime(new Date()));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (stage === STAGES.PENCIL_GAME && pencils.length === 0) {
      setGameFinished(true);
    }
  }, [pencils, stage]);

  const handleExplore = () => {
    setStage(STAGES.BUFFERING);
  };

  const handleOpenWifi = () => {
    if (stage === STAGES.TASKBAR) {
      setShowWifiPanel(true);
    }
    setWifiError("");
  };

  const handleMazeQuit = (collectedCoins) => {
    setTotalCoins((prev) => prev + collectedCoins);
    setStage(STAGES.UPLOAD);
  };

  const handleMazeComplete = (collectedCoins) => {
    setTotalCoins((prev) => prev + collectedCoins + 100);
    setStage(STAGES.UPLOAD);
  };

  const handleCloseWifiPanel = () => {
    setShowWifiPanel(false);
  };

  const handleSelectNetwork = (id) => {
    setSelectedNetwork(id);
    setWifiError("");
  };

  const handleWifiConnect = (networkId) => {
    const chosenNetwork = WIFI_NETWORKS.find((item) => item.id === networkId) || WIFI_NETWORKS.find((item) => item.id === selectedNetwork);
    if (!chosenNetwork) return;
    setSelectedNetwork(chosenNetwork.id);
    setShowWifiPanel(false);
    setStage(STAGES.MAZE_GAME);
  };

  const handlePasswordConnect = () => {
    if (!password.trim()) {
      setWifiError("Enter the network name as password.");
      return;
    }
    if (password.trim() !== selectedNetwork) {
      setWifiError("Password incorrect. Use the exact network name.");
      return;
    }
    setStage(STAGES.PENCIL_GAME);
  };

  const handlePencilClick = (pencil) => {
    if (gameFinished) return;
    if (pencil.order === nextOrder) {
      setCorrectCount((count) => count + 1);
      setCoinsEarned((coins) => coins + 10);
      setPencils((list) => list.filter((item) => item.id !== pencil.id));
      setNextOrder((order) => order + 1);
    } else {
      setWrongCount((count) => {
        const next = count + 1;
        if (next >= 3) {
          setGameFinished(true);
        }
        return next;
      });
      setPencils((list) => list.filter((item) => item.id !== pencil.id));
    }
  };

  const handleEndGame = () => {
    setStage(STAGES.UPLOAD);
  };

  const handleContinueAfterGame = () => {
    setStage(STAGES.UPLOAD);
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFileUploaded(true);
      setUploadedPhoto(URL.createObjectURL(file));
    }
  };

  const handleConfirmUpload = (event) => {
    const isChecked = event.target.checked;
    setCheckboxChecked(isChecked);
    if (isChecked) {
      setStage(STAGES.COMPLETE);
    }
  };

  const networkRows = WIFI_NETWORKS.map((network) => (
    <div
      key={network.id}
      className={`wifi-item ${selectedNetwork === network.id ? "selected" : ""}`}
      onClick={() => handleSelectNetwork(network.id)}
    >
      <div className="wifi-info">
        <span className="wifi-network-name">{network.label}</span>
        <span className="wifi-network-status">{network.status}</span>
      </div>
      <button
        type="button"
        className="wifi-connect"
        onClick={(e) => {
          e.stopPropagation();
          handleWifiConnect(network.id);
        }}
      >
        Connect
      </button>
    </div>
  ));

  const pencilButtons = pencils.map((pencil) => (
    <button
      key={pencil.id}
      type="button"
      className="pencil-card"
      onClick={() => handlePencilClick(pencil)}
      style={{ background: pencil.color }}
    >
      <span>{pencil.label}</span>
      <strong>#{pencil.order}</strong>
    </button>
  ));

  return (
    <div className="level2-page">
      <div className="level2-logo-top">
        <img src="/src/assets/Trinetra_logo.png" alt="Trinetra" />
      </div>

      {stage === STAGES.MRX_LANDING && (
        <div className="l2-landing-panel" style={{ backgroundImage: "url(/src/assets/MrX.png)" }}>
          <div className="l2-landing-left">
            <button className="l2-explore-btn" onClick={handleExplore}>
              EXPLORE THE WORLD<br />FULL OF ADVENTURES
            </button>
          </div>
        </div>
      )}

      {stage === STAGES.BUFFERING && (
        <div className="l2-landing-panel l2-buffering-page">
          <div className="buffering-screen">
            <div className="spinner" />
            <p>Searching to connect...</p>
          </div>
        </div>
      )}

      {stage === STAGES.NO_NETWORK && (
        <div className="l2-no-network-page">
          <div className="no-network-card">
            <h2>NO NETWORK CONNECTED</h2>
            <p>Connect to a nearby network so as to play the game.</p>
          </div>
        </div>
      )}

      {stage === STAGES.TASKBAR && (
        <div className="l2-taskbar-panel">
          <div className="taskbar-screen">
            <div className="taskbar-bottom">

              {/* LEFT */}
              <div className="taskbar-left">
                <div className="tb-weather">
                  <span>☀️</span>
                  <span>39°C Sunny</span>
                </div>
              </div>

              {/* CENTER */}
              <div className="taskbar-center">

                    {/* Windows */}
                    <button className="tb-icon-btn">
                      <svg width="18" height="18" viewBox="0 0 24 24">
                        <rect x="0" y="0" width="10" height="10" fill="#f25022"/>
                        <rect x="14" y="0" width="10" height="10" fill="#7fba00"/>
                        <rect x="0" y="14" width="10" height="10" fill="#00a4ef"/>
                        <rect x="14" y="14" width="10" height="10" fill="#ffb900"/>
                      </svg>
                    </button>

                    {/* Search */}
                    <div className="tb-search">
                      <span>🔍</span>
                      <span>Search</span>
                    </div>

                    {/* Chrome */}
                    <button className="tb-icon-btn">
                      <svg width="18" height="18" viewBox="0 0 48 48">
                        <path fill="#EA4335" d="M24 9.5c3.9 0 7.5 1.5 10.2 4H24c-5.5 0-10 4.5-10 10 0 1.7.4 3.2 1.2 4.6L9.3 17.5C11.8 12.6 17.4 9.5 24 9.5z"/>
                        <path fill="#FBBC05" d="M34.2 13.5c2.7 2.5 4.3 6.1 4.3 10.5 0 8.3-6.7 15-15 15-5.6 0-10.4-3-13-7.5l6-10.4c1.7 2.9 4.9 4.9 8.5 4.9 5.5 0 10-4.5 10-10 0-.9-.1-1.8-.3-2.6z"/>
                        <path fill="#34A853" d="M10.5 31.5C8.8 28.9 8 25.9 8 24c0-2.4.5-4.7 1.3-6.5l6 10.6c-.3.8-.5 1.7-.5 2.6 0 5.5 4.5 10 10 10 3.3 0 6.3-1.6 8.1-4l-6.1-10.5c-.9.3-1.8.5-2.8.5-3.9 0-7.3-2.2-9-5.4L10.5 31.5z"/>
                        <circle cx="24" cy="24" r="6" fill="#4285F4"/>
                      </svg>
                    </button>

                    {/* File Explorer */}
                    <button className="tb-icon-btn">
                      <svg width="18" height="18" viewBox="0 0 24 24">
                        <path d="M3 7h6l2 2h10v8a2 2 0 0 1-2 2H3z" fill="#fbbc05"/>
                        <path d="M3 7h6l2 2H3z" fill="#fdd663"/>
                      </svg>
                    </button>

                  </div>

                  {/* RIGHT */}
                  <div className="taskbar-right">

                    {/* WiFi */}
                    <span className="tb-icon" onClick={handleOpenWifi}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M2 8a16 16 0 0 1 20 0" stroke="white" strokeWidth="1.5"/>
                        <path d="M5 11a11 11 0 0 1 14 0" stroke="white" strokeWidth="1.5"/>
                        <path d="M8 14a6 6 0 0 1 8 0" stroke="white" strokeWidth="1.5"/>
                        <circle cx="12" cy="18" r="1" fill="white"/>
                      </svg>
                    </span>

                    {/* Volume */}
                    <span className="tb-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M5 10v4h3l4 4V6L8 10H5z" stroke="white" strokeWidth="1.5"/>
                        <path d="M16 9a4 4 0 0 1 0 6" stroke="white" strokeWidth="1.5"/>
                      </svg>
                    </span>

                    {/* Battery */}
                    <span className="tb-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <rect x="2" y="7" width="18" height="10" rx="2" stroke="white" strokeWidth="1.5"/>
                        <rect x="20" y="10" width="2" height="4" fill="white"/>
                      </svg>
                    </span>

                    {/* Time + Date */}
                    <div className="tb-time">
                      <span>
                        {new Date().toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </span>
                      <span>
                        {new Date().toLocaleDateString('en-GB')}
                      </span>
                    </div>

                  </div>
                </div>
                {showWifiPanel && (
                  <div className="wifi-side-panel">
                    <div className="wifi-dialog">
                      <div className="wifi-header">
                        <h2>Wi-Fi</h2>
                      </div>
                      <div className="wifi-list">{networkRows}</div>
                      <button type="button" className="wifi-close" onClick={handleCloseWifiPanel}>
                        Close
                      </button>
                    </div>
                  </div>
                )}
          </div>
        </div>
      )}


      {stage === STAGES.WARNING && (
        <div className="l2-panel warning-screen">
          <div className="warning-card">
            <h2>Warning</h2>
            <p>
              You already had a bad experience. Kindly choose a safer network.
            </p>
          </div>
        </div>
      )}

      {stage === STAGES.PASSWORD && (
        <div className="l2-panel">
          <div className="password-card">
            <h2>{selectedNetwork} requires a password</h2>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setWifiError("");
              }}
              placeholder="Password"
            />
            {wifiError && <p className="error-text">{wifiError}</p>}
            <button type="button" className="l2-primary-btn" onClick={handlePasswordConnect}>
              Connect
            </button>
          </div>
        </div>
      )}

      {stage === STAGES.MAZE_GAME && (
        <Level2Game
          onComplete={(coins) => handleMazeComplete(coins)}
          onQuit={(coins) => handleMazeQuit(coins)}
          onFail={() => {
            setShowWifiPanel(false);
            setStage(STAGES.TASKBAR);
          }}
        />
      )}

      {stage === STAGES.PENCIL_GAME && (
        <div className="l2-panel">
          <div className="pencil-game-card">
            <div className="pencil-game-header">
              <div>
                <h2>Pencil Order Challenge</h2>
                <p>Pick pencils in ascending order from 1 to 8. 3 wrong picks ends the game.</p>
              </div>
              <div className="pencil-stats">
                <span>Next: {nextOrder}</span>
                <span>Correct: {correctCount}</span>
                <span>Wrong: {wrongCount} / 3</span>
                <span>Coins: {coinsEarned}</span>
              </div>
            </div>
            <div className="pencil-grid">{pencilButtons}</div>
            <div className="pencil-actions">
              <button type="button" className="l2-secondary-btn" onClick={handleEndGame}>
                End Game
              </button>
            </div>
            {gameFinished && (
              <div className="game-over-banner">
                <h3>Game Over</h3>
                <p>You earned {coinsEarned} coins.</p>
                <button type="button" className="l2-primary-btn" onClick={handleContinueAfterGame}>
                  Continue to Profile Upload
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {stage === STAGES.UPLOAD && (
        <div className="l2-panel upload-screen">
          <div className="upload-card">
            <h2>Upload Photo</h2>
            <p>Please choose a clear profile photo for your upload.</p>
            <button type="button" className="l2-primary-btn" onClick={handleUploadClick}>
              Choose File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <p className="upload-file-name">{fileName}</p>
            <label className="upload-checkbox">
              <input
                type="checkbox"
                checked={checkboxChecked}
                onChange={handleConfirmUpload}
              />
              I have uploaded the proper photo
            </label>
            <div className="upload-total-coins">
              Total coins available: {totalCoins}
            </div>
          </div>
        </div>
      )}

      {stage === STAGES.COMPLETE && (
        <div className="l2-panel final-page" style={{ backgroundImage: "url(/src/assets/MrX.png)" }}>
          <div className="wanted-card">
            <div className="wanted-top-right">
              <div className="wanted-box">
                <span>WANTED</span>
              </div>
              <div className="wanted-empty-box" />
            </div>
            <div className="wanted-copy">
              <p>
                As your photo has been morphed as shown above. If you don't pay 100 coins it'll be posted in the social media.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
