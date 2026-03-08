import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/useGameStore'
import { useSound } from '../hooks/useSound'
import { useLevelMeta } from '../hooks/useLevelMeta'

const ACCENT = '#FFD700'

const QUIZ = [
  {
    q: 'When was the Bitcoin whitepaper published?',
    options: [
      'January 3rd, 2009',
      'October 31st, 2008',
      'December 25th, 2007',
      'March 15th, 2010',
    ],
    correct: 1,
    fact: 'October 31st, 2008 — Halloween. Satoshi Nakamoto published "Bitcoin: A Peer-to-Peer Electronic Cash System" to a cryptography mailing list. The genesis block was mined on January 3rd, 2009, containing the headline "The Times 03/Jan/2009 Chancellor on brink of second bailout for banks."',
  },
  {
    q: 'How much Bitcoin does Satoshi Nakamoto estimated to own?',
    options: [
      '100,000 BTC',
      '500,000 BTC',
      '1,000,000 BTC',
      '21,000,000 BTC',
    ],
    correct: 2,
    fact: 'Researchers estimate Satoshi mined approximately 1,000,000 BTC in the early days of Bitcoin. At $126K ATH this was worth over $126 billion. These coins have never moved — not a single satoshi spent since 2009. Nobody knows if Satoshi is alive, dead, or watching.',
  },
  {
    q: 'How old was Vitalik Buterin when he wrote the Ethereum whitepaper?',
    options: [
      '17',
      '21',
      '25',
      '19',
    ],
    correct: 3,
    fact: 'Vitalik Buterin was 19 years old when he wrote the Ethereum whitepaper in 2013. He had already co-founded Bitcoin Magazine at 17. He dropped out of the University of Waterloo after receiving a $100,000 Thiel Fellowship. Ethereum launched in 2015 and became the second largest cryptocurrency.',
  },
  {
    q: 'What was the main cause of the FTX collapse?',
    options: [
      'A Bitcoin hack',
      'Using customer funds for trading',
      'SEC shutting them down',
      'Ethereum network failure',
    ],
    correct: 1,
    fact: 'Sam Bankman-Fried secretly funnelled $8 billion in FTX customer funds to his trading firm Alameda Research. When the hole was discovered in November 2022 the exchange collapsed in days. SBF was arrested, convicted on all 7 counts, and sentenced to 25 years in federal prison.',
  },
  {
    q: "What is Dogecoin's origin story?",
    options: [
      'Created by Elon Musk in 2021',
      'Created as a joke to mock crypto speculation in 2013',
      'Forked from Bitcoin in 2015',
      'Built by the Ethereum team',
    ],
    correct: 1,
    fact: 'Billy Markus and Jackson Palmer created Dogecoin in December 2013 as a joke — a meme coin featuring the Shiba Inu dog from the "Doge" meme. It was meant to mock the absurdity of crypto speculation. It reached a $90 billion market cap in 2021. The joke became one of the biggest assets in history.',
  },
  {
    q: 'What does HODL mean?',
    options: [
      'High Output Digital Ledger',
      'A typo of HOLD that became a crypto motto',
      'Hold On for Dear Life (acronym)',
      'A Bitcoin trading strategy',
    ],
    correct: 1,
    fact: 'In 2013 a drunk Bitcoin forum user posted "I AM HODLING" — a typo of "holding." The post became legendary. "HODL" became the battle cry of long-term crypto believers. It was later retroactively given the meaning "Hold On for Dear Life" but that came after the typo, not before.',
  },
  {
    q: 'What is wash trading?',
    options: [
      'Cleaning your hardware wallet',
      'Converting crypto to cash',
      'Buying and selling to yourself to create fake volume',
      'Trading during market hours only',
    ],
    correct: 2,
    fact: 'Wash trading is when someone buys and sells an asset to themselves — or coordinates trades between friendly parties — to create the illusion of high trading volume. Studies estimated over 70-95% of volume on some exchanges was fake. It inflates perceived liquidity and manipulates market perception.',
  },
  {
    q: 'What is the most important rule about seed phrases?',
    options: [
      'Store them in your email drafts',
      'Take a photo and store in iCloud',
      'Never store digitally — write on paper and keep safe',
      'Share with your exchange for backup',
    ],
    correct: 2,
    fact: 'Your seed phrase is 12-24 words that ARE your wallet. Anyone who has them controls all your crypto. Never store digitally — phones get hacked, cloud gets breached, emails get compromised. Write on paper. Store in a safe physical location. Consider a metal backup for fireproofing.',
  },
  {
    q: 'What is DCA?',
    options: [
      'Decentralized Crypto Application',
      'Digital Currency Authority',
      'Investing fixed amounts regularly regardless of price',
      'A type of crypto wallet',
    ],
    correct: 2,
    fact: 'Dollar Cost Averaging means investing a fixed amount at regular intervals regardless of price. $100/month into Bitcoin, rain or shine, bull or bear. You buy some high and some low but average out over time. It removes emotion from investing and has outperformed most active strategies long-term.',
  },
  {
    q: 'What happened after every Bitcoin halving historically?',
    options: [
      'Bitcoin price crashed immediately',
      'Nothing significant happened',
      'Bitcoin hit new all-time high within 12-18 months',
      'Mining stopped completely',
    ],
    correct: 2,
    fact: '2012 halving → $1,200 ATH. 2016 halving → $20,000 ATH. 2020 halving → $69,000 ATH. 2024 halving → $126,000 ATH. Every single halving was followed by a new all-time high within 12-18 months. The reduced new supply combined with consistent or growing demand pushes price higher. Past performance does not guarantee future results. But the pattern is hard to ignore.',
  },
]

// ─── Design primitives ────────────────────────────────────────────────────────

function SectionCard({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true, margin: '-50px' }}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid rgba(255,215,0,0.18)',
        borderLeft: `4px solid ${ACCENT}`,
        borderRadius: 12,
        padding: '32px',
      }}
    >
      {children}
    </motion.div>
  )
}

function SectionConnector({ emoji }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 0' }}
    >
      <div style={{
        width: 2,
        height: 28,
        backgroundImage: `repeating-linear-gradient(to bottom, ${ACCENT}66 0px, ${ACCENT}66 5px, transparent 5px, transparent 11px)`,
      }} />
      <div style={{ fontSize: 20, margin: '6px 0', filter: `drop-shadow(0 0 8px ${ACCENT}88)` }}>
        {emoji}
      </div>
      <div style={{
        width: 2,
        height: 28,
        backgroundImage: `repeating-linear-gradient(to bottom, ${ACCENT}66 0px, ${ACCENT}66 5px, transparent 5px, transparent 11px)`,
      }} />
    </motion.div>
  )
}

function SectionTag({ number, label }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center font-syne font-black text-xs flex-shrink-0"
        style={{ background: ACCENT, color: '#000' }}
      >
        {number}
      </div>
      <span className="font-mono text-xs tracking-widest uppercase" style={{ color: ACCENT }}>
        {label}
      </span>
    </div>
  )
}

function MemeQuote({ children }) {
  return (
    <div
      style={{
        borderLeft: `4px solid ${ACCENT}`,
        paddingLeft: '1rem',
        margin: '1.5rem 0 0',
        fontFamily: '"IBM Plex Mono", monospace',
        fontStyle: 'italic',
        fontSize: '0.875rem',
        color: ACCENT,
        opacity: 0.85,
      }}
    >
      {children}
    </div>
  )
}

function CalloutBox({ children }) {
  return (
    <div
      style={{
        background: `rgba(255,215,0,0.06)`,
        borderLeft: `3px solid ${ACCENT}`,
        borderRadius: '0 8px 8px 0',
        padding: '14px 18px',
        margin: '16px 0',
      }}
    >
      {children}
    </div>
  )
}

function LevelImage({ src, alt }) {
  return (
    <img
      src={src}
      alt={alt}
      style={{
        display: 'block',
        width: '100%',
        maxHeight: 400,
        objectFit: 'cover',
        borderRadius: 12,
        border: '1px solid rgba(255,215,0,0.19)',
        boxShadow: '0 0 24px rgba(255,215,0,0.12)',
        margin: '20px 0',
      }}
    />
  )
}

// ─── Confetti burst ───────────────────────────────────────────────────────────

const CONFETTI = Array.from({ length: 28 }, (_, i) => ({
  angle: (i / 28) * Math.PI * 2,
  dist: 60 + (i * 13) % 100,
  color: ['#FFD700', '#FFA500', '#ffffff', '#FF3366', '#00FF94', '#0099FF', '#FFD700', '#fff'][i % 8],
  size: 7 + (i % 5),
  delay: (i % 6) * 0.03,
}))

function ConfettiBurst({ active }) {
  if (!active) return null
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', borderRadius: 12 }}>
      {CONFETTI.map((p, i) => (
        <motion.div
          key={i}
          initial={{ left: '50%', top: '45%', opacity: 1, scale: 1 }}
          animate={{
            left: `calc(50% + ${Math.cos(p.angle) * p.dist}px)`,
            top: `calc(45% + ${Math.sin(p.angle) * p.dist}px)`,
            opacity: 0,
            scale: 0,
            rotate: 270,
          }}
          transition={{ duration: 0.9, ease: 'easeOut', delay: p.delay }}
          style={{ position: 'absolute', width: p.size, height: p.size, borderRadius: 2, background: p.color }}
        />
      ))}
    </div>
  )
}

// ─── Full-screen confetti (perfect score) ─────────────────────────────────────

const FULL_CONFETTI = Array.from({ length: 60 }, (_, i) => ({
  x: Math.random() * 100,
  delay: Math.random() * 1.5,
  duration: 1.5 + Math.random() * 1.5,
  color: ['#FFD700', '#FFA500', '#ffffff', '#FF3366', '#00FF94', '#0099FF'][i % 6],
  size: 5 + Math.floor(Math.random() * 8),
}))

function FullConfetti({ active }) {
  if (!active) return null
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 300, overflow: 'hidden' }}>
      {FULL_CONFETTI.map((p, i) => (
        <motion.div
          key={i}
          initial={{ top: '-5%', left: `${p.x}%`, opacity: 1, rotate: 0 }}
          animate={{ top: '110%', opacity: 0, rotate: 360 }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
          style={{ position: 'absolute', width: p.size, height: p.size, borderRadius: 2, background: p.color }}
        />
      ))}
    </div>
  )
}

// ─── Quiz Question ─────────────────────────────────────────────────────────────

const TIMER_MAX = 45

function QuizQuestion({ question, qIndex, total, onAnswer }) {
  const { play } = useSound()
  const [selected, setSelected] = useState(null)
  const [timer, setTimer] = useState(TIMER_MAX)
  const [showConfetti, setShowConfetti] = useState(false)
  const cardControls = useAnimation()

  useEffect(() => {
    const id = setInterval(() => setTimer((t) => Math.max(0, t - 1)), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (timer === 0 && selected === null) pick(-1)
  }, [timer]) // eslint-disable-line

  const pick = (idx) => {
    if (selected !== null) return
    try { play('click') } catch (_) {}
    setSelected(idx)
    const correct = idx !== -1 && idx === question.correct
    try { play(correct ? 'correct' : 'wrong') } catch (_) {}
    if (correct) {
      setShowConfetti(true)
    } else {
      cardControls.start({ x: [0, -14, 14, -14, 14, -8, 8, 0], transition: { duration: 0.5 } })
    }
  }

  const timerColor = timer > 20 ? ACCENT : timer > 10 ? '#FFA500' : '#FF3366'
  const timerPct = (timer / TIMER_MAX) * 100
  const isCorrect = selected !== null && selected !== -1 && selected === question.correct

  return (
    <motion.div animate={cardControls} style={{ position: 'relative' }}>
      <ConfettiBurst active={showConfetti} />

      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-1 flex-wrap">
          {QUIZ.map((_, i) => (
            <div
              key={i}
              style={{
                width: 20,
                height: 4,
                borderRadius: 2,
                background: i < qIndex ? ACCENT : i === qIndex ? ACCENT : 'var(--border)',
                opacity: i < qIndex ? 0.5 : 1,
              }}
            />
          ))}
        </div>
        <motion.span
          animate={{ color: timerColor }}
          className="font-mono text-sm font-bold tabular-nums"
        >
          {timer}s
        </motion.span>
      </div>

      <div className="h-1.5 rounded-full mb-6" style={{ background: 'var(--border)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: timerColor, transformOrigin: 'left' }}
          animate={{ width: `${timerPct}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <div className="font-mono text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
        Question {qIndex + 1} of {total}
      </div>

      <h3 className="font-syne font-bold text-xl mb-6" style={{ color: 'var(--text-primary)', lineHeight: 1.4 }}>
        {question.q}
      </h3>

      <div className="flex flex-col gap-3 mb-5">
        {question.options.map((opt, i) => {
          const isThisCorrect = i === question.correct
          const isThisSelected = i === selected

          let border = '1px solid var(--border)'
          let bg = 'var(--bg-secondary)'
          let col = 'var(--text-primary)'
          let shadow = 'none'

          if (selected !== null) {
            if (isThisCorrect) {
              border = `1px solid ${ACCENT}`; bg = 'rgba(255,215,0,0.10)'; col = ACCENT
              shadow = `0 0 16px rgba(255,215,0,0.25)`
            } else if (isThisSelected) {
              border = '1px solid #FF3366'; bg = 'rgba(255,51,102,0.10)'; col = '#FF3366'
            }
          }

          return (
            <motion.button
              key={i}
              type="button"
              onClick={() => pick(i)}
              disabled={selected !== null}
              whileHover={selected === null ? { scale: 1.01 } : {}}
              whileTap={selected === null ? { scale: 0.99 } : {}}
              className="w-full p-4 rounded-xl font-mono text-sm text-left"
              style={{
                background: bg,
                border,
                color: col,
                cursor: selected !== null ? 'default' : 'pointer',
                boxShadow: shadow,
                transition: 'background 0.15s, border-color 0.15s, box-shadow 0.15s, color 0.15s',
              }}
            >
              <span className="font-bold mr-3 text-base" style={{ color: ACCENT }}>
                {['A', 'B', 'C', 'D'][i]}.
              </span>
              {opt}
            </motion.button>
          )
        })}
      </div>

      <AnimatePresence>
        {selected !== null && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl p-4 mb-4"
            style={{
              background: isCorrect ? 'rgba(255,215,0,0.07)' : 'rgba(255,51,102,0.07)',
              border: `1px solid ${isCorrect ? `${ACCENT}33` : '#FF336633'}`,
              borderLeft: `4px solid ${isCorrect ? ACCENT : '#FF3366'}`,
            }}
          >
            <div className="font-syne font-bold text-sm mb-1" style={{ color: isCorrect ? ACCENT : '#FF3366' }}>
              {selected === -1 ? "⏰ Time's up! ngmi moment." : isCorrect ? '🎯 WAGMI! Correct ser.' : '💀 ngmi moment.'}
            </div>
            <p className="font-mono text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {question.fact}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {selected !== null && (
        <motion.button
          type="button"
          onClick={() => onAnswer(selected, timer)}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="btn-primary w-full text-base"
          style={{ fontFamily: 'Syne, sans-serif' }}
        >
          {qIndex + 1 >= total ? 'See My Final Score 🏆' : 'Next Question →'}
        </motion.button>
      )}
    </motion.div>
  )
}

// ─── Quiz Results ──────────────────────────────────────────────────────────────

function getTier(score) {
  if (score === 10) return { label: 'CERTIFIED CRYPTO DEGEN', emoji: '🏆', color: ACCENT, bonus: 500 }
  if (score >= 8) return { label: 'WAGMI SER', emoji: '🚀', color: ACCENT, bonus: 200 }
  if (score >= 5) return { label: 'Getting There', emoji: '📈', color: '#00FF94', bonus: 100 }
  return { label: 'Ser please replay', emoji: '💀', color: '#FF3366', bonus: 0 }
}

function QuizResults({ score, xp, attempt, maxAttempts, totalXP, tweet, onNext, onRetry, onSkip, onContinueAnyway, onTryAgain }) {
  const { play } = useSound()
  const tier = getTier(score)
  const passed = score >= 5
  const isPerfect = score === 10
  const allAttemptsUsed = attempt >= maxAttempts
  const [showFull, setShowFull] = useState(isPerfect)

  return (
    <>
      <FullConfetti active={showFull} />
      <motion.div
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 18 }}
        className="text-center py-6"
      >
        <div className="text-7xl mb-5">{tier.emoji}</div>
        <h2 className="font-syne font-black mb-2" style={{ fontSize: '4rem', color: tier.color }}>
          {score}/10
        </h2>
        <div className="font-syne font-bold text-2xl mb-3" style={{ color: tier.color }}>
          {tier.label}
        </div>

        {isPerfect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            style={{
              background: `linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,165,0,0.15))`,
              border: `2px solid ${ACCENT}`,
              borderRadius: 12,
              padding: '16px 24px',
              margin: '16px auto',
              maxWidth: 400,
            }}
          >
            <div className="font-syne font-black text-lg" style={{ color: ACCENT }}>
              🏆 CERTIFIED CRYPTO DEGEN 🏆
            </div>
            <div className="font-mono text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              Certificate of completion — WEN BRAIN Class of 2026
            </div>
          </motion.div>
        )}

        <div className="font-mono text-sm mb-1 mt-3" style={{ color: ACCENT }}>
          +{xp} Points earned
        </div>
        <div className="font-mono text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
          Total Points: {totalXP.toLocaleString()}
        </div>
        <div className="font-mono text-xs mb-8" style={{ color: 'var(--text-secondary)' }}>
          Attempt {attempt} of {maxAttempts}
        </div>

        <div className="flex flex-col gap-3 items-center">
          <a
            href={`https://twitter.com/intent/tweet?text=${tweet}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary px-8 py-3 inline-flex items-center justify-center gap-2 w-full sm:w-auto"
            style={{ fontFamily: 'Syne, sans-serif', textDecoration: 'none' }}
            onClick={() => { try { play('share') } catch (_) {} }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.213 5.567z" />
            </svg>
            Share on X
          </a>
          {passed && (
            <button
              type="button"
              onClick={onNext}
              className="btn-primary px-8 py-3 w-full sm:w-auto"
              style={{ background: `linear-gradient(135deg, #FFD700, #FFA500)`, color: '#000', fontFamily: 'Syne, sans-serif' }}
            >
              Back to Level Map 🗺️
            </button>
          )}
          {!passed && !allAttemptsUsed && (
            <>
              <button
                type="button"
                onClick={onRetry}
                className="btn-primary px-8 py-3 w-full sm:w-auto"
                style={{ background: ACCENT, color: '#000', fontFamily: 'Syne, sans-serif' }}
              >
                Retry 🔄
              </button>
              <button
                type="button"
                onClick={onSkip}
                className="font-mono text-xs"
                style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}
              >
                Skip for now →
              </button>
            </>
          )}
          {!passed && allAttemptsUsed && (
            <>
              <button
                type="button"
                onClick={onContinueAnyway}
                className="btn-primary px-8 py-3 w-full sm:w-auto"
                style={{ fontFamily: 'Syne, sans-serif' }}
              >
                Continue anyway →
              </button>
              <button
                type="button"
                onClick={onTryAgain}
                className="btn-primary px-8 py-3 w-full sm:w-auto"
                style={{ background: 'none', border: '1px solid var(--border)', fontFamily: 'Syne, sans-serif' }}
              >
                Try again 🔄
              </button>
            </>
          )}
        </div>
      </motion.div>
    </>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

const MAX_ATTEMPTS = 3

function shuffleArray(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function Level10Page() {
  const navigate = useNavigate()
  const { completeLevel, submitToLeaderboard, playerName, totalXP } = useGameStore()
  const { play } = useSound()
  useLevelMeta(10)

  const [quizPhase, setQuizPhase] = useState('story')
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState([])
  const [finalScore, setFinalScore] = useState(0)
  const [earnedXP, setEarnedXP] = useState(0)
  const [attempt, setAttempt] = useState(1)
  const [shuffledQuiz, setShuffledQuiz] = useState(QUIZ)

  const handleAnswer = (selectedIdx, timeLeft) => {
    const q = shuffledQuiz[currentQ]
    const correct = selectedIdx !== -1 && selectedIdx === q.correct
    const baseXP = correct ? 1 : 0
    const newAnswers = [...answers, { correct, xp: baseXP }]
    setAnswers(newAnswers)

    if (currentQ + 1 >= shuffledQuiz.length) {
      const score = newAnswers.filter((a) => a.correct).length
      const xp = newAnswers.reduce((s, a) => s + a.xp, 0) + (score === 10 ? 1 : 0)
      setFinalScore(score)
      setEarnedXP(xp)
      if (score >= 5) {
        completeLevel(10, xp)
        submitToLeaderboard(playerName)
      }
      try { play('levelup') } catch (_) {}
      setQuizPhase('results')
    } else {
      setCurrentQ((c) => c + 1)
    }
  }

  const handleNext = () => {
    window.scrollTo(0, 0)
    navigate('/game')
  }

  const handleRetry = () => {
    setAttempt((a) => a + 1)
    setShuffledQuiz(shuffleArray(QUIZ))
    setCurrentQ(0)
    setAnswers([])
    setQuizPhase('quiz')
  }

  const handleSkip = () => {
    window.scrollTo(0, 0)
    navigate('/game')
  }

  const handleContinueAnyway = () => {
    window.scrollTo(0, 0)
    navigate('/game')
  }

  const handleTryAgain = () => {
    setAttempt(1)
    setShuffledQuiz(shuffleArray(QUIZ))
    setCurrentQ(0)
    setAnswers([])
    setQuizPhase('quiz')
  }

  const tweetText = encodeURIComponent(
    `Started as ngmi.\nNow certified crypto degen.\n\nWAGMI ser. For real this time 👇\n@wenbrainbro\n\n#WenBrain #WAGMI #CryptoDegen`
  )

  const startQuiz = () => {
    try { play('click') } catch (_) {}
    setShuffledQuiz(shuffleArray(QUIZ))
    setAttempt(1)
    setCurrentQ(0)
    setAnswers([])
    setQuizPhase('quiz')
  }

  return (
    <div style={{ paddingTop: '84px', background: 'var(--bg-primary)', minHeight: '100vh', position: 'relative' }}>

      {/* Gold glow */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 900,
        height: 900,
        background: 'radial-gradient(ellipse, rgba(255,215,0,0.07) 0%, transparent 65%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* 780px column */}
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '32px 20px 64px', position: 'relative', zIndex: 1 }}>

        {/* Back nav */}
        <button
          type="button"
          onClick={() => { play('click'); navigate('/game') }}
          className="font-mono text-xs mb-8 flex items-center gap-1 transition-opacity hover:opacity-70"
          style={{ color: 'var(--text-secondary)' }}
        >
          ← back to levels
        </button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            background: 'var(--bg-card)',
            border: `1px solid ${ACCENT}44`,
            borderRadius: 12,
            padding: 32,
            marginBottom: 8,
          }}
        >
          <div className="flex items-center gap-4 mb-3">
            <span style={{ fontSize: 40 }}>🏆</span>
            <div>
              <div className="font-mono text-xs mb-1" style={{ color: ACCENT }}>LEVEL 10 · FINAL BOSS</div>
              <h1
                className="font-syne font-black"
                style={{
                  fontSize: 'clamp(1.5rem, 5vw, 2.25rem)',
                  background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  lineHeight: 1.1,
                }}
              >
                Are You Ready? WAGMI?
              </h1>
            </div>
          </div>
          <p className="font-mono text-sm mb-4" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            You made it. All 10 topics. All 10 levels. One final boss quiz. Let's see what you learned, ser.
          </p>
          <div className="flex gap-3 flex-wrap">
            {[['1,000 Points base', ACCENT], ['+500 perfect bonus', '#FFA500'], ['~10 min read', 'var(--text-secondary)']].map(([t, c]) => (
              <span key={t} className="font-mono text-xs px-3 py-1 rounded-full" style={{ background: `${c}18`, color: c, border: `1px solid ${c}33` }}>
                {t}
              </span>
            ))}
          </div>
        </motion.div>

        {/* ══════════════════ SECTION 1 ══════════════════ */}
        <SectionConnector emoji="🎓" />

        <SectionCard>
          <SectionTag number="1" label="How Far You Have Come" />
          <h2 className="font-syne font-black text-2xl mb-5" style={{ color: 'var(--text-primary)' }}>
            You Started Knowing Nothing. <span style={{ color: ACCENT }}>Now Look.</span>
          </h2>

          <div className="flex flex-col gap-2 mb-6">
            {[
              'Why Bitcoin was created and who made it',
              'The greatest mystery in tech history',
              'How a 19 year old built Ethereum',
              'Why Solana is the casino floor of crypto',
              'The biggest scams and how to spot them',
              'How memecoins go from joke to billions',
              'How whales manipulate markets',
              'How to actually stay safe with your crypto',
              'What is happening in crypto right now',
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                viewport={{ once: true }}
                className="flex gap-3 items-start p-3 rounded-lg font-mono text-sm"
                style={{ background: 'var(--bg-secondary)', border: `1px solid ${ACCENT}22`, color: 'var(--text-secondary)' }}
              >
                <span style={{ color: ACCENT, flexShrink: 0 }}>✅</span>
                {item}
              </motion.div>
            ))}
          </div>

          <p className="font-mono text-sm leading-relaxed mb-5" style={{ color: 'var(--text-secondary)' }}>
            Most people never learn any of this.
            They touch crypto, get rekt, and blame the market.
            You just learned all of it. That already puts you ahead of 99% of people who touch crypto.
          </p>

          <LevelImage src="./images/graduation.gif" alt="Graduation celebration" />

          <CalloutBox>
            <p className="font-mono text-sm leading-relaxed" style={{ color: ACCENT }}>
              🧠 <strong>Knowledge is the only edge that cannot be taken from you.</strong>
              <br /><br />
              Price goes up. Price goes down. Knowledge compounds forever.
            </p>
          </CalloutBox>

          <MemeQuote>"Few understand this. You do now."</MemeQuote>
        </SectionCard>

        {/* ══════════════════ SECTION 2 ══════════════════ */}
        <SectionConnector emoji="🧠" />

        <SectionCard>
          <SectionTag number="2" label="The Mindset That Separates Winners from Losers" />
          <h2 className="font-syne font-black text-2xl mb-5" style={{ color: 'var(--text-primary)' }}>
            Most People Lose. <span style={{ color: ACCENT }}>Here's Why.</span>
          </h2>

          <p className="font-mono text-sm leading-relaxed mb-5" style={{ color: 'var(--text-secondary)' }}>
            Most people lose money in crypto. Not because crypto is bad. Because of their own psychology.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-5">
            <div className="flex-1 p-4 rounded-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid rgba(255,51,102,0.3)', borderLeft: '3px solid #FF3366' }}>
              <div className="font-syne font-bold text-sm mb-3" style={{ color: '#FF3366' }}>The Losing Mindset</div>
              <div className="flex flex-col gap-1.5">
                {[
                  'FOMO into tops',
                  'Panic sell bottoms',
                  'Put in more than you can lose',
                  'Trust strangers on Twitter',
                  'Chase 100x without research',
                  'Check price 50 times per day',
                  'Let gains make you arrogant',
                  'Let losses make you desperate',
                ].map((item) => (
                  <div key={item} className="flex gap-2 font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <span style={{ color: '#FF3366', flexShrink: 0 }}>❌</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 p-4 rounded-xl" style={{ background: 'var(--bg-secondary)', border: `1px solid ${ACCENT}33`, borderLeft: `3px solid ${ACCENT}` }}>
              <div className="font-syne font-bold text-sm mb-3" style={{ color: ACCENT }}>The Winning Mindset</div>
              <div className="flex flex-col gap-1.5">
                {[
                  'Buy when others are fearful',
                  'Take profits on the way up',
                  'Never invest what you cannot lose',
                  'DYOR before every position',
                  'Have a plan before entering',
                  'Zoom out — think in years',
                  'Stay humble when winning',
                  'Stay calm when losing',
                ].map((item) => (
                  <div key={item} className="flex gap-2 font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <span style={{ color: ACCENT, flexShrink: 0 }}>✅</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl mb-4" style={{ background: `${ACCENT}0D`, border: `1px solid ${ACCENT}33` }}>
            <div className="font-syne font-bold text-sm mb-2" style={{ color: ACCENT }}>The hardest truth</div>
            <p className="font-mono text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              The best trade is sometimes no trade.<br />
              Doing nothing is a valid strategy.<br />
              Cash is a position. Patience is a superpower.
            </p>
          </div>

          <LevelImage src="./images/mindset.gif" alt="Winning mindset" />

          <MemeQuote>"The market can stay irrational longer than you can stay solvent."</MemeQuote>
        </SectionCard>

        {/* ══════════════════ SECTION 3 ══════════════════ */}
        <SectionConnector emoji="📅" />

        <SectionCard>
          <SectionTag number="3" label="DCA: The Strategy That Works" />
          <h2 className="font-syne font-black text-2xl mb-5" style={{ color: 'var(--text-primary)' }}>
            The Most Boring Strategy. <span style={{ color: ACCENT }}>The Most Effective.</span>
          </h2>

          <p className="font-mono text-sm leading-relaxed mb-5" style={{ color: 'var(--text-secondary)' }}>
            DCA = Dollar Cost Averaging. Instead of investing $1,000 all at once
            you invest $100 every month for 10 months.
            Sometimes you buy high. Sometimes you buy low. Average out over time.
            Remove emotion from the equation.
          </p>

          <div className="rounded-xl p-4 mb-5" style={{ background: 'var(--bg-secondary)', border: `1px solid ${ACCENT}33` }}>
            <div className="font-syne font-bold text-sm mb-3" style={{ color: ACCENT }}>Real example</div>
            <div className="flex flex-col gap-2">
              {[
                { label: 'Strategy', value: '$100/month into Bitcoin since 2020' },
                { label: 'Total invested', value: '$6,000 over 5 years' },
                { label: 'Value today', value: '$50,000+' },
                { label: 'Charts checked', value: 'Zero required' },
                { label: 'Stress level', value: 'Minimal' },
              ].map((row) => (
                <div key={row.label} className="flex gap-3 font-mono text-sm">
                  <span className="font-bold flex-shrink-0" style={{ color: ACCENT, minWidth: 120 }}>{row.label}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 mb-5">
            {[
              { title: 'Nobody can time the market', desc: 'Not you. Not professional traders. Not hedge funds. DCA removes the need to be right.', color: ACCENT },
              { title: 'You just need to be consistent', desc: 'Same amount. Same interval. Regardless of price. Let time do the work.', color: ACCENT },
              { title: 'Boring wins. Exciting loses.', desc: 'Every story of catastrophic loss starts with excitement. Every story of long-term gains starts with boring consistency.', color: '#FFA500' },
            ].map((item, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-secondary)', border: `1px solid ${item.color}22` }}>
                <span style={{ color: item.color, flexShrink: 0, fontFamily: 'monospace', fontSize: 14 }}>→</span>
                <div>
                  <div className="font-syne font-bold text-sm" style={{ color: item.color }}>{item.title}</div>
                  <div className="font-mono text-xs leading-relaxed mt-0.5" style={{ color: 'var(--text-secondary)' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <LevelImage src="./images/dca.gif" alt="Dollar cost averaging strategy" />

          <CalloutBox>
            <p className="font-mono text-sm leading-relaxed" style={{ color: ACCENT }}>
              📅 <strong>Time in the market beats timing the market. Every time. No exceptions.</strong>
              <br /><br />
              Boring wins. Exciting loses. Not financial advice.
            </p>
          </CalloutBox>
        </SectionCard>

        {/* ══════════════════ SECTION 4 ══════════════════ */}
        <SectionConnector emoji="🎢" />

        <SectionCard>
          <SectionTag number="4" label="The Emotional Cycle: One More Time" />
          <h2 className="font-syne font-black text-2xl mb-5" style={{ color: 'var(--text-primary)' }}>
            You Will Experience This. <span style={{ color: ACCENT }}>Guaranteed.</span>
          </h2>

          <div className="flex flex-col gap-2 mb-6">
            {[
              { icon: '🟢', text: 'You buy. Price goes up. You feel like a genius.', color: '#00FF94' },
              { icon: '🟡', text: 'Price keeps going up. You buy more. FOMO intensifies.', color: ACCENT },
              { icon: '🔴', text: "Price drops 20%. You tell yourself it's fine.", color: '#FFA500' },
              { icon: '🔴', text: 'Price drops 50%. You start to panic.', color: '#FF6600' },
              { icon: '🔴', text: 'Price drops 70%. You sell everything. Rekt.', color: '#FF3366' },
              { icon: '🟢', text: 'Price recovers. You watch from the sidelines.', color: '#00FF94' },
              { icon: '🟢', text: 'Price hits new ATH. You feel sick.', color: ACCENT },
              { icon: '🔄', text: 'Repeat until you learn or go broke.', color: 'var(--text-secondary)' },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                viewport={{ once: true }}
                className="flex gap-3 items-start p-3 rounded-lg"
                style={{ background: 'var(--bg-secondary)', borderLeft: `2px solid ${step.color}44` }}
              >
                <span style={{ fontSize: 16, flexShrink: 0 }}>{step.icon}</span>
                <span className="font-mono text-sm" style={{ color: 'var(--text-secondary)' }}>{step.text}</span>
              </motion.div>
            ))}
          </div>

          <div className="p-4 rounded-xl mb-5" style={{ background: `${ACCENT}0D`, border: `1px solid ${ACCENT}33`, borderLeft: `3px solid ${ACCENT}` }}>
            <div className="font-syne font-bold text-sm mb-2" style={{ color: ACCENT }}>The only way to break the cycle</div>
            <div className="flex flex-col gap-1 font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
              <span>Have a plan <strong style={{ color: 'var(--text-primary)' }}>before</strong> you invest. Decide in advance:</span>
              <span style={{ marginLeft: 12 }}>→ How much you are putting in</span>
              <span style={{ marginLeft: 12 }}>→ At what price you will take profits</span>
              <span style={{ marginLeft: 12 }}>→ At what price you will cut losses</span>
              <span style={{ marginLeft: 12 }}>→ How long you are holding</span>
              <span style={{ marginTop: 8 }}>Write it down. Stick to it. Your future emotional self will try to convince you to abandon the plan. Do not listen to emotional self. Listen to rational plan self.</span>
            </div>
          </div>

          <LevelImage src="./images/emotional_cycle.gif" alt="Crypto emotional cycle" />

          <MemeQuote>"Just going to check the price one more time before bed" — everyone at 3am during a bull run</MemeQuote>
        </SectionCard>

        {/* ══════════════════ SECTION 5 ══════════════════ */}
        <SectionConnector emoji="🗺️" />

        <SectionCard>
          <SectionTag number="5" label="Your Next Steps" />
          <h2 className="font-syne font-black text-2xl mb-5" style={{ color: 'var(--text-primary)' }}>
            You Finished WEN BRAIN. <span style={{ color: ACCENT }}>Now What?</span>
          </h2>

          <div className="flex flex-col gap-4 mb-5">
            {[
              {
                step: 'Step 1 — Start small and real',
                items: [
                  'Buy a tiny amount of BTC or ETH. $10. $20. Whatever.',
                  'Feel what it is like to own real crypto.',
                  'Watch it go up and down. Learn your emotional reactions.',
                ],
                color: ACCENT,
              },
              {
                step: 'Step 2 — Set up a real wallet',
                items: [
                  'Download MetaMask or Phantom.',
                  'Write down your seed phrase on paper. Never digitally.',
                  'Send your tiny amount from exchange to wallet.',
                  'Feel what true self-custody ownership feels like.',
                ],
                color: '#00FF94',
              },
              {
                step: 'Step 3 — Follow good voices',
                items: [
                  '@naval — philosophy and Bitcoin',
                  '@DocumentingBTC — Bitcoin milestones',
                  '@cobie — honest crypto takes',
                  '@sassal0x — Ethereum deep dives',
                  '@inversebrah — market analysis',
                ],
                color: '#0099FF',
              },
              {
                step: 'Step 4 — Never stop questioning',
                items: [
                  'If it sounds too good to be true — it is.',
                  'If someone guarantees returns — run.',
                  'If you feel FOMO — pause.',
                  'If you feel panic — do nothing.',
                ],
                color: '#FF3366',
              },
              {
                step: 'Step 5 — Come back and replay',
                items: [
                  'Markets change. Crypto evolves.',
                  'New scams. New opportunities. New narratives. New cycles.',
                  'Keep learning. Keep questioning.',
                  'WEN BRAIN will keep adding levels.',
                ],
                color: ACCENT,
              },
            ].map((group, i) => (
              <div key={i} className="p-4 rounded-xl" style={{ background: 'var(--bg-secondary)', border: `1px solid ${group.color}33`, borderLeft: `3px solid ${group.color}` }}>
                <div className="font-syne font-bold text-sm mb-2" style={{ color: group.color }}>{group.step}</div>
                <div className="flex flex-col gap-1">
                  {group.items.map((item) => (
                    <div key={item} className="flex gap-2 font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <span style={{ color: group.color, flexShrink: 0 }}>→</span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <LevelImage src="./images/wagmi_final.gif" alt="WAGMI final celebration" />

          <MemeQuote>
            "You started as ngmi.{'\n'}
            You are now significantly less ngmi.{'\n'}
            That is what winning looks like in crypto.{'\n'}
            WAGMI ser. For real this time. 🧠"
          </MemeQuote>
        </SectionCard>

        {/* ══════════════════ QUIZ ══════════════════ */}
        <SectionConnector emoji="🏆" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: '-50px' }}
          className="text-center"
          style={{
            background: 'var(--bg-card)',
            border: `1px solid ${ACCENT}44`,
            borderLeft: `4px solid ${ACCENT}`,
            borderRadius: 12,
            padding: 32,
          }}
        >
          <div style={{ fontSize: 56, marginBottom: 12 }}>🏆</div>
          <h2 className="font-syne font-black text-2xl mb-2" style={{ color: 'var(--text-primary)' }}>
            Final Boss Quiz
          </h2>
          <p className="font-mono text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
            10 questions · All topics · 45 seconds each
          </p>
          <div className="flex justify-center gap-6 mb-8 flex-wrap">
            {[['+1 PT', 'per correct answer', '#F7931A'], ['+1 PT', 'perfect bonus', '#00FF94']].map(([val, lbl, c]) => (
              <div key={lbl} className="text-center">
                <div className="font-syne font-bold text-xl" style={{ color: c }}>{val}</div>
                <div className="font-mono text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{lbl}</div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={startQuiz}
            className="btn-primary px-12 py-4 text-lg"
            style={{ fontFamily: 'Syne, sans-serif', background: `linear-gradient(135deg, #FFD700, #FFA500)`, color: '#000' }}
          >
            Start Final Boss 🏆
          </button>
        </motion.div>

      </div>

      {/* ── Fullscreen quiz overlay ── */}
      <AnimatePresence>
        {quizPhase !== 'story' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(8,11,17,0.97)',
              backdropFilter: 'blur(12px)',
              zIndex: 200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.06, type: 'spring', damping: 22 }}
              style={{
                width: '100%',
                maxWidth: 680,
                background: 'var(--bg-card)',
                border: `1px solid ${ACCENT}44`,
                borderLeft: `4px solid ${ACCENT}`,
                borderRadius: 16,
                padding: 32,
                position: 'relative',
                overflow: 'hidden',
                maxHeight: '90vh',
                overflowY: 'auto',
              }}
            >
              {quizPhase === 'quiz' && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <span style={{ fontSize: 24 }}>🏆</span>
                    <h2 className="font-syne font-black text-xl" style={{ color: 'var(--text-primary)' }}>
                      Final Boss — All 10 Topics
                    </h2>
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentQ}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.3 }}
                    >
                      <QuizQuestion
                        question={shuffledQuiz[currentQ]}
                        qIndex={currentQ}
                        total={shuffledQuiz.length}
                        onAnswer={handleAnswer}
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
              )}

              {quizPhase === 'results' && (
                <QuizResults
                  score={finalScore}
                  xp={earnedXP}
                  attempt={attempt}
                  maxAttempts={MAX_ATTEMPTS}
                  totalXP={totalXP}
                  tweet={tweetText}
                  onNext={handleNext}
                  onRetry={handleRetry}
                  onSkip={handleSkip}
                  onContinueAnyway={handleContinueAnyway}
                  onTryAgain={handleTryAgain}
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
