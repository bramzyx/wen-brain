import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/useGameStore'
import { useSound } from '../hooks/useSound'
import { useLevelMeta } from '../hooks/useLevelMeta'

const ACCENT = '#F7931A'

const QUIZ = [
  {
    q: 'When was the Bitcoin whitepaper published?',
    options: ['January 1st 2009', 'October 31st 2008', 'December 25th 2007', 'March 15th 2010'],
    correct: 1,
    fact: 'Satoshi dropped the whitepaper on Halloween 2008. Trick or treat, ser.',
  },
  {
    q: 'How much did Laszlo pay for 2 pizzas?',
    options: ['100 BTC', '1,000 BTC', '10,000 BTC', '50,000 BTC'],
    correct: 2,
    fact: '10,000 BTC. Worth hundreds of millions today. Best/worst pizza investment ever.',
  },
  {
    q: 'What is a blockchain?',
    options: [
      'A type of cryptocurrency exchange',
      'A distributed ledger everyone can verify',
      'A mining computer',
      'A crypto wallet',
    ],
    correct: 1,
    fact: "A magic notebook millions of computers all hold a copy of. Can't lie. Can't delete.",
  },
]

const PRICE_MILESTONES = [
  { year: '2009', price: '$0.0008', caption: 'Basically free. Nobody cared.' },
  { year: '2011', price: '$1',      caption: 'First dollar. Nerds rejoiced.' },
  { year: '2013', price: '$1,000',  caption: 'First moonshot. Still dismissed.' },
  { year: '2017', price: '$20,000', caption: 'Your uncle finally bought in.' },
  { year: '2021', price: '$69,000', caption: 'ATH. The number speaks itself.' },
  { year: '2024', price: '$100K+',  caption: 'ETF approved. Suits FOMOd in.' },
  { year: '2025', price: '$126K ATH', caption: 'New all-time high. Suits finally showed up with briefcases.' },
  { year: '2026', price: '~$83K',   caption: 'Post-ATH correction. Cycle does what cycles do.' },
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
        border: '1px solid rgba(247,147,26,0.18)',
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

function CalloutBox({ color = ACCENT, children }) {
  return (
    <div
      style={{
        background: `rgba(${color === ACCENT ? '247,147,26' : '255,51,102'},0.07)`,
        borderLeft: `3px solid ${color}`,
        borderRadius: '0 8px 8px 0',
        padding: '14px 18px',
        margin: '16px 0',
      }}
    >
      {children}
    </div>
  )
}

// ─── Confetti burst ───────────────────────────────────────────────────────────

const CONFETTI = Array.from({ length: 22 }, (_, i) => ({
  angle: (i / 22) * Math.PI * 2,
  dist: 50 + (i * 13) % 80,
  color: ['#F7931A', '#00FF94', '#FFD700', '#FF3366', '#627EEA', '#9945FF'][i % 6],
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

      {/* Progress + timer */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-2">
          {QUIZ.map((_, i) => (
            <div
              key={i}
              style={{
                width: 28,
                height: 4,
                borderRadius: 2,
                background: i < qIndex ? '#00FF94' : i === qIndex ? ACCENT : 'var(--border)',
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

      {/* Timer drain bar */}
      <div className="h-1.5 rounded-full mb-6" style={{ background: 'var(--border)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: timerColor, transformOrigin: 'left' }}
          animate={{ width: `${timerPct}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Question */}
      <h3 className="font-syne font-bold text-xl mb-6" style={{ color: 'var(--text-primary)', lineHeight: 1.4 }}>
        {question.q}
      </h3>

      {/* Full-width stacked options */}
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
              border = '1px solid #00FF94'; bg = 'rgba(0,255,148,0.10)'; col = '#00FF94'
              shadow = '0 0 16px rgba(0,255,148,0.25)'
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

      {/* Feedback */}
      <AnimatePresence>
        {selected !== null && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl p-4 mb-4"
            style={{
              background: isCorrect ? 'rgba(0,255,148,0.07)' : 'rgba(255,51,102,0.07)',
              border: `1px solid ${isCorrect ? '#00FF9433' : '#FF336633'}`,
              borderLeft: `4px solid ${isCorrect ? '#00FF94' : '#FF3366'}`,
            }}
          >
            <div className="font-syne font-bold text-sm mb-1" style={{ color: isCorrect ? '#00FF94' : '#FF3366' }}>
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
      <div className="text-7xl mb-5">{isWagmi ? '🏆' : passed ? '🎯' : '💀'}</div>
      <h2 className="font-syne font-black mb-2" style={{ fontSize: '4rem', color: isWagmi ? '#FFD700' : ACCENT }}>
        {score}/3
      </h2>
      <div className="font-syne font-bold text-2xl mb-2" style={{ color: isWagmi ? '#FFD700' : passed ? '#00FF94' : '#FF3366' }}>
        {isWagmi ? 'WAGMI SER 🚀' : passed ? 'Not bad, anon.' : 'ngmi... for now.'}
      </div>
      <div className="font-mono text-sm mb-1" style={{ color: '#00FF94' }}>
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
          href={`https://twitter.com/intent/tweet?text=${tweet}&url=https://wenbrain.com?level=1`}
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
            style={{ background: 'linear-gradient(135deg,#00FF94,#00cc77)', color: '#000', fontFamily: 'Syne, sans-serif' }}
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
              style={{ background: '#F7931A', fontFamily: 'Syne, sans-serif' }}
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

export default function Level1Page() {
  const navigate = useNavigate()
  const { completeLevel, submitToLeaderboard, playerName, totalXP } = useGameStore()
  const { play } = useSound()
  useLevelMeta(1)

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
        completeLevel(1, xp)
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
    `Just learned why a pizza changed history.\n10,000 BTC for 2 pizzas. Worth $600M today.\n\nThink you know crypto? Prove it 👇\n@wenbrainbro\n\n#WenBrain #Bitcoin #WAGMI`
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

      {/* Subtle orange glow behind content */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 900,
        height: 900,
        background: 'radial-gradient(ellipse, rgba(247,147,26,0.04) 0%, transparent 65%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* Centered 780px column */}
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
            <span style={{ fontSize: 40 }}>🟠</span>
            <div>
              <div className="font-mono text-xs mb-1" style={{ color: ACCENT }}>LEVEL 1 · BITCOIN BASICS</div>
              <h1 className="font-syne font-black" style={{ fontSize: 'clamp(1.5rem, 5vw, 2.25rem)', color: 'var(--text-primary)', lineHeight: 1.1 }}>
                In the Beginning: Bitcoin
              </h1>
            </div>
          </div>
          <p className="font-mono text-sm mb-4" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            Money, trust, and the pizza guy. The rabbit hole starts here, ser.
          </p>
          <div className="flex gap-3 flex-wrap">
            {[['3 PTS base', ACCENT], ['+1 perfect bonus', '#FFD700'], ['~5 min read', 'var(--text-secondary)']].map(([t, c]) => (
              <span key={t} className="font-mono text-xs px-3 py-1 rounded-full" style={{ background: `${c}18`, color: c, border: `1px solid ${c}33` }}>
                {t}
              </span>
            ))}
          </div>
        </motion.div>

        {/* ══════════════════ SECTION 1 ══════════════════ */}
        <SectionConnector emoji="💸" />

        <SectionCard>
          <SectionTag number="1" label="What is Money?" />
          <h2 className="font-syne font-black text-2xl mb-5" style={{ color: 'var(--text-primary)' }}>
            Banks Are Just <span style={{ color: ACCENT }}>Vibes</span>
          </h2>
          <p className="font-mono text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
            Money is made-up. All of it. A dollar bill is just paper — it has value because{' '}
            <strong style={{ color: 'var(--text-primary)' }}>we all agree it does</strong>. That's it. That's the whole system.
          </p>
          <p className="font-mono text-sm leading-relaxed mb-2" style={{ color: 'var(--text-secondary)' }}>
            Banks took this "trust" thing and ran with it. They lend out money they don't have.
            They create loans from thin air. In 2008, that house of cards collapsed.
          </p>
          <CalloutBox color="#FF3366">
            <p className="font-mono text-sm leading-relaxed" style={{ color: '#FF8FA3' }}>
              📉 <strong>2008 crisis:</strong> Banks bet trillions on mortgages that couldn't be repaid. They lost.
              The government printed $700 billion to bail them out. Regular people lost their homes.
              Bankers kept their bonuses.
            </p>
          </CalloutBox>
          <p className="font-mono text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Someone was watching. Taking notes. Getting absolutely cooked by the system.
          </p>

          <img
            src="/gifs/2008_crisis"
            alt="2008 financial crisis"
            style={{
              display: 'block',
              width: '100%',
              maxHeight: 400,
              objectFit: 'cover',
              borderRadius: 12,
              border: '1px solid rgba(247,147,26,0.19)',
              boxShadow: '0 0 24px rgba(247,147,26,0.12)',
              margin: '20px 0',
            }}
          />

          <MemeQuote>"banks are just vibes tbh" — probably Satoshi</MemeQuote>
        </SectionCard>

        {/* ══════════════════ SECTION 2 ══════════════════ */}
        <SectionConnector emoji="👻" />

        <SectionCard>
          <SectionTag number="2" label="Enter Satoshi" />
          <div className="text-center mb-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, type: 'spring' }}
              viewport={{ once: true }}
              className="inline-block mb-3"
            >
              <div className="font-mono text-xs px-5 py-2 rounded-full" style={{ background: ACCENT + '22', color: ACCENT, border: `1px solid ${ACCENT}` }}>
                🎃 October 31st, 2008
              </div>
            </motion.div>
            <h2 className="font-syne font-black text-2xl" style={{ color: 'var(--text-primary)' }}>
              A Ghost Changed <span style={{ color: ACCENT }}>Everything</span>
            </h2>
          </div>
          <p className="font-mono text-sm leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
            On Halloween 2008, a mysterious figure named{' '}
            <strong style={{ color: ACCENT }}>Satoshi Nakamoto</strong> posted a 9-page document to a
            cryptography mailing list. Subject:{' '}
            <em style={{ color: 'var(--text-primary)' }}>"Bitcoin: A Peer-to-Peer Electronic Cash System."</em>
          </p>
          <p className="font-mono text-sm leading-relaxed mb-2" style={{ color: 'var(--text-secondary)' }}>
            Nobody knew who they were. Nobody knows now. Person? Group? AI? Time traveler?
            Nobody. Knows.
          </p>
          <CalloutBox>
            <p className="font-mono text-sm leading-relaxed" style={{ color: ACCENT }}>
              👻 <strong>The mystery deepens:</strong> Satoshi owns roughly 1 million BTC — worth tens of billions.
              They have <em>never moved a single coin</em>. Not once. Either they lost access,
              or they simply don't care. Either way: absolute legend.
            </p>
          </CalloutBox>
          <p className="font-mono text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Satoshi disappeared in 2010. Left a few final messages. Then: silence.
            The ghost who built the machine walked away from it.
          </p>

          <img
            src="/gifs/satoshi_mystery"
            alt="Satoshi Nakamoto mystery"
            style={{
              display: 'block',
              width: '100%',
              maxHeight: 400,
              objectFit: 'cover',
              borderRadius: 12,
              border: '1px solid rgba(247,147,26,0.19)',
              boxShadow: '0 0 24px rgba(247,147,26,0.12)',
              margin: '20px 0',
            }}
          />

          <MemeQuote>"I've moved on to other things." — Satoshi's last email, 2011. Goosebumps.</MemeQuote>
        </SectionCard>

        {/* ══════════════════ SECTION 3 ══════════════════ */}
        <SectionConnector emoji="⛓️" />

        <SectionCard>
          <SectionTag number="3" label="How It Works" />
          <h2 className="font-syne font-black text-2xl mb-5" style={{ color: 'var(--text-primary)' }}>
            The Magic <span style={{ color: ACCENT }}>Notebook</span>
          </h2>
          <div className="flex flex-col gap-4 mb-4">
            {[
              { icon: '📒', title: 'Blockchain = Shared Notebook', body: "Imagine millions of people all hold a copy of the same notebook. Every Bitcoin transaction is written in every single copy simultaneously. You can't erase. You can't forge. Everyone would see the lie." },
              { icon: '⛏️', title: 'Mining = Solving Puzzles for Coins', body: 'Computers race to solve a hard math puzzle every ~10 minutes. The winner adds the next page to the notebook — and earns newly minted Bitcoin as a reward. Fair, transparent, unstoppable.' },
              { icon: '🔢', title: '21 Million. That\'s It. Forever.', body: "Satoshi hardcoded a maximum supply of 21 million BTC. Gold is scarce. Bitcoin is scarcer. No government can print more. No board can vote to inflate it. The math doesn't care about elections." },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                viewport={{ once: true }}
                className="flex gap-4 p-4 rounded-xl"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
              >
                <span style={{ fontSize: 22, flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <div className="font-syne font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{item.title}</div>
                  <p className="font-mono text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <MemeQuote>01000010 01010100 01000011 = gm ser 🟠</MemeQuote>
        </SectionCard>

        {/* ══════════════════ SECTION 4 ══════════════════ */}
        <SectionConnector emoji="🍕" />

        <SectionCard>
          <SectionTag number="4" label="The Pizza Moment 🍕" />
          <h2 className="font-syne font-black text-2xl mb-1" style={{ color: 'var(--text-primary)' }}>
            The Most Expensive <span style={{ color: ACCENT }}>Pizza</span> in History
          </h2>
          <div className="font-mono text-xs mb-5" style={{ color: 'var(--text-secondary)' }}>May 22, 2010 — Bitcoin Talk Forum</div>

          <div className="rounded-xl p-5 mb-5" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <p className="font-mono text-sm italic leading-relaxed mb-2" style={{ color: 'var(--text-primary)' }}>
              "I'll pay 10,000 bitcoins for a couple of pizzas... like maybe 2 large ones so I have
              some left over for the next day."
            </p>
            <p className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>— Laszlo Hanyecz</p>
          </div>

          <p className="font-mono text-sm leading-relaxed mb-5" style={{ color: 'var(--text-secondary)' }}>
            Someone actually did it. Two Papa John's pizzas. 10,000 BTC changed hands.
            Laszlo was happy. It was the first real-world Bitcoin purchase in history.
          </p>

          <div className="text-center py-8 rounded-xl mb-5" style={{ background: 'rgba(247,147,26,0.06)', border: `1px solid ${ACCENT}33` }}>
            <div className="font-mono text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>Those 2 pizzas in today's money:</div>
            <motion.div
              initial={{ opacity: 0, scale: 0.4 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, type: 'spring', delay: 0.2 }}
              viewport={{ once: true }}
              className="font-syne font-black"
              style={{ fontSize: 'clamp(2.5rem, 10vw, 5rem)', color: ACCENT, lineHeight: 1 }}
            >
              $600M+
            </motion.div>
            <div className="font-mono text-xs mt-3" style={{ color: 'var(--text-secondary)' }}>
              based on 10,000 BTC at current prices
            </div>
          </div>

          <p className="font-mono text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            Every May 22nd the whole crypto world celebrates 🍕 Bitcoin Pizza Day. Laszlo has no regrets. A real one.
          </p>

          <img
            src="/gifs/pizza_meme"
            alt="Bitcoin pizza meme"
            style={{
              display: 'block',
              width: '100%',
              maxHeight: 400,
              objectFit: 'cover',
              borderRadius: 12,
              border: '1px solid rgba(247,147,26,0.19)',
              boxShadow: '0 0 24px rgba(247,147,26,0.12)',
              margin: '20px 0',
            }}
          />

          <MemeQuote>"Worth it." — Laszlo Hanyecz, probably 🍕</MemeQuote>
        </SectionCard>

        {/* ══════════════════ SECTION 5 ══════════════════ */}
        <SectionConnector emoji="📈" />

        <SectionCard>
          <SectionTag number="5" label="The Price Journey" />
          <h2 className="font-syne font-black text-2xl mb-6" style={{ color: 'var(--text-primary)' }}>
            From <span style={{ color: ACCENT }}>Worthless</span> to Global Asset
          </h2>
          <div className="flex flex-col gap-4 mb-4">
            {PRICE_MILESTONES.map((m, i) => (
              <motion.div
                key={m.year}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="flex items-center gap-4"
              >
                <div className="font-mono text-xs w-10 text-right flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>
                  {m.year}
                </div>
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: ACCENT, boxShadow: `0 0 8px ${ACCENT}88` }} />
                <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${ACCENT}55, transparent)` }} />
                <div className="font-syne font-bold text-sm flex-shrink-0 w-20 text-right" style={{ color: ACCENT }}>{m.price}</div>
                <div className="font-mono text-xs flex-shrink-0 hidden sm:block" style={{ color: 'var(--text-secondary)', width: 200 }}>{m.caption}</div>
              </motion.div>
            ))}
          </div>
          <MemeQuote>Early adopters: "It's just internet money." Also them: 🛥️🏠🚀</MemeQuote>
        </SectionCard>

        {/* ══════════════════ QUIZ ══════════════════ */}
        <SectionConnector emoji="🚀" />

        <motion.div
          id="quiz-section"
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
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
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
          <button type="button" onClick={startQuiz} className="btn-primary px-12 py-4 text-lg" style={{ fontFamily: 'Syne, sans-serif' }}>
            Start Quiz 🎯
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
                    <span style={{ fontSize: 24 }}>🎯</span>
                    <h2 className="font-syne font-black text-xl" style={{ color: 'var(--text-primary)' }}>
                      Bitcoin Basics — Quiz
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
