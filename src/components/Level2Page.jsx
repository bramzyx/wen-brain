import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/useGameStore'
import { useSound } from '../hooks/useSound'
import { useLevelMeta } from '../hooks/useLevelMeta'

const ACCENT = '#FFD700'

const QUIZ = [
  {
    q: 'What was hidden in Bitcoin\'s Genesis Block?',
    options: [
      'Satoshi\'s real name',
      'A newspaper headline about bank bailouts',
      'The price of Bitcoin',
      'A secret message to the NSA',
    ],
    correct: 1,
    fact: 'The headline read "Chancellor on brink of second bailout for banks." Satoshi wanted to make it crystal clear why Bitcoin existed.',
  },
  {
    q: 'How much Bitcoin does Satoshi own?',
    options: ['100,000 BTC', '500,000 BTC', '1,000,000 BTC', '21,000,000 BTC'],
    correct: 2,
    fact: 'Roughly 1 million BTC — worth $60B+. Not a single satoshi has ever moved. The most watched wallet in crypto history.',
  },
  {
    q: 'Who is Craig Wright?',
    options: [
      'The real Satoshi Nakamoto',
      'Hal Finney\'s assistant',
      'A man who falsely claims to be Satoshi',
      'The founder of Ethereum',
    ],
    correct: 2,
    fact: 'Craig Wright is known as "Faketoshi." He has claimed to be Satoshi for years but has never proven it cryptographically. Courts have not been kind to him.',
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

function CalloutBox({ color = ACCENT, children }) {
  const isGold = color === ACCENT
  const rgb = isGold ? '255,215,0' : '255,51,102'
  return (
    <div
      style={{
        background: `rgba(${rgb},0.07)`,
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

const CONFETTI = Array.from({ length: 22 }, (_, i) => ({
  angle: (i / 22) * Math.PI * 2,
  dist: 50 + (i * 13) % 80,
  color: ['#FFD700', '#F7931A', '#00FF94', '#FF3366', '#627EEA', '#9945FF'][i % 6],
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

  const timerColor = timer > 15 ? ACCENT : timer > 8 ? '#F7931A' : '#FF3366'
  const timerPct = (timer / 30) * 100
  const isCorrect = selected !== null && selected !== -1 && selected === question.correct

  return (
    <motion.div animate={cardControls} style={{ position: 'relative' }}>
      <ConfettiBurst active={showConfetti} />

      {/* Progress dots + timer */}
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

      {/* Options */}
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
      <h2 className="font-syne font-black mb-2" style={{ fontSize: '4rem', color: isWagmi ? ACCENT : '#F7931A' }}>
        {score}/3
      </h2>
      <div className="font-syne font-bold text-2xl mb-2" style={{ color: isWagmi ? ACCENT : passed ? '#00FF94' : '#FF3366' }}>
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

export default function Level2Page() {
  const navigate = useNavigate()
  const { completeLevel, submitToLeaderboard, playerName, totalXP } = useGameStore()
  const { play } = useSound()
  useLevelMeta(2)

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
        completeLevel(2, xp)
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
    `Nobody knows who created Bitcoin.\n$60B in a wallet. Never moved. Not once.\n\nCan you solve the mystery? 👇\n@wenbrainbro\n\n#WenBrain #Satoshi #Bitcoin`
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
        background: 'radial-gradient(ellipse, rgba(255,215,0,0.04) 0%, transparent 65%)',
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
            <span style={{ fontSize: 40 }}>👻</span>
            <div>
              <div className="font-mono text-xs mb-1" style={{ color: ACCENT }}>LEVEL 2 · THE GREATEST MYSTERY</div>
              <h1 className="font-syne font-black" style={{ fontSize: 'clamp(1.5rem, 5vw, 2.25rem)', color: 'var(--text-primary)', lineHeight: 1.1 }}>
                Who is Satoshi Nakamoto?
              </h1>
            </div>
          </div>
          <p className="font-mono text-sm mb-4" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            Person, group, or ghost? The trillion-dollar mystery nobody has solved.
          </p>
          <div className="flex gap-3 flex-wrap">
            {[['3 PTS base', ACCENT], ['+1 perfect bonus', '#F7931A'], ['~6 min read', 'var(--text-secondary)']].map(([t, c]) => (
              <span key={t} className="font-mono text-xs px-3 py-1 rounded-full" style={{ background: `${c}18`, color: c, border: `1px solid ${c}33` }}>
                {t}
              </span>
            ))}
          </div>
        </motion.div>

        {/* ══════════════════ SECTION 1 ══════════════════ */}
        <SectionConnector emoji="👻" />

        <SectionCard>
          <SectionTag number="1" label="The Ghost Who Started It All" />
          <h2 className="font-syne font-black text-2xl mb-5" style={{ color: 'var(--text-primary)' }}>
            Built a <span style={{ color: ACCENT }}>Trillion Dollar Thing</span> and Dipped
          </h2>
          <p className="font-mono text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
            On October 31st 2008, a person or group calling themselves{' '}
            <strong style={{ color: ACCENT }}>Satoshi Nakamoto</strong> published a 9-page document that would
            change the world. They called it the Bitcoin whitepaper.
          </p>
          <p className="font-mono text-sm leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
            Satoshi stuck around for two years — answering forum posts, fixing bugs, responding to emails.
            Then in 2010, the messages slowed down. In April 2011 came the final email:
          </p>
          <div className="rounded-xl p-5 mb-4" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <p className="font-mono text-sm italic leading-relaxed mb-2" style={{ color: 'var(--text-primary)' }}>
              "I've moved on to other things. It's in good hands with Gavin and everyone."
            </p>
            <p className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>— Satoshi Nakamoto, last known communication, April 2011</p>
          </div>
          <p className="font-mono text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Then silence. Complete. Total. Permanent silence.
            No goodbye tour. No book deal. No interview. Just gone.
          </p>

          <LevelImage src="./images/satoshi_ghost.gif" alt="Satoshi ghost mystery" />

          <MemeQuote>"Imagine building a $1 trillion thing and just dipping" — probably everyone</MemeQuote>
        </SectionCard>

        {/* ══════════════════ SECTION 2 ══════════════════ */}
        <SectionConnector emoji="🔍" />

        <SectionCard>
          <SectionTag number="2" label="What We Actually Know" />
          <h2 className="font-syne font-black text-2xl mb-5" style={{ color: 'var(--text-primary)' }}>
            The Clues Left <span style={{ color: ACCENT }}>Behind</span>
          </h2>
          <div className="flex flex-col gap-4 mb-4">
            {[
              { icon: '✍️', title: 'British English', body: 'Satoshi used British spelling — "colour", "maths", "analyse". Combined with activity patterns suggesting European timezone hours.' },
              { icon: '🌐', title: 'Registered bitcoin.org on August 18, 2008', body: 'Six weeks before publishing the whitepaper. The domain was registered anonymously through a Finnish registrar.' },
              { icon: '⛏️', title: 'Mined the Genesis Block on Jan 3, 2009', body: 'The very first Bitcoin block ever. Block #0. Satoshi earned 50 BTC and embedded a message that changed everything.' },
              { icon: '🗣️', title: 'Never revealed anything personal', body: 'Thousands of emails. Hundreds of forum posts. Zero personal details. Not a slip. Not a hint. Completely disciplined.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
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

          <CalloutBox>
            <p className="font-mono text-sm leading-relaxed" style={{ color: ACCENT }}>
              📰 <strong>The Genesis Block message:</strong>{' '}
              <em>"The Times 03/Jan/2009 Chancellor on brink of second bailout for banks"</em>
              <br /><br />
              This was not random. Satoshi wanted us to know exactly WHY Bitcoin was created.
              A permanent middle finger to the banking system, encoded in the foundation of the blockchain forever.
            </p>
          </CalloutBox>
        </SectionCard>

        {/* ══════════════════ SECTION 3 ══════════════════ */}
        <SectionConnector emoji="🕵️" />

        <SectionCard>
          <SectionTag number="3" label="Who Could It Be?" />
          <h2 className="font-syne font-black text-2xl mb-6" style={{ color: 'var(--text-primary)' }}>
            The <span style={{ color: ACCENT }}>Suspects</span>
          </h2>

          <div className="flex flex-col gap-4 mb-5">
            {[
              {
                name: 'Hal Finney',
                verdict: 'Could be. Probably not.',
                color: '#00FF94',
                body: 'The first person to ever receive Bitcoin — sent by Satoshi himself. A legendary cryptographer who lived near a man named "Satoshi Nakamoto." Denied it right up until he died of ALS in 2014. Never cracked under pressure. Absolute respect.',
              },
              {
                name: 'Nick Szabo',
                verdict: 'Suspicious. Denies it.',
                color: ACCENT,
                body: 'Created "Bit Gold" before Bitcoin — almost identical concept. His writing style matches Satoshi\'s eerily. Researchers have done linguistic analysis that points squarely at him. He flatly denies it. The denial is as convincing as the evidence.',
              },
              {
                name: 'Craig Wright',
                verdict: 'Definitely not. Faketoshi.',
                color: '#FF3366',
                body: 'An Australian who has loudly claimed to be Satoshi for years. Has never once proven it with cryptographic evidence — the only thing that actually counts. Lost multiple court cases. The crypto community has a special word for him: "Faketoshi."',
              },
              {
                name: 'A Team / Intel Agency',
                verdict: 'Maybe. Nobody knows.',
                color: '#9945FF',
                body: 'Some believe Bitcoin is too technically perfect to be one person. A coordinated team — or even a government project gone rogue — could explain the discipline and the disappearance. Nobody knows. That\'s the point.',
              },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="p-4 rounded-xl"
                style={{ background: 'var(--bg-secondary)', border: `1px solid ${s.color}33`, borderLeft: `3px solid ${s.color}` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-syne font-bold text-base" style={{ color: 'var(--text-primary)' }}>{s.name}</div>
                  <span className="font-mono text-xs px-2 py-0.5 rounded" style={{ background: `${s.color}22`, color: s.color, border: `1px solid ${s.color}44` }}>
                    {s.verdict}
                  </span>
                </div>
                <p className="font-mono text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{s.body}</p>
              </motion.div>
            ))}
          </div>

          <LevelImage src="./images/satoshi_theories.gif" alt="Satoshi theories conspiracy board" />

          <MemeQuote>"Craig Wright is Satoshi" — said nobody who understands cryptography</MemeQuote>
        </SectionCard>

        {/* ══════════════════ SECTION 4 ══════════════════ */}
        <SectionConnector emoji="💰" />

        <SectionCard>
          <SectionTag number="4" label="The $60 Billion Ghost Wallet" />
          <h2 className="font-syne font-black text-2xl mb-1" style={{ color: 'var(--text-primary)' }}>
            The Most Watched <span style={{ color: ACCENT }}>Address</span> in Crypto
          </h2>
          <div className="font-mono text-xs mb-5" style={{ color: 'var(--text-secondary)' }}>Genesis Block Wallet · Never moved. Not once.</div>

          <div className="text-center py-8 rounded-xl mb-5" style={{ background: 'rgba(255,215,0,0.06)', border: `1px solid ${ACCENT}33` }}>
            <div className="font-mono text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>Satoshi's estimated holdings:</div>
            <motion.div
              initial={{ opacity: 0, scale: 0.4 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, type: 'spring', delay: 0.2 }}
              viewport={{ once: true }}
              className="font-syne font-black"
              style={{ fontSize: 'clamp(1.6rem, 6vw, 3.2rem)', color: ACCENT, lineHeight: 1, whiteSpace: 'nowrap' }}
            >
              ~1,000,000 BTC
            </motion.div>
            <div className="font-mono text-xs mt-3" style={{ color: 'var(--text-secondary)' }}>
              Worth $60+ billion at current prices
            </div>
          </div>

          <div className="p-4 rounded-xl mb-4" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <div className="font-mono text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>Genesis Block Address:</div>
            <div
              className="font-mono text-xs break-all"
              style={{ color: ACCENT, letterSpacing: '0.03em' }}
            >
              1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa
            </div>
          </div>

          <CalloutBox>
            <p className="font-mono text-sm leading-relaxed" style={{ color: ACCENT }}>
              👁️ <strong>Every single year</strong>, thousands of people watch that wallet.
              Every year, nothing happens. Not a single satoshi moves.
              <br /><br />
              If Satoshi ever moves those coins, it would shake the entire crypto market.
              That wallet is the most watched address in all of finance.
            </p>
          </CalloutBox>

          <MemeQuote>Every year on Bitcoin's birthday someone sends 0.00000001 BTC to that wallet. Respect.</MemeQuote>
        </SectionCard>

        {/* ══════════════════ SECTION 5 ══════════════════ */}
        <SectionConnector emoji="🌌" />

        <SectionCard>
          <SectionTag number="5" label="Why The Mystery Is Perfect" />
          <h2 className="font-syne font-black text-2xl mb-5" style={{ color: 'var(--text-primary)' }}>
            The Disappearance Was The <span style={{ color: ACCENT }}>Final Move</span>
          </h2>
          <p className="font-mono text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
            Bitcoin was designed to have no leader. No CEO to arrest. No founder to pressure.
            No face to put on a wanted poster. No one to call before Congress.
          </p>
          <p className="font-mono text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
            When Satoshi disappeared, it wasn't abandonment. It was the final,{' '}
            <strong style={{ color: 'var(--text-primary)' }}>most important feature</strong> of Bitcoin.
            A leaderless system is unstoppable. The creator left so the creation could live.
          </p>

          <CalloutBox>
            <p className="font-mono text-sm leading-relaxed" style={{ color: ACCENT }}>
              🌌 <strong>Think about it:</strong> Every other major project has a face.
              Ethereum has Vitalik. Tesla has Elon. Apple had Steve Jobs.
              <br /><br />
              Bitcoin has no one. And that's exactly why it cannot be stopped.
            </p>
          </CalloutBox>

          <LevelImage src="./images/satoshi_disappear.gif" alt="Satoshi disappears into the void" />

          <MemeQuote>"Satoshi is the only person in history who became more powerful by disappearing."</MemeQuote>
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
          <div style={{ fontSize: 48, marginBottom: 12 }}>🕵️</div>
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
            Start Quiz 🕵️
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
                    <span style={{ fontSize: 24 }}>🕵️</span>
                    <h2 className="font-syne font-black text-xl" style={{ color: 'var(--text-primary)' }}>
                      The Greatest Mystery — Quiz
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
