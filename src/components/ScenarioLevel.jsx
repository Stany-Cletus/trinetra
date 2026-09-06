import { useMemo, useState } from "react";
import EthicalDilemma from "./EthicalDilemma";
import { LEVEL_DATA } from "../data/levelData";
import "./ScenarioLevel.css";

const GAME_DATA = {
  3: { title: "TRACE THE PAYMENT SCAM", concept: "Phishing & payment safety", intro: "A refund message has landed in your chat. Scan the conversation and expose the warning signals before you move on.", type: "scanner", items: [
    { id:"sender", title:"Unknown sender", detail:"The account name is almost identical to a trusted contact." },
    { id:"urgency", title:"ACT NOW", detail:"The message says the refund expires in 5 minutes." },
    { id:"link", title:"Refund verification link", detail:"The link opens outside the official banking app." },
    { id:"pin", title:"Enter UPI PIN", detail:"A refund should never require you to reveal your UPI PIN." },
    { id:"amount", title:"₹2,000 refund", detail:"The amount makes the message feel believable, but is not proof." }], correct:["sender","urgency","link","pin"], success:"SCAM EXPOSED — you found the warning signals that should make you stop and verify.", fail:"The scam is still hiding in the message. Look for pressure, unfamiliar links, sender identity and credential requests." },
  4: { title: "FRAME BY FRAME", concept: "Deepfake verification", intro: "A video appears to show your teacher asking for money. Investigate the evidence. A convincing face is not proof.", type: "verification", items: [
    { id:"source", title:"SOURCE", detail:"The clip came through a forwarded student account, not the school's official channel." },
    { id:"sync", title:"LIP / AUDIO", detail:"The mouth movement and audio drift slightly out of sync." },
    { id:"request", title:"MONEY REQUEST", detail:"The video asks students to transfer money to a new account." },
    { id:"context", title:"CONTEXT", detail:"The school's known channel has no matching announcement." }], correct:["source","sync","request","context"], success:"VIDEO FLAGGED — you verified the source and context instead of trusting appearances.", fail:"Not enough evidence was checked. Deepfake safety is about independent verification." },
  5: { title: "DATA VAULT", concept: "Data minimisation", intro: "A new app wants six pieces of information. Classify each card: KEEP FOR ACCOUNT or QUESTION / DON'T SHARE.", type: "vault", items: [
    { id:"name", title:"Name", detail:"May be needed for a basic profile." },
    { id:"school", title:"School name", detail:"Can reveal where a child studies." },
    { id:"phone", title:"Phone number", detail:"Share only when there is a clear account or recovery purpose." },
    { id:"location", title:"Live location", detail:"Highly sensitive and needs a clear purpose." },
    { id:"id", title:"Government ID number", detail:"A normal game account should not need this." },
    { id:"password", title:"Existing password", detail:"A service should never ask for your existing password." }], sensitive:["school","location","id","password"], success:"VAULT SECURED — you challenged unnecessary collection instead of giving data away automatically.", fail:"Some risky data was treated as ordinary account data. Ask what the service genuinely needs." }
};

export default function ScenarioLevel({ level, onComplete }) {
  const data = LEVEL_DATA[level]; const game = GAME_DATA[level];
  const [stage,setStage]=useState("landing"); const [selected,setSelected]=useState([]); const [checked,setChecked]=useState(false); const [vault,setVault]=useState({});
  const correct = useMemo(()=> game.type === "vault" ? game.items.every(i=>vault[i.id] === (game.sensitive.includes(i.id)?"question":"keep")) : game.correct.every(id=>selected.includes(id)) && selected.length===game.correct.length,[game,selected,vault]);
  const toggle=id=>!checked&&setSelected(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  const setChoice=(id,c)=>!checked&&setVault(p=>({...p,[id]:c}));
  return <div className="scenario-root"><div className="scenario-bg"/>
    {stage==="landing"&&<div className="scenario-landing"><div className="scenario-logo"><img src="/assets/Trinetra_logo.png" alt="Trinetra"/></div><div className="scenario-eyebrow">LEVEL {data.number}</div><h1>{data.title}</h1><p>{data.concept}</p><button onClick={()=>setStage("activity")}>ENTER ▶</button></div>}
    {stage==="activity"&&<div className="scenario-window"><div className="scenario-windowbar"><span>TRINETRA // FIELD TRAINING</span><span>● ● ●</span></div><div className="scenario-body"><div className="scenario-badge">CYBERSECURITY SKILL // LEVEL {data.number}</div><h2>{game.title}</h2><p className="scenario-instructions">{game.intro}</p>
      {level===4&&<div className="scenario-inline-video"><div className="scenario-video-head"><span>◉ LIVE VERIFICATION BRIEFING</span><span>WATCH BEFORE YOU FLAG</span></div><video src="/assets/Level4_Deepfake.mp4" className="scenario-inline-video-element" controls playsInline autoPlay muted /><div className="scenario-video-hint">Look for the source, context, audio/lip-sync and the request itself.</div></div>}
      {game.type==="scanner"&&<><div className="mini-chat"><div className="mini-chat-head">PAYMENT SUPPORT // CHAT</div><div className="mini-message scam">Refund Team: Your ₹2,000 refund is ready. ACT NOW or it expires.</div><div className="mini-message">Refund Team: Verify here → <span>refund-help.example</span></div><div className="mini-message">Refund Team: Enter your UPI PIN to receive the money.</div></div><p className="game-prompt">CLICK THE WARNING SIGNALS</p><div className="scenario-clues game-grid">{game.items.map(i=><button key={i.id} className={selected.includes(i.id)?"selected":""} onClick={()=>toggle(i.id)}><b>{selected.includes(i.id)?"✓":"○"}</b>{i.title}<small>{i.detail}</small></button>)}</div></>}
      {game.type==="verification"&&<div className="evidence-grid">{game.items.map(i=><button key={i.id} className={selected.includes(i.id)?"selected":""} onClick={()=>toggle(i.id)}><span className="evidence-frame">{i.title}</span><small>{i.detail}</small><strong>{selected.includes(i.id)?"FLAGGED ✓":"INSPECT"}</strong></button>)}</div>}
      {game.type==="vault"&&<><div className="vault-bins"><div><span>SAFE ACCOUNT DATA</span><b>KEEP FOR ACCOUNT</b></div><div><span>PRIVACY CHECK</span><b>QUESTION / DON'T SHARE</b></div></div><div className="vault-cards">{game.items.map(i=><div key={i.id} className={`vault-card ${vault[i.id]||""}`}><strong>{i.title}</strong><small>{i.detail}</small><div><button onClick={()=>setChoice(i.id,"keep")}>KEEP</button><button onClick={()=>setChoice(i.id,"question")}>QUESTION</button></div></div>)}</div></>}
      <div className="scenario-meter">{game.type==="vault"?`CARDS SORTED: ${Object.keys(vault).length}/${game.items.length}`:`SIGNALS FLAGGED / UNFLAGGED: ${selected.length}/${game.items.length}`}</div>
      {!checked?<button className="scenario-action" onClick={()=>setChecked(true)}>SUBMIT ANALYSIS ▶</button>:<div className={`scenario-feedback ${correct?"success":"fail"}`}><strong>{correct?"✓ ":"⚠ "}{correct?game.success:game.fail}</strong><p>{correct?"You practiced the skill before being asked to make an ethical decision.":"Review the signals, then carry that reasoning into the situation that follows."}</p><button className="scenario-action" onClick={()=>setStage("ethical")}>CONTINUE TO THE SITUATION ▶</button></div>}</div></div>}
    {stage==="ethical"&&<EthicalDilemma level={level} onDone={onComplete}/>}
  </div>;
}
