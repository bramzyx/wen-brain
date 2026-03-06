# 🎮 WEN BRAIN — Full Project Brief
*"Learn or Get Rekt"*

---

## CONCEPT
A crypto education game that teaches everything about crypto
from Bitcoin's birth to today's memecoins — through storytelling,
memes, humor, real events, and multiple choice quizzes.

Feels like: Duolingo + a crypto terminal + a meme feed had a baby.

Target audience: Complete beginners. Explain like they are 5.
Real stories. Real scams. Real wins. Real chaos.

---

## VIBE & DESIGN
- Mix of: dark terminal hacker + meme chaos (degen energy) + sleek modern minimal
- Dark mode DEFAULT, light mode toggle available
- Fonts: Syne (headings) + IBM Plex Mono (body/terminal)
- Animated, glitchy, scanlines, particle effects
- Every level has its own accent color
- First page / landing must be STUNNING. Cinematic. Unforgettable.
- Meme-native language: ser, ngmi, wagmi, gm, wen, rekt, LFG etc.

---

## TECH STACK
- React 18 + Vite
- Tailwind CSS + custom CSS variables
- Framer Motion (animations)
- Zustand (global state: XP, progress, theme, leaderboard)
- Howler.js (sound effects)
- React Router v6
- localStorage (save progress + leaderboard)
- Web Share API + Twitter/X intent (share button)

---

## GAME MECHANICS

### XP System
- Each correct answer = 100 XP
- Speed bonus = up to 50 XP (answer fast = more XP)
- Perfect level (3/3) = "WAGMI" badge + bonus 150 XP
- Wrong answer = "ngmi moment" screen shake + red flash
- XP accumulates across all levels

### Quiz Format
- 3 multiple choice questions per level
- 4 answer options each
- Timer counts down (30 seconds per question)
- Instant feedback: correct (green explosion) / wrong (red shake)

### Leaderboard
- Enter name/alias before playing
- Top 10 stored in localStorage
- Shown on home screen and after each level

### Share Button
- Always visible after completing a level
- Posts to X: "I just completed Level X of WEN BRAIN 🔥
  I earned [XP] XP. Can you beat me? [link] #WenBrain #WAGMI"

### Sound Effects
- correct.mp3 → satisfying ding/coin
- wrong.mp3 → rekt buzzer
- levelup.mp3 → rocket launch
- xp.mp3 → coin collect
- share.mp3 → whoosh
- bg music → optional lo-fi crypto vibes, toggleable

---

## LEVEL MAP (build one full level at a time)

### 🟠 LEVEL 1 — "In the Beginning: Bitcoin"
Color: #F7931A (Bitcoin orange)
Topics:
- What is money? What is trust?
- 2008 financial crisis — banks failed, people lost everything
- Satoshi Nakamoto publishes the Bitcoin whitepaper Oct 31 2008
- What is a blockchain? Explain like a magic notebook everyone can see
- Bitcoin Pizza Day — Laszlo pays 10,000 BTC for 2 pizzas (now ~$600M)
- Bitcoin's first price: $0.0008
- Mining explained: computers solving puzzles to earn BTC
Meme moment: "That pizza guy" — show the famous pizza meme
Quiz: 3 questions about Bitcoin basics

---

### 👻 LEVEL 2 — "Who is Satoshi? The Greatest Mystery in Tech"
Color: #FFD700 gold + dark purple
Topics:
- Nobody knows who Satoshi is — person? group? alien?
- Famous theories: Craig Wright (fake), Hal Finney, Nick Szabo
- Satoshi's last message — disappeared in 2010
- Satoshi's wallet: 1 million BTC never moved (~$60B+)
- Why staying anonymous was genius
- The "I am Satoshi" frauds over the years
Meme moment: Satoshi ghost emoji everywhere
Quiz: 3 questions about the Satoshi mystery

---

### 💙 LEVEL 3 — "The Kid Who Built Ethereum"
Color: #627EEA (ETH blue/purple)
Topics:
- Vitalik Buterin — Russian-Canadian, wrote ETH whitepaper at 19
- "What if Bitcoin could run code?" — smart contracts explained simply
- ETH launch 2015, the ICO boom
- Gas fees explained (why sending $1 sometimes costs $80)
- The DAO hack 2016 — $60M stolen, Ethereum Classic born
- DeFi, NFTs, all built on Ethereum
- Merge — ETH went from Proof of Work to Proof of Stake
Meme moment: "Ultra sound money" horn meme
Quiz: 3 questions about Ethereum

---

### ⚡ LEVEL 4 — "Solana: The Fast and the Furious"
Color: #9945FF purple + #00FFA3 green
Topics:
- Anatoly Yakovenko — ex-Qualcomm engineer
- Solana's pitch: 65,000 transactions per second vs ETH's ~15
- Proof of History — the clock inside the blockchain
- SOL price rise: $0.22 → $260
- The FTX connection — Sam Bankman-Fried pumped SOL hard
- Solana outages — network went down multiple times
- The comeback: memecoins, NFTs, Pump.fun
- Now the #1 chain for memecoins
Meme moment: "Solana is down again" vs "Solana is back LFG"
Quiz: 3 questions about Solana

---

### 🤡 LEVEL 5 — "The Hall of Shame: Biggest Crypto Scams"
Color: #FF3366 red
Topics:

BIG ONES:
- FTX / Sam Bankman-Fried — $8 billion stolen, "effective altruist" lol
  SBF arrested in Bahamas, crying in court, 25 years prison
- Terra/Luna — $40 billion wiped in 48 hours, Do Kwon fled to Serbia
- BitConnect — the LEGENDARY scam, Carlos Matos "HEEEY WHATS UP"
  Classic Ponzi, promised 40% monthly returns
- OneCoin — "Cryptoqueen" Ruja Ignatova disappeared with $4B
  Still missing. On FBI most wanted list.
- Mt. Gox — first big Bitcoin exchange, 850,000 BTC "lost"
- QuadrigaCX — CEO died (maybe?) and was the only one with passwords
  $190M locked forever. Or was he faking death?

FUNNY/WILD ONES:
- Squid Game Token — went to $2,856 then $0 in seconds, devs ran
- SaveTheKids token — YouTubers pumped and dumped on their own fans
- Frosties NFT — devs rugged 24 hours after launch, got arrested
- Pump.fun kid scams — literal children on livestream rugging tokens
  Kids buying Lambos with money from rug pulls, then crying on stream
- Hawk Tuah girl — launched $HAWK token, dumped 90% in hours
  Went from meme queen to "crypto villain" overnight
- The guy who accidentally threw away 8,000 BTC hard drive
  Still trying to dig up a landfill in Wales

Meme moment: BitConnect Carlos Matos reaction, Luna chart going to zero
Quiz: 3 questions (match the scam to the criminal, etc.)

---

### 🐸 LEVEL 6 — "Memecoins: From Joke to Millionaire"
Color: #FFD700 yellow + #00CC44 green
Topics:
- Dogecoin — started as a joke in 2013, Jackson Palmer + Billy Markus
  Elon Musk tweets sent it to $0.74, market cap $90 billion
  "The people's crypto" — used to tip people online
- Shiba Inu — "Dogecoin killer", created anonymously
  Vitalik donated SHIB burned half the supply
- PEPE — the frog from 4chan becomes a $1B+ token
- WIF (dogwifhat) — Solana dog with a hat, hit $4 billion market cap
- BONK — Solana's community memecoin, airdropped to NFT holders
- FLOKI — named after Elon's actual dog
- Baby Doge, Cat tokens, pizza tokens, literal nothing tokens
- Pump.fun explained — anyone can launch a token in 2 minutes for $2
  Most go to zero. Some go 1000x. That's the game.
- The meta: how memecoins actually work, who wins, who loses
- "It's all a casino. At least know the rules."
Meme moment: Doge to the moon rocket, PEPE smug face
Quiz: 3 questions about memecoins

---

### 🐋 LEVEL 7 — "Whales, Manipulation & How Markets Really Work"
Color: #0099FF ocean blue
Topics:
- What is a whale? Someone with enough BTC to move markets
- Wash trading — fake volume to make a coin look popular
- Pump and dump groups — Telegram groups coordinating scams
- Market makers and liquidity explained simply
- Fear and Greed Index — the crypto emotion meter
- "Buy the rumor, sell the news" explained with real examples
- Michael Saylor — MicroStrategy bought billions in BTC, true believer
- El Salvador made BTC legal tender — Bukele's bet
- BlackRock Bitcoin ETF — Wall Street finally joined the party
- How to not be the exit liquidity
Meme moment: "Crypto Twitter (CT) vs Reality" chart meme
Quiz: 3 questions about market mechanics

---

### 🛠️ LEVEL 8 — "Tools of the Trade: How to Not Lose Everything"
Color: #00FF94 matrix green
Topics:
- Hot wallet vs Cold wallet explained (online vs offline)
- MetaMask, Phantom, Ledger — what they are
- Seed phrase — 12 words that ARE your money. Lose them = lose everything
- "Not your keys, not your coins" — the golden rule
- CEX vs DEX — Coinbase/Binance vs Uniswap/Jupiter
- How to read a chart (basic candlesticks, support/resistance)
- Gas fees, slippage, MEV — the hidden costs
- DYOR — Do Your Own Research. How to actually research a coin
- Red flags checklist: anon team, no audit, too good to be true APY
- Tax — yes, crypto is taxed. Yes, they know.
Meme moment: "Write down your seed phrase" guy loses $2M
Quiz: 3 questions about tools and safety

---

### 🚀 LEVEL 9 — "What's Happening NOW: The Current Meta"
Color: white/silver gradient
Topics:
- Bitcoin ETF approval January 2024 — game changer
- Bitcoin halving April 2024 — supply cut in half every 4 years
- AI + Crypto narrative — tokens like NEAR, FET, TAO
- RWA (Real World Assets) — tokenizing real estate, stocks
- Layer 2s — making Ethereum cheaper (Arbitrum, Base, Optimism)
- Base chain — Coinbase's L2, suddenly everywhere
- The current memecoin super-cycle on Solana
- Pump.fun making $1M+ per day in fees
- What "this cycle" means and where we might be
- "Every cycle ends. Stack knowledge, not just bags."
Meme moment: "We're so back" vs "It's so over" — the eternal cycle
Quiz: 3 questions about current crypto landscape

---

### 🏆 LEVEL 10 — FINAL BOSS: "Are You Actually Gonna Make It?"
Color: full rainbow gradient — gold
Topics:
- Recap of everything learned
- The mindset: long term vs short term
- DCA (Dollar Cost Averaging) — the boring strategy that works
- Position sizing — never put in more than you can lose
- The emotional cycle of investing (FOMO, panic, greed, despair)
- "The best trade is sometimes no trade"
- Famous last words: "This time it's different"
- Community: CT, Discord, Telegram — how to use without getting rugged
- Your next steps: resources, how to keep learning
Final quiz: 10 questions, all topics, FINAL BOSS MODE
Reward: "CERTIFIED CRYPTO DEGEN" badge + full leaderboard reveal

---

## FIRST PAGE (Landing Screen) — MUST BE CINEMATIC

Elements:
- Giant animated title: "WEN BRAIN" with glitch effect
- Subtitle: "Learn or Get Rekt" — typewriter animation
- Animated background: floating crypto logos, matrix rain, price candles
- A live-feel ticker at top: BTC ETH SOL PEPE DOGE scrolling prices (fake/static ok)
- "Start Your Journey" CTA button — pulsing orange glow
- Level map preview below the fold
- Leaderboard peek (top 3 players)
- Dark/light mode toggle top right
- Sound on/off toggle
- Stats: "X players learning" "X XP earned today" (can be fake/static)
- Meme quote that rotates: "Few understand this." / "WAGMI ser." / 
  "Your bank hates this." / "Satoshi is watching." / "Not financial advice."

---

## COMPONENT LIST
- <Navbar /> — logo, XP bar, theme toggle, sound toggle
- <LandingPage /> — cinematic first screen
- <LevelMap /> — all levels with lock/unlock state
- <LevelStory /> — scrollable story content per level
- <QuizModal /> — multiple choice, timer, feedback
- <XPBar /> — animated progress bar
- <Leaderboard /> — top 10 table
- <ShareButton /> — share to X
- <MemeReaction /> — wagmi/ngmi popups
- <SoundManager /> — Howler.js wrapper
- <ThemeToggle /> — dark/light

---

## FOLDER STRUCTURE
wen-brain/
├── public/
│   └── sounds/
│       ├── correct.mp3
│       ├── wrong.mp3
│       ├── levelup.mp3
│       └── coin.mp3
├── src/
│   ├── components/
│   ├── levels/          ← level1.js ... level10.js (content + quiz data)
│   ├── store/           ← useGameStore.js (Zustand)
│   ├── styles/          ← main.css, themes.css, animations.css
│   ├── hooks/           ← useSound.js, useXP.js, useShare.js
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── tailwind.config.js
├── vite.config.js
└── BRIEF.md            ← this file

---

## LANGUAGE / TONE GUIDE
- Talk to user like a cool older crypto friend, not a professor
- Use meme language naturally: ser, fren, ngmi, wagmi, gm, wen, rekt, LFG, IYKYK
- Every serious topic gets one joke/meme to break tension
- Never boring. If it's boring, add a meme.
- Short sentences. Big energy.
- "Not financial advice" appears as a joke at least 3 times

---

## DEFINITION OF DONE PER LEVEL
- [ ] Story content written and styled
- [ ] Accent color applied throughout
- [ ] Meme moment rendered (image or animated text)
- [ ] 3 quiz questions with 4 options each
- [ ] Correct answers defined
- [ ] XP reward calculated
- [ ] Share message written
- [ ] Level unlocks next on completion
- [ ] Sound effects trigger correctly
- [ ] Tested on mobile + desktop