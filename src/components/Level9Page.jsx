import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/useGameStore'
import { useSound } from '../hooks/useSound'
import { useLevelMeta } from '../hooks/useLevelMeta'

const ACCENT = '#E0E0E0'

const QUIZ = [
  {
    q: 'What happened on January 10, 2024?',
    options: [
      'Bitcoin hit $1 million',
      'Satoshi returned',
      'SEC approved Bitcoin spot ETFs allowing mainstream investment',
      'Ethereum merged with Bitcoin',
    ],
    correct: 2,
    fact: 'The SEC approved 11 Bitcoin spot ETFs including BlackRock\'s IBIT. This was historic — 10 years of rejections ended overnight. $10 billion flowed in during the first month. It was the fastest ETF to reach $50B in history and brought crypto to every brokerage account.',
  },
  {
    q: 'What does the Bitcoin Halving do?',
    options: [
      'Doubles the Bitcoin supply',
      'Cuts mining rewards in half every 4 years reducing new supply',
      'Splits Bitcoin into two coins',
      'Halves the transaction fees',
    ],
    correct: 1,
    fact: 'Every 210,000 blocks (~4 years) the reward for mining a Bitcoin block is cut in half. In 2024 it dropped from 6.25 to 3.125 BTC per block. Less new supply + same or growing demand = historically higher prices. After every halving Bitcoin hit a new ATH within 12-18 months.',
  },
  {
    q: 'What is a Layer 2 blockchain?',
    options: [
      'The second biggest blockchain',
      'A second layer of security on Bitcoin',
      'A faster cheaper network built on top of Ethereum to reduce fees',
      'A type of cold storage wallet',
    ],
    correct: 2,
    fact: 'Layer 2s like Arbitrum, Optimism, and Base process transactions off the main Ethereum chain and settle them later. This reduces gas fees from $50-500 down to under $0.01. Base (built by Coinbase) exploded in 2024-2025 as the home of meme coins, AI agent tokens, and millions of Coinbase users going on-chain.',
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
        border: '1px solid rgba(224,224,224,0.18)',
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
        background: `rgba(224,224,224,0.06)`,
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
        border: '1px solid rgba(224,224,224,0.19)',
        boxShadow: '0 0 24px rgba(224,224,224,0.08)',
        margin: '20px 0',
      }}
    />
  )
}

// ─── Confetti burst ───────────────────────────────────────────────────────────

const CONFETTI = Array.from({ length: 22 }, (_, i) => ({
  angle: (i / 22) * Math.PI * 2,
  dist: 50 + (i * 13) % 80,
  color: ['#E0E0E0', '#ffffff', '#FFD700', '#A8A8A8', '#FF3366', '#0099FF'][i % 6],
  size: 6 + (i % 4),
  delay: (i % 5) * 0.035,
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
            rotate: 180,
          }}
          transition={{ duration: 0.75, ease: 'easeOut', delay: p.delay }}
          style={{ position: 'absolute', width: p.size, height: p.size, borderRadius: 2, background: p.color }}
        />
      ))}
    </div>
  )
}

// ─── Quiz Question ─────────────────────────────────────────────────────────────

function QuizQuestion({ question, qIndex, total, onAnswer }) {
  const { play } = useSound()
  const [selected, setSelected] = useState(null)
  const [timer, setTimer] = useState(30)
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

  const timerColor = timer > 15 ? ACCENT : timer > 8 ? '#FFD700' : '#FF3366'
  const timerPct = (timer / 30) * 100
  const isCorrect = selected !== null && selected !== -1 && selected === question.correct

  return (
    <motion.div animate={cardControls} style={{ position: 'relative' }}>
      <ConfettiBurst active={showConfetti} />

      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-2">
          {QUIZ.map((_, i) => (
            <div
              key={i}
              style={{
                width: 28,
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
              border = `1px solid ${ACCENT}`; bg = 'rgba(224,224,224,0.10)'; col = ACCENT
              shadow = `0 0 16px rgba(224,224,224,0.20)`
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
              background: isCorrect ? 'rgba(224,224,224,0.07)' : 'rgba(255,51,102,0.07)',
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
          {qIndex + 1 >= total ? 'See My Score 🏆' : 'Next Question →'}
        </motion.button>
      )}
    </motion.div>
  )
}

// ─── Quiz Results ──────────────────────────────────────────────────────────────

function QuizResults({ score, xp, attempt, maxAttempts, totalXP, tweet, onNext, onRetry, onSkip, onContinueAnyway, onTryAgain }) {
  const { play } = useSound()
  const isWagmi = score === 3
  const passed = score >= 2
  const allAttemptsUsed = attempt >= maxAttempts

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', damping: 18 }}
      className="text-center py-6"
    >
      <div className="text-7xl mb-5">{isWagmi ? '🏆' : passed ? '🚀' : '💀'}</div>
      <h2 className="font-syne font-black mb-2" style={{ fontSize: '4rem', color: isWagmi ? '#FFD700' : ACCENT }}>
        {score}/3
      </h2>
      <div className="font-syne font-bold text-2xl mb-2" style={{ color: isWagmi ? '#FFD700' : passed ? ACCENT : '#FF3366' }}>
        {isWagmi ? 'WAGMI SER 🚀' : passed ? 'Not bad, anon.' : 'ngmi... for now.'}
      </div>
      <div className="font-mono text-sm mb-1" style={{ color: ACCENT }}>
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
          href={`https://twitter.com/intent/tweet?text=${tweet}&url=https://wenbrain.com/level/9`}
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
            style={{ background: `linear-gradient(135deg,#fff,#A8A8A8)`, color: '#000', fontFamily: 'Syne, sans-serif' }}
          >
            Next Level 🚀
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

export default function Level9Page() {
  const navigate = useNavigate()
  const { completeLevel, submitToLeaderboard, playerName, totalXP } = useGameStore()
  const { play } = useSound()
  useLevelMeta(9)

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
      const xp = newAnswers.reduce((s, a) => s + a.xp, 0) + (score === 3 ? 1 : 0)
      setFinalScore(score)
      setEarnedXP(xp)
      if (score >= 2) {
        completeLevel(9, xp)
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
    `ETFs approved. Halving done. AI agents trading.\nThe game changed. Did you keep up?\n\nGet up to speed 👇\n@wenbrainbro\n\n#WenBrain #Bitcoin #Crypto`
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

      {/* Silver glow */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 900,
        height: 900,
        background: 'radial-gradient(ellipse, rgba(224,224,224,0.04) 0%, transparent 65%)',
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
            <span style={{ fontSize: 40 }}>🚀</span>
            <div>
              <div className="font-mono text-xs mb-1" style={{ color: ACCENT }}>LEVEL 9 · THE CURRENT META</div>
              <h1 className="font-syne font-black" style={{ fontSize: 'clamp(1.5rem, 5vw, 2.25rem)', color: 'var(--text-primary)', lineHeight: 1.1 }}>
                What's Happening NOW
              </h1>
            </div>
          </div>
          <p className="font-mono text-sm mb-4" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            Bitcoin ETF. The Halving. AI agents. Layer 2s. Where we are in the cycle. The current meta — explained.
          </p>
          <div className="flex gap-3 flex-wrap">
            {[['3 PTS base', ACCENT], ['+1 perfect bonus', '#FFD700'], ['~8 min read', 'var(--text-secondary)']].map(([t, c]) => (
              <span key={t} className="font-mono text-xs px-3 py-1 rounded-full" style={{ background: `${c}18`, color: c, border: `1px solid ${c}33` }}>
                {t}
              </span>
            ))}
          </div>
        </motion.div>

        {/* ══════════════════ SECTION 1 ══════════════════ */}
        <SectionConnector emoji="🏦" />

        <SectionCard>
          <SectionTag number="1" label="The Bitcoin ETF: When Wall Street Finally Gave In" />
          <h2 className="font-syne font-black text-2xl mb-5" style={{ color: 'var(--text-primary)' }}>
            January 10, 2024. <span style={{ color: ACCENT }}>Everything Changed.</span>
          </h2>

          <p className="font-mono text-sm leading-relaxed mb-5" style={{ color: 'var(--text-secondary)' }}>
            For 10 years crypto people begged for this. For 10 years the SEC said no. Then BlackRock applied.
            BlackRock manages <strong style={{ color: 'var(--text-primary)' }}>$10 trillion in assets</strong>. They have never lost an ETF application.
            The SEC approved it in days.
          </p>

          <div className="rounded-xl p-4 mb-5" style={{ background: 'var(--bg-secondary)', border: `1px solid ${ACCENT}33` }}>
            <div className="font-syne font-bold text-sm mb-3" style={{ color: ACCENT }}>What is an ETF?</div>
            <p className="font-mono text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Exchange Traded Fund. You buy it like a stock on Nasdaq. No wallet. No seed phrase. No crypto exchange.
              Just buy <strong style={{ color: 'var(--text-primary)' }}>IBIT</strong> on your Robinhood account and you own Bitcoin exposure.
              Your grandma can now buy Bitcoin — without knowing what a blockchain is.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-5">
            {[
              { value: '$10B', label: 'inflows in first month' },
              { value: '$50B', label: 'fastest ETF to reach it in history' },
              { value: '#1', label: 'IBIT holds most BTC (ex-Satoshi)' },
              { value: 'Daily', label: 'more BTC into ETF than mined' },
            ].map((s) => (
              <div key={s.label} className="flex-1 p-4 rounded-xl text-center" style={{ background: 'var(--bg-secondary)', border: `1px solid ${ACCENT}22` }}>
                <div className="font-syne font-black text-xl mb-1" style={{ color: ACCENT }}>{s.value}</div>
                <div className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          <LevelImage src="./images/btc_etf.gif" alt="Bitcoin ETF approval" />

          <CalloutBox>
            <p className="font-mono text-sm leading-relaxed" style={{ color: ACCENT }}>
              🏦 <strong>The Bitcoin ETF approval was the moment crypto stopped being alternative finance and became mainstream finance.</strong>
              <br /><br />
              Love it or hate it — it changed everything.
            </p>
          </CalloutBox>

          <MemeQuote>"Your boomer dad can now accidentally buy Bitcoin in his 401k"</MemeQuote>
        </SectionCard>

        {/* ══════════════════ SECTION 2 ══════════════════ */}
        <SectionConnector emoji="⛏️" />

        <SectionCard>
          <SectionTag number="2" label="The Bitcoin Halving: Supply Shock Every 4 Years" />
          <h2 className="font-syne font-black text-2xl mb-5" style={{ color: 'var(--text-primary)' }}>
            Less Supply. <span style={{ color: ACCENT }}>Same Demand. Basic Math.</span>
          </h2>

          <p className="font-mono text-sm leading-relaxed mb-5" style={{ color: 'var(--text-secondary)' }}>
            Every 210,000 blocks (roughly 4 years) Bitcoin mining rewards get cut in half. This is called the Halving.
            No vote. No committee. The code just runs.
          </p>

          <div className="rounded-xl p-5 mb-5" style={{ background: 'var(--bg-secondary)', border: `1px solid ${ACCENT}33` }}>
            <div className="font-syne font-bold text-sm mb-3" style={{ color: ACCENT }}>Halving history</div>
            <div className="flex flex-col gap-2">
              {[
                { year: '2009', reward: '50 BTC / block', note: 'Genesis block', done: false },
                { year: '2012', reward: '25 BTC / block', note: '1st halving → ATH $1,200', done: false },
                { year: '2016', reward: '12.5 BTC / block', note: '2nd halving → ATH $20,000', done: false },
                { year: '2020', reward: '6.25 BTC / block', note: '3rd halving → ATH $69,000', done: false },
                { year: '2024', reward: '3.125 BTC / block', note: '4th halving → ATH $126,000 ✓', done: true },
                { year: '2028', reward: '1.5625 BTC / block', note: 'next one — unknown ATH', done: false },
              ].map((row, i) => (
                <div
                  key={i}
                  className="flex gap-4 font-mono text-sm"
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: row.done ? `${ACCENT}0D` : 'transparent',
                    border: `1px solid ${row.done ? ACCENT + '33' : 'transparent'}`,
                  }}
                >
                  <span style={{ color: 'var(--text-secondary)', minWidth: 36 }}>{row.year}</span>
                  <span style={{ color: row.done ? ACCENT : 'var(--text-primary)', fontWeight: row.done ? 700 : 400, minWidth: 140 }}>{row.reward}</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{row.note}</span>
                </div>
              ))}
            </div>
          </div>

          <LevelImage src="./images/halving.gif" alt="Bitcoin halving explained" />

          <CalloutBox>
            <p className="font-mono text-sm leading-relaxed" style={{ color: ACCENT }}>
              ⛏️ <strong>Bitcoin has a built-in supply reduction programmed in forever.</strong>
              <br /><br />
              No central bank. No committee. No vote. The code just runs. Every 4 years. Automatically.
            </p>
          </CalloutBox>

          <MemeQuote>"Past performance does not guarantee future results. But the pattern is hard to ignore."</MemeQuote>
        </SectionCard>

        {/* ══════════════════ SECTION 3 ══════════════════ */}
        <SectionConnector emoji="🤖" />

        <SectionCard>
          <SectionTag number="3" label="AI + Crypto: The New Narrative" />
          <h2 className="font-syne font-black text-2xl mb-5" style={{ color: 'var(--text-primary)' }}>
            Every Cycle Has a <span style={{ color: ACCENT }}>Narrative.</span>
          </h2>

          <div className="rounded-xl p-4 mb-5" style={{ background: 'var(--bg-secondary)', border: `1px solid ${ACCENT}33` }}>
            <div className="font-syne font-bold text-sm mb-3" style={{ color: ACCENT }}>Narrative timeline</div>
            <div className="flex flex-col gap-2">
              {[
                { year: '2017', label: 'ICOs — everyone launches a token' },
                { year: '2020', label: 'DeFi — decentralized finance' },
                { year: '2021', label: 'NFTs — digital art and gaming' },
                { year: '2024–25', label: 'AI + Crypto — the current meta' },
              ].map((row, i) => (
                <div key={i} className="flex gap-3 font-mono text-sm">
                  <span className="font-bold flex-shrink-0" style={{ color: ACCENT, minWidth: 68 }}>{row.year}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="font-mono text-sm leading-relaxed mb-5" style={{ color: 'var(--text-secondary)' }}>
            The idea: combine AI with blockchain. AI agents that own wallets. AI that trades autonomously on-chain.
            Decentralized compute for AI training.
          </p>

          <div className="flex flex-col gap-3 mb-5">
            {[
              { name: 'TAO (Bittensor)', desc: 'Decentralized AI network. Miners compete to train the best AI models. Rewarded in TAO tokens.', color: ACCENT },
              { name: 'FET (Fetch.ai)', desc: 'AI agents that operate autonomously on blockchain.', color: ACCENT },
              { name: 'NEAR Protocol', desc: 'AI-friendly blockchain with developer focus.', color: ACCENT },
              { name: 'Virtuals Protocol', desc: 'AI agent launchpad on Base chain. AI agents with their own tokens. Some agents made millions trading.', color: '#FFD700' },
            ].map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                viewport={{ once: true }}
                className="flex gap-3 p-3 rounded-xl"
                style={{ background: 'var(--bg-secondary)', border: `1px solid ${p.color}22` }}
              >
                <span style={{ color: p.color, flexShrink: 0, fontFamily: 'monospace', fontSize: 14 }}>→</span>
                <div>
                  <div className="font-syne font-bold text-sm" style={{ color: p.color }}>{p.name}</div>
                  <div className="font-mono text-xs leading-relaxed mt-0.5" style={{ color: 'var(--text-secondary)' }}>{p.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>

          <LevelImage src="./images/ai_crypto.gif" alt="AI and crypto combined" />

          <CalloutBox>
            <p className="font-mono text-sm leading-relaxed" style={{ color: ACCENT }}>
              🤖 <strong>AI + Crypto is either the future of autonomous digital economies or the most elaborate way to lose money ever invented.</strong>
              <br /><br />
              Possibly both.
            </p>
          </CalloutBox>

          <MemeQuote>"The AI is trading crypto better than you. And it launched its own token."</MemeQuote>
        </SectionCard>

        {/* ══════════════════ SECTION 4 ══════════════════ */}
        <SectionConnector emoji="⚡" />

        <SectionCard>
          <SectionTag number="4" label="Layer 2s and Base: Ethereum Gets Cheaper" />
          <h2 className="font-syne font-black text-2xl mb-5" style={{ color: 'var(--text-primary)' }}>
            Ethereum is Expensive. <span style={{ color: ACCENT }}>Layer 2s Are Not.</span>
          </h2>

          <p className="font-mono text-sm leading-relaxed mb-5" style={{ color: 'var(--text-secondary)' }}>
            Gas fees on Ethereum can be $50–$500 per transaction. So developers built Layer 2s — faster, cheaper networks
            that settle transactions on Ethereum later. Like a highway toll road: pay $0.01 on the side road instead of $100 on the main road.
          </p>

          <div className="flex flex-col gap-3 mb-5">
            {[
              { name: 'Arbitrum', desc: 'Biggest L2 by TVL. Fast, cheap, EVM compatible.', hot: false },
              { name: 'Optimism', desc: 'Fast growing. OP token. Developer friendly.', hot: false },
              { name: 'Base', desc: 'Built by Coinbase (2023). Exploded in 2024. Home of AI agent tokens, BRETT, DEGEN, and more. Lowest fees.', hot: true },
              { name: 'zkSync', desc: 'Zero knowledge proofs. Next-gen cryptography.', hot: false },
              { name: 'Polygon', desc: 'Been around longest. Widely integrated across dApps.', hot: false },
            ].map((l, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                viewport={{ once: true }}
                className="flex gap-3 p-3 rounded-xl"
                style={{
                  background: l.hot ? `${ACCENT}0D` : 'var(--bg-secondary)',
                  border: `1px solid ${l.hot ? ACCENT + '44' : ACCENT + '15'}`,
                }}
              >
                <span style={{ color: ACCENT, flexShrink: 0, fontFamily: 'monospace', fontSize: 14 }}>→</span>
                <div>
                  <div className="font-syne font-bold text-sm" style={{ color: ACCENT }}>
                    {l.name}
                    {l.hot && <span className="font-mono text-xs ml-2" style={{ color: '#FFD700' }}>HOT</span>}
                  </div>
                  <div className="font-mono text-xs leading-relaxed mt-0.5" style={{ color: 'var(--text-secondary)' }}>{l.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-5">
            {[
              { value: '100M+', label: 'Coinbase users on Base' },
              { value: '< $0.01', label: 'average gas fee' },
              { value: 'Daily', label: 'AI agent tokens launching' },
            ].map((s) => (
              <div key={s.label} className="flex-1 p-4 rounded-xl text-center" style={{ background: 'var(--bg-secondary)', border: `1px solid ${ACCENT}22` }}>
                <div className="font-syne font-black text-xl mb-1" style={{ color: ACCENT }}>{s.value}</div>
                <div className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          <LevelImage src="./images/layer2.gif" alt="Layer 2 blockchains explained" />

          <MemeQuote>"Ethereum is too expensive. Base exists. Problem solved. Kind of."</MemeQuote>
        </SectionCard>

        {/* ══════════════════ SECTION 5 ══════════════════ */}
        <SectionConnector emoji="📊" />

        <SectionCard>
          <SectionTag number="5" label="Where Are We in the Cycle?" />
          <h2 className="font-syne font-black text-2xl mb-5" style={{ color: 'var(--text-primary)' }}>
            Understanding Where You Are is <span style={{ color: ACCENT }}>the Most Valuable Skill.</span>
          </h2>

          <div className="flex flex-col gap-3 mb-5">
            {[
              {
                emoji: '🥶',
                phase: 'BEAR MARKET',
                sub: 'accumulation',
                desc: 'Prices low. Nobody talks about crypto. Media says it is dead. Smart money buys quietly.',
                color: '#0099FF',
              },
              {
                emoji: '🌱',
                phase: 'RECOVERY',
                sub: 'disbelief',
                desc: 'Prices start rising. Most people do not believe it. "Just a dead cat bounce" they say.',
                color: ACCENT,
              },
              {
                emoji: '🚀',
                phase: 'BULL MARKET',
                sub: 'euphoria',
                desc: 'Everything pumps. Even bad projects. Your taxi driver asks about crypto. Media covers it daily. Be careful.',
                color: '#FFD700',
              },
              {
                emoji: '💀',
                phase: 'CRASH',
                sub: 'despair',
                desc: 'ATH followed by 70–90% crash. People say crypto is dead forever. It never dies. It just resets.',
                color: '#FF3366',
              },
            ].map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
                viewport={{ once: true }}
                className="flex gap-4 p-4 rounded-xl"
                style={{ background: 'var(--bg-secondary)', border: `1px solid ${p.color}22`, borderLeft: `3px solid ${p.color}` }}
              >
                <span style={{ fontSize: 24, flexShrink: 0 }}>{p.emoji}</span>
                <div>
                  <div className="font-syne font-bold text-sm" style={{ color: p.color }}>
                    {p.phase} <span className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>({p.sub})</span>
                  </div>
                  <div className="font-mono text-xs leading-relaxed mt-1" style={{ color: 'var(--text-secondary)' }}>{p.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="p-4 rounded-xl mb-5" style={{ background: `${ACCENT}0D`, border: `1px solid ${ACCENT}33`, borderLeft: `3px solid ${ACCENT}` }}>
            <div className="font-syne font-bold text-sm mb-2" style={{ color: ACCENT }}>Where we are now (2026)</div>
            <p className="font-mono text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Bitcoin hit $126K ATH in October 2025.<br />
              Currently trading around $83K.<br />
              Post-ATH correction in progress. Cycle not necessarily over. Caution is warranted.
            </p>
          </div>

          <div className="p-4 rounded-xl mb-5" style={{ background: `rgba(255,51,102,0.07)`, border: '1px solid #FF336633', borderLeft: '3px solid #FF3366' }}>
            <div className="font-syne font-bold text-sm mb-1" style={{ color: '#FF3366' }}>The honest truth</div>
            <p className="font-mono text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Nobody knows where the cycle ends. Anyone who says they do is lying.
              The best strategy: DCA in, take profits on the way up, never invest what you cannot afford to lose completely.
            </p>
          </div>

          <LevelImage src="./images/cycle.gif" alt="Crypto market cycle" />

          <CalloutBox>
            <p className="font-mono text-sm leading-relaxed" style={{ color: ACCENT }}>
              📊 <strong>The cycle always ends. The cycle always comes back.</strong>
              <br /><br />
              The people who survive are those who do not panic sell the bottom and do not YOLO the top.
              Easier said than done.
            </p>
          </CalloutBox>

          <MemeQuote>
            "We are so back. It is so over. We are so back.{'\n'}
            — Crypto Twitter, every 3 months, forever"
          </MemeQuote>
        </SectionCard>

        {/* ══════════════════ QUIZ ══════════════════ */}
        <SectionConnector emoji="🚀" />

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
          <div style={{ fontSize: 48, marginBottom: 12 }}>🚀</div>
          <h2 className="font-syne font-black text-2xl mb-2" style={{ color: 'var(--text-primary)' }}>Quiz Time</h2>
          <p className="font-mono text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            3 questions · 30 seconds each
          </p>
          <div className="flex justify-center gap-8 mb-8">
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
            style={{ fontFamily: 'Syne, sans-serif', background: `linear-gradient(135deg, #fff, #A8A8A8)`, color: '#000' }}
          >
            Start Quiz 🚀
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
                    <span style={{ fontSize: 24 }}>🚀</span>
                    <h2 className="font-syne font-black text-xl" style={{ color: 'var(--text-primary)' }}>
                      The Current Meta — Quiz
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
