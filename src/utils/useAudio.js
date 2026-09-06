const AUDIO_PATHS = {
  bg: "/audio/audio_1.mp3",
  level1: "/audio/audio_level1.mp3",
  wifi: "/audio/audio_wifi.mp3",
  scarywifi: "/audio/audio_scarywifi.mp3",
  scaryless: "/audio/audio_scaryless.mp3",
  datacord: "/audio/audio_datacord.mp3",
  jump: "/audio/audio_jump.mp3",
  finish: "/audio/audio_finish.mp3",
  hacked: "/audio/audio_hacked.mp3",
  click: "/audio/audio_click.mp3",
};
const audioMap = new Map();
function getAudio(key){
  if (!AUDIO_PATHS[key]) return null;
  if (!audioMap.has(key)) { const a = new Audio(AUDIO_PATHS[key]); a.preload = "auto"; audioMap.set(key,a); }
  return audioMap.get(key);
}
export const playLoop = (key) => { stopAll(); const a=getAudio(key); if(!a)return; a.loop=true; a.currentTime=0; a.play().catch(()=>{}); };
export const playOne = (key) => { const a=getAudio(key); if(!a)return; a.currentTime=0; a.play().catch(()=>{}); };
export const stopAll = () => { audioMap.forEach(a=>{a.pause();a.currentTime=0;}); };
