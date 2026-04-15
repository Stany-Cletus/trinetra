const audioMap = {
  bg: new Audio("/audio/audio_1.mp3"),
  level1: new Audio("/audio/audio_level1.mp3"),
  wifi: new Audio("/audio/audio_wifi.mp3"),
  scarywifi: new Audio("/audio/audio_scarywifi.mp3"),
  scaryless: new Audio("/audio/audio_scaryless.mp3"),
  datacord: new Audio("/audio/audio_datacord.mp3"),
  jump: new Audio("/audio/audio_jump.mp3"),
  finish: new Audio("/audio/audio_finish.mp3"),
  hacked: new Audio("/audio/audio_hacked.mp3"),
  click: new Audio("/audio/audio_click.mp3"),
};

Object.values(audioMap).forEach(a => {
  a.preload = "auto";
});

export const playLoop = (key) => {
  stopAll();
  const a = audioMap[key];
  a.loop = true;
  a.currentTime = 0;
  a.play();
};

export const playOne = (key) => {
  const a = audioMap[key];
  a.currentTime = 0;
  a.play();
};

export const stopAll = () => {
  Object.values(audioMap).forEach(a => {
    a.pause();
    a.currentTime = 0;
  });
};