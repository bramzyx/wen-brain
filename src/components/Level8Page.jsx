import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/useGameStore'
import { useSound } from '../hooks/useSound'
import { useLevelMeta } from '../hooks/useLevelMeta'

const ACCENT = '#00FF94'

const QUIZ = [
  {
    q: 'What is a seed phrase?',
    options: [
      'Your exchange account password',
      'A code sent by email to verify login',
      '12-24 words that give complete control over your crypto wallet',
      'A special Bitcoin mining code',
    ],
    correct: 2,
    fact: '12 or 24 random words that ARE your wallet. Anyone who has them controls all your crypto. Lose them = lose everything. Forever. No customer support, no password reset, no exceptions. Write them on paper and store safely.',
  },
  {
    q: 'What is the main difference between a CEX and a DEX?',
    options: [
      'CEX is faster than DEX',
      'On a CEX the company holds your funds, on a DEX you always control them',
      'DEX requires more ID verification',
      'CEX only trades Bitcoin',
    ],
    correct: 1,
    fact: 'On a CEX (Coinbase, Binance) the company holds your crypto — you own an IOU. They can freeze your account, go bankrupt, or block withdrawals. On a DEX (Uniswap, Jupiter) you connect your own wallet and smart contracts execute trades. You always control your funds.',
  },
  {
    q: 'What does DYOR stand for?',
    options: [
      'Do Your Own Routing',
      'Decentralized Yield On Returns',
      'Do Your Own Research',
      'Distribute Your Own Rewards',
    ],
    correct: 2,
    fact: "Do Your Own Research. Everyone says it. Few actually do it. It means: check who built it, read the tokenomics, verify the audit, look at who holds the supply, and check if developers are still building. One tweet is not research.",
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
        border: '1px solid rgba(0,255,148,0.18)',
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
        background: `rgba(0,255,148,0.06)`,
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
        border: '1px solid rgba(0,255,148,0.19)',
        boxShadow: '0 0 24px rgba(0,255,148,0.10)',
        margin: '20px 0',
      }}
    />
  )
}

// ─── Confetti burst ───────────────────────────────────────────────────────────

const CONFETTI = Array.from({ length: 22 }, (_, i) => ({
  angle: (i / 22) * Math.PI * 2,
  dist: 50 + (i * 13) % 80,
  color: ['#00FF94', '#00cc77', '#FFD700', '#0099FF', '#FF3366', '#ffffff'][i % 6],
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
              border = `1px solid ${ACCENT}`; bg = 'rgba(0,255,148,0.10)'; col = ACCENT
              shadow = `0 0 16px rgba(0,255,148,0.25)`
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
              background: isCorrect ? 'rgba(0,255,148,0.07)' : 'rgba(255,51,102,0.07)',
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
      <div className="text-7xl mb-5">{isWagmi ? '🏆' : passed ? '🛡️' : '💀'}</div>
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
          href={`https://twitter.com/intent/tweet?text=${tweet}&url=https://wenbrain.com/level/8`}
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
            style={{ background: `linear-gradient(135deg,${ACCENT},#00cc77)`, color: '#000', fontFamily: 'Syne, sans-serif' }}
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

export default function Level8Page() {
  const navigate = useNavigate()
  const { completeLevel, submitToLeaderboard, playerName, totalXP } = useGameStore()
  const { play } = useSound()
  useLevelMeta(8)

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
        completeLevel(8, xp)
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
    `Not your keys. Not your coins.\n12 words that are worth everything.\n\nLearn to stay safe 👇\n@wenbrainbro\n\n#WenBrain #Crypto #DYOR`
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

      {/* Matrix green glow */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 900,
        height: 900,
        background: 'radial-gradient(ellipse, rgba(0,255,148,0.05) 0%, transparent 65%)',
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
            <span style={{ fontSize: 40 }}>🛡️</span>
            <div>
              <div className="font-mono text-xs mb-1" style={{ color: ACCENT }}>LEVEL 8 · TOOLS & SAFETY</div>
              <h1 className="font-syne font-black" style={{ fontSize: 'clamp(1.5rem, 5vw, 2.25rem)', color: 'var(--text-primary)', lineHeight: 1.1 }}>
                How to Not Lose Everything
              </h1>
            </div>
          </div>
          <p className="font-mono text-sm mb-4" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            Wallets, seed phrases, CEX vs DEX, reading charts, and how to actually research a coin. The survival guide.
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
        <SectionConnector emoji="🔑" />

        <SectionCard>
          <SectionTag number="1" label="Your Wallet is Not What You Think" />
          <h2 className="font-syne font-black text-2xl mb-5" style={{ color: 'var(--text-primary)' }}>
            On Coinbase, <span style={{ color: '#FF3366' }}>You Don't Own Crypto</span>
          </h2>

          <p className="font-mono text-sm leading-relaxed mb-5" style={{ color: 'var(--text-secondary)' }}>
            When you buy crypto on Coinbase or Binance, you own an IOU from a company.
            They hold the real crypto. They can freeze your account, go bankrupt (see: FTX),
            or block your withdrawal. This is a <strong style={{ color: 'var(--text-primary)' }}>custodial wallet</strong> —
            someone else has custody of your coins.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-5">
            {[
              {
                type: 'Hot Wallet',
                examples: 'MetaMask, Phantom, Trust Wallet',
                pros: 'Easy to use, free, always accessible',
                cons: 'Connected to internet — more attack surface',
                color: '#FFD700',
              },
              {
                type: 'Cold Wallet',
                examples: 'Ledger, Trezor',
                pros: 'Offline, maximum security for large amounts',
                cons: 'Costs money, slightly more complex',
                color: ACCENT,
              },
            ].map((w) => (
              <div key={w.type} className="flex-1 p-4 rounded-xl" style={{ background: 'var(--bg-secondary)', border: `1px solid ${w.color}33`, borderLeft: `3px solid ${w.color}` }}>
                <div className="font-syne font-bold text-sm mb-1" style={{ color: w.color }}>{w.type}</div>
                <div className="font-mono text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>{w.examples}</div>
                <div className="font-mono text-xs mb-1" style={{ color: ACCENT }}>✓ {w.pros}</div>
                <div className="font-mono text-xs" style={{ color: '#FF3366' }}>✗ {w.cons}</div>
              </div>
            ))}
          </div>

          <LevelImage src="/images/wallet_explained.gif?v=2" alt="Crypto wallet types explained" />

          <MemeQuote>"Not your keys, not your coins" — the most important rule in crypto</MemeQuote>

          <CalloutBox>
            <p className="font-mono text-sm leading-relaxed" style={{ color: ACCENT }}>
              🔐 <strong>FTX had millions of customers who thought their crypto was safe. It was not.</strong>
              <br /><br />
              A cold wallet would have saved them. Not financial advice. Just facts.
            </p>
          </CalloutBox>
        </SectionCard>

        {/* ══════════════════ SECTION 2 ══════════════════ */}
        <SectionConnector emoji="📝" />

        <SectionCard>
          <SectionTag number="2" label="The Seed Phrase: 12 Words Worth Everything" />
          <h2 className="font-syne font-black text-2xl mb-5" style={{ color: 'var(--text-primary)' }}>
            These Words <span style={{ color: ACCENT }}>ARE Your Wallet</span>
          </h2>

          <p className="font-mono text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
            When you create a crypto wallet you get a seed phrase — 12 or 24 random words.
            Anyone who has them controls all your crypto. This is not a metaphor.
          </p>

          <div className="rounded-xl p-4 mb-5" style={{ background: 'var(--bg-secondary)', border: `1px solid ${ACCENT}33`, fontFamily: 'monospace' }}>
            <div className="font-mono text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>Example seed phrase (not real — never use this):</div>
            <div className="font-mono text-sm leading-relaxed" style={{ color: ACCENT }}>
              witch collapse practice feed shame open<br />
              despair creek road again ice least
            </div>
          </div>

          <div className="flex flex-col gap-2 mb-5">
            {[
              { rule: 'Never store on phone or computer', pass: false },
              { rule: 'Never take a photo of it', pass: false },
              { rule: 'Never type it into any website', pass: false },
              { rule: 'Never share with anyone ever', pass: false },
              { rule: 'Never store in cloud (Google Drive, iCloud)', pass: false },
              { rule: 'Write on paper. Store in a safe place.', pass: true },
              { rule: 'Consider a metal backup (fireproof)', pass: true },
              { rule: 'Tell one trusted person where it is', pass: true },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.4 }}
                viewport={{ once: true }}
                className="flex gap-3 items-start p-3 rounded-lg font-mono text-sm"
                style={{ background: 'var(--bg-secondary)', border: `1px solid ${item.pass ? `${ACCENT}22` : '#FF336622'}`, color: 'var(--text-secondary)' }}
              >
                <span style={{ color: item.pass ? ACCENT : '#FF3366', flexShrink: 0 }}>{item.pass ? '✅' : '🔴'}</span>
                {item.rule}
              </motion.div>
            ))}
          </div>

          <div className="p-4 rounded-xl mb-4" style={{ background: `rgba(255,51,102,0.08)`, border: '1px solid #FF336633', borderLeft: '3px solid #FF3366' }}>
            <div className="font-syne font-bold text-sm mb-1" style={{ color: '#FF3366' }}>Real story:</div>
            <p className="font-mono text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Stefan Thomas has 7,002 BTC on a drive. He has 2 password attempts left.
              He forgot his password. He cannot access $500M+. Forever.
            </p>
          </div>

          <LevelImage src="/images/seed_phrase.gif?v=2" alt="Seed phrase security" />

          <CalloutBox>
            <p className="font-mono text-sm leading-relaxed" style={{ color: ACCENT }}>
              🗝️ <strong>Your seed phrase is more important than your passport, your credit cards, and your house keys combined.</strong>
              <br /><br />
              Treat it that way.
            </p>
          </CalloutBox>
        </SectionCard>

        {/* ══════════════════ SECTION 3 ══════════════════ */}
        <SectionConnector emoji="⚖️" />

        <SectionCard>
          <SectionTag number="3" label="CEX vs DEX: Know the Difference" />
          <h2 className="font-syne font-black text-2xl mb-5" style={{ color: 'var(--text-primary)' }}>
            Centralized vs <span style={{ color: ACCENT }}>Decentralized</span>
          </h2>

          <div className="flex flex-col sm:flex-row gap-4 mb-5">
            {[
              {
                label: 'CEX',
                full: 'Centralized Exchange',
                examples: 'Coinbase, Binance, Kraken, OKX',
                points: [
                  ['Company controls your funds', false],
                  ['Requires ID (KYC)', false],
                  ['Easier for beginners', true],
                  ['Can be hacked or go bankrupt', false],
                  ['Buy with card / bank', true],
                  ['Customer support exists', true],
                ],
                color: '#FFD700',
              },
              {
                label: 'DEX',
                full: 'Decentralized Exchange',
                examples: 'Uniswap, Jupiter, Raydium, Curve',
                points: [
                  ['You connect your own wallet', true],
                  ['No ID needed', true],
                  ['You always control funds', true],
                  ['Smart contracts execute trades', true],
                  ['More complex for beginners', false],
                  ['No customer support — ever', false],
                ],
                color: ACCENT,
              },
            ].map((ex) => (
              <div key={ex.label} className="flex-1 p-4 rounded-xl" style={{ background: 'var(--bg-secondary)', border: `1px solid ${ex.color}33` }}>
                <div className="font-syne font-black text-lg mb-0.5" style={{ color: ex.color }}>{ex.label}</div>
                <div className="font-syne font-bold text-xs mb-1" style={{ color: 'var(--text-primary)' }}>{ex.full}</div>
                <div className="font-mono text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>{ex.examples}</div>
                <div className="flex flex-col gap-1">
                  {ex.points.map(([text, good]) => (
                    <div key={text} className="flex gap-2 font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <span style={{ color: good ? ACCENT : '#FF3366', flexShrink: 0 }}>{good ? '✓' : '✗'}</span>
                      {text}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <LevelImage src="/images/cex_dex.gif?v=2" alt="CEX vs DEX explained" />

          <CalloutBox>
            <p className="font-mono text-sm leading-relaxed" style={{ color: ACCENT }}>
              🗺️ <strong>The golden path:</strong>
              <br />
              Buy on CEX with fiat → Withdraw to your own wallet → Use DEX for trading → Keep large amounts on cold wallet.
            </p>
          </CalloutBox>
        </SectionCard>

        {/* ══════════════════ SECTION 4 ══════════════════ */}
        <SectionConnector emoji="📈" />

        <SectionCard>
          <SectionTag number="4" label="Reading the Market: Basics" />
          <h2 className="font-syne font-black text-2xl mb-5" style={{ color: 'var(--text-primary)' }}>
            You Don't Need to Be <span style={{ color: ACCENT }}>a Chart Expert</span>
          </h2>

          <div className="rounded-xl p-5 mb-5" style={{ background: 'var(--bg-secondary)', border: `1px solid ${ACCENT}33` }}>
            <div className="font-syne font-bold text-sm mb-3" style={{ color: ACCENT }}>Candlestick charts — the basics:</div>
            <div className="flex flex-col gap-2">
              {[
                { label: 'Each candle', value: 'price movement in a time period' },
                { label: 'Green candle', value: 'price went up' },
                { label: 'Red candle', value: 'price went down' },
                { label: 'The wick', value: 'how high / low price went' },
                { label: 'The body', value: 'open and close price' },
              ].map((row) => (
                <div key={row.label} className="flex gap-3 font-mono text-sm">
                  <span className="font-bold flex-shrink-0" style={{ color: ACCENT, minWidth: 100 }}>{row.label}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 mb-5">
            {[
              { term: 'Support',    def: 'Price floor — where buying happens and price bounces up',       color: ACCENT },
              { term: 'Resistance', def: 'Price ceiling — where selling happens and price struggles to break through', color: '#FF3366' },
              { term: 'Market Cap', def: 'Price × Total Supply. Low cap = more room to grow (and crash)', color: '#FFD700' },
              { term: 'Volume',     def: 'How much is trading. High volume = real movement. Low = easy to manipulate', color: '#0099FF' },
              { term: 'BTC Dom.',   def: 'Bitcoin % of total market. Up = altcoins struggle. Down = altcoin season', color: '#F7931A' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
                viewport={{ once: true }}
                className="flex gap-4 p-3 rounded-xl"
                style={{ background: 'var(--bg-secondary)', border: `1px solid ${item.color}22` }}
              >
                <span className="font-syne font-black text-xs flex-shrink-0" style={{ color: item.color, minWidth: 76 }}>{item.term}</span>
                <span className="font-mono text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.def}</span>
              </motion.div>
            ))}
          </div>

          <LevelImage src="/images/charts.gif?v=2" alt="Crypto chart reading basics" />

          <MemeQuote>"I learned to read charts. Then lost money faster and more confidently."</MemeQuote>
        </SectionCard>

        {/* ══════════════════ SECTION 5 ══════════════════ */}
        <SectionConnector emoji="🔎" />

        <SectionCard>
          <SectionTag number="5" label="DYOR: How to Actually Research a Coin" />
          <h2 className="font-syne font-black text-2xl mb-5" style={{ color: 'var(--text-primary)' }}>
            Everyone Says It. <span style={{ color: ACCENT }}>Few Actually Do It.</span>
          </h2>

          <div className="flex flex-col gap-4 mb-5">
            {[
              {
                step: 'Step 1 — Check the basics',
                items: ['What does it actually do?', 'Who built it? Are they public or anonymous?', 'When did it launch?', 'Who invested? (VCs, institutions)', 'Is the code audited?'],
                color: ACCENT,
              },
              {
                step: 'Step 2 — Check the tokenomics',
                items: ['Total supply — how many coins exist?', 'Circulating supply — how many are tradeable?', 'Who holds what? (check on-chain)', 'Big unlock events coming? (team can dump)', 'Inflation rate — are new coins printed?'],
                color: '#0099FF',
              },
              {
                step: 'Step 3 — Check the community',
                items: ['Twitter — real engagement or bots?', 'Telegram / Discord — active or dead?', 'GitHub — is code being updated?', 'Developers still building in bear market?'],
                color: '#FFD700',
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

          <div className="p-4 rounded-xl mb-5" style={{ background: `rgba(255,51,102,0.07)`, border: '1px solid #FF336633', borderLeft: '3px solid #FF3366' }}>
            <div className="font-syne font-bold text-sm mb-2" style={{ color: '#FF3366' }}>Step 4 — Red flags checklist:</div>
            <div className="flex flex-col gap-1">
              {[
                'Anonymous team with no history',
                'No working product, only promises',
                'Whitepaper copy-pasted from another project',
                'Team holds 50%+ of supply',
                'No audit by reputable firm',
                'Influencer shilling with no disclosure',
                'Artificial urgency: "Buy before listing!"',
                'Promises of guaranteed returns',
              ].map((flag) => (
                <div key={flag} className="flex gap-2 font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <span style={{ color: '#FF3366', flexShrink: 0 }}>🚩</span>
                  {flag}
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl mb-4" style={{ background: `rgba(0,255,148,0.06)`, border: `1px solid ${ACCENT}33` }}>
            <div className="font-syne font-bold text-sm mb-2" style={{ color: ACCENT }}>Tools to use:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {[
                ['CoinGecko / CoinMarketCap', 'price and info'],
                ['Etherscan / Solscan', 'on-chain data'],
                ['DexScreener', 'new token charts'],
                ['Bubblemaps', 'visualize who holds what'],
                ['De.Fi Scanner', 'contract audit checker'],
              ].map(([tool, desc]) => (
                <div key={tool} className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <span style={{ color: ACCENT }}>→ </span>
                  <strong style={{ color: 'var(--text-primary)' }}>{tool}</strong> — {desc}
                </div>
              ))}
            </div>
          </div>

          <LevelImage src="/images/dyor.gif?v=2" alt="DYOR research guide" />

          <MemeQuote>
            "DYOR does not mean read one tweet and convince yourself you did research.
            It means actually doing the work. Few do. Few make it. Coincidence? No."
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
          <div style={{ fontSize: 48, marginBottom: 12 }}>🛡️</div>
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
            style={{ fontFamily: 'Syne, sans-serif', background: `linear-gradient(135deg, ${ACCENT}, #00cc77)`, color: '#000' }}
          >
            Start Quiz 🛡️
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
                    <span style={{ fontSize: 24 }}>🛡️</span>
                    <h2 className="font-syne font-black text-xl" style={{ color: 'var(--text-primary)' }}>
                      Tools & Safety — Quiz
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
