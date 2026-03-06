# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WEN BRAIN is a crypto education game ("Learn or Get Rekt") built with React 18 + Vite. It teaches crypto concepts through storytelling, memes, and quizzes — Duolingo meets a crypto terminal. Target audience: complete beginners.

## Tech Stack

- **React 18 + Vite** — core framework
- **Tailwind CSS + custom CSS variables** — styling
- **Framer Motion** — animations (glitch effects, transitions, screen shake)
- **Zustand** (`src/store/useGameStore.js`) — global state: XP, progress, theme, leaderboard
- **Howler.js** — sound effects via `src/hooks/useSound.js`
- **React Router v6** — navigation
- **localStorage** — persisting progress and leaderboard (no backend)
- **Web Share API + Twitter/X intent** — share button

## Commands

```bash
npm install       # install dependencies
npm run dev       # start dev server
npm run build     # production build
npm run preview   # preview production build
```

## Architecture

### State Management
All global state lives in `src/store/useGameStore.js` (Zustand). Key state: XP total, completed levels, leaderboard entries (top 10), theme (dark/light), sound on/off.

### Level Content
Each level is a data file at `src/levels/level1.js` through `level10.js`. Each exports:
- Story content (sections with text, meme moments, accent color)
- Quiz data: 3 questions, 4 options each, correct answer index
- Share message text
- XP reward config

### XP System
- Correct answer: 100 XP
- Speed bonus: up to 50 XP
- Perfect level (3/3): +150 XP bonus + "WAGMI" badge
- Wrong answer: "ngmi moment" (screen shake + red flash)

### Sound Effects
Files in `public/sounds/`: `correct.mp3`, `wrong.mp3`, `levelup.mp3`, `coin.mp3`. Managed via `src/hooks/useSound.js` (Howler.js wrapper). Background music is optional and toggleable.

### Theming
Dark mode default. Each of the 10 levels has its own accent color (e.g., Level 1: `#F7931A` Bitcoin orange, Level 3: `#627EEA` ETH blue). Theme tokens managed in `src/styles/themes.css`.

### Fonts
- Syne — headings
- IBM Plex Mono — body/terminal text

## Level Map

| Level | Theme | Accent Color |
|-------|-------|-------------|
| 1 | Bitcoin basics | #F7931A |
| 2 | Satoshi mystery | #FFD700 + dark purple |
| 3 | Ethereum | #627EEA |
| 4 | Solana | #9945FF + #00FFA3 |
| 5 | Hall of Shame (scams) | #FF3366 |
| 6 | Memecoins | #FFD700 + #00CC44 |
| 7 | Whales & markets | #0099FF |
| 8 | Tools & safety | #00FF94 |
| 9 | Current meta | white/silver gradient |
| 10 | Final boss (all topics) | rainbow gradient/gold |

## Tone & Language Guide

Write all UI copy and story content in crypto-native language: ser, fren, ngmi, wagmi, gm, wen, rekt, LFG, IYKYK. Short sentences. Big energy. Every serious topic gets one meme/joke. "Not financial advice" appears as a joke at least 3 times. Never boring — if it's boring, add a meme.

## Definition of Done (per level)

Each level requires: story content + accent color applied, meme moment rendered, 3 quiz questions (4 options each) with correct answers, XP reward, share message, level unlock logic, sound effect triggers, and mobile + desktop testing.
