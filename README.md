# Trinetra — Clean Old-Style Learning Build

This version preserves the original Trinetra visual language and core interactions while adding the learning-design pipeline from the ILE brief:

**Cybersecurity concept → interactive activity → ethical situation → decision → consequence → reflection**

## Levels
1. Free Wi-Fi Trap — existing platformer + Wi-Fi simulation + ethical dilemma
2. Ghost in the Feed — existing Datacord/maze/scam simulation + ethical dilemma
3. Payment Credential — suspicious-payment activity + ethical dilemma
4. Teacher Deepfake — media-verification activity + ethical dilemma
5. Data Leak — data-minimisation activity + ethical dilemma

## Run
```bash
npm install
npm run dev
```

Build:
```bash
npm run build
```

## Assets
Existing Trinetra images/videos from the supplied repository are preserved under `public/assets` and `src/assets`.

The original repository referenced audio files under `/public/audio`, but those files were not present in the supplied repository ZIP. The audio helper is therefore fail-safe: missing audio cannot crash the game. Add real files later under `public/audio/` using the paths in `src/utils/useAudio.js`.
