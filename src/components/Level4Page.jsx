import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/useGameStore'
import { useSound } from '../hooks/useSound'
import { useLevelMeta } from '../hooks/useLevelMeta'

const ACCENT  = '#9945FF'
const GREEN   = '#00FFA3'

const QUIZ = [
  {
    q: 'How many transactions per second can Solana process?',
    options: ['1,000', '15,000', '65,000', '100'],
    correct: 2,
    fact: '65,000 TPS — faster than Visa (24,000 TPS). Bitcoin does 7. Ethereum does 15–30. Solana built a clock into the blockchain and said "we are done arguing about time."',
  },
  {
    q: 'What is Proof of History (PoH)?',
    options: [
      'A way to store Bitcoin transactions',
      "Solana's built-in clock mechanism",
      'How Ethereum validates blocks',
      'A crypto scam detection system',
    ],
    correct: 1,
    fact: "Normal blockchains argue about what time it is. Solana built a cryptographic clock INTO the chain. No argument, no delays — just a shared timestamp everyone trusts. That's Proof of History.",
  },
  {
    q: 'What happened to SOL price after FTX collapsed in 2022?',
    options: [
      'It hit a new all-time high',
      'Nothing changed',
      'It crashed from $260 to $8',
      'It was banned by the SEC',
    ],
    correct: 2,
    fact: 'SBF and FTX held massive amounts of SOL. When FTX imploded in November 2022, SOL collapsed from $260 to $8. Everyone wrote the obituary. The developers kept building. By 2024–2025 SOL hit $293 — almost $300.',
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
        border: '1px solid rgba(153,69,255,0.18)',
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
        style={{ background: ACCENT, color: '#fff' }}
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
        borderLeft: `4px solid ${GREEN}`,
        paddingLeft: '1rem',
        margin: '1.5rem 0 0',
        fontFamily: '"IBM Plex Mono", monospace',
        fontStyle: 'italic',
        fontSize: '0.875rem',
        color: GREEN,
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
        background: `rgba(153,69,255,0.07)`,
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
        border: '1px solid rgba(153,69,255,0.19)',
        boxShadow: '0 0 24px rgba(153,69,255,0.12)',
        margin: '20px 0',
      }}
    />
  )
}

// ─── Confetti burst ───────────────────────────────────────────────────────────

const CONFETTI = Array.from({ length: 22 }, (_, i) => ({
  angle: (i / 22) * Math.PI * 2,
  dist: 50 + (i * 13) % 80,
  color: ['#9945FF', '#00FFA3', '#FFD700', '#FF3366', '#627EEA', '#ffffff'][i % 6],
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
                background: i < qIndex ? GREEN : i === qIndex ? ACCENT : 'var(--border)',
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
              border = `1px solid ${GREEN}`; bg = 'rgba(0,255,163,0.10)'; col = GREEN
              shadow = `0 0 16px rgba(0,255,163,0.25)`
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
              background: isCorrect ? `rgba(0,255,163,0.07)` : 'rgba(255,51,102,0.07)',
              border: `1px solid ${isCorrect ? `${GREEN}33` : '#FF336633'}`,
              borderLeft: `4px solid ${isCorrect ? GREEN : '#FF3366'}`,
            }}
          >
            <div className="font-syne font-bold text-sm mb-1" style={{ color: isCorrect ? GREEN : '#FF3366' }}>
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
      <div className="text-7xl mb-5">{isWagmi ? '🏆' : passed ? '⚡' : '💀'}</div>
      <h2 className="font-syne font-black mb-2" style={{ fontSize: '4rem', color: isWagmi ? '#FFD700' : ACCENT }}>
        {score}/3
      </h2>
      <div className="font-syne font-bold text-2xl mb-2" style={{ color: isWagmi ? '#FFD700' : passed ? GREEN : '#FF3366' }}>
        {isWagmi ? 'WAGMI SER 🚀' : passed ? 'Not bad, anon.' : 'ngmi... for now.'}
      </div>
      <div className="font-mono text-sm mb-1" style={{ color: GREEN }}>
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
          href={`https://twitter.com/intent/tweet?text=${tweet}&url=https://wenbrain.com`}
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
            style={{ background: `linear-gradient(135deg,${GREEN},#00cc7a)`, color: '#000', fontFamily: 'Syne, sans-serif' }}
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
              style={{ background: ACCENT, fontFamily: 'Syne, sans-serif' }}
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

export default function Level4Page() {
  const navigate = useNavigate()
  const { completeLevel, submitToLeaderboard, playerName, totalXP } = useGameStore()
  const { play } = useSound()
  useLevelMeta(4)

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
        completeLevel(4, xp)
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
    `65,000 transactions per second.\nCrashed to $8. Came back to $293.\n\nThe Solana story 👇\n@wenbrainbro\n\n#WenBrain #Solana #Crypto`
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

      {/* Solana purple glow */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 900,
        height: 900,
        background: 'radial-gradient(ellipse, rgba(153,69,255,0.06) 0%, transparent 65%)',
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
            <span style={{ fontSize: 40 }}>⚡</span>
            <div>
              <div className="font-mono text-xs mb-1" style={{ color: ACCENT }}>LEVEL 4 · 65,000 TPS</div>
              <h1 className="font-syne font-black" style={{ fontSize: 'clamp(1.5rem, 5vw, 2.25rem)', color: 'var(--text-primary)', lineHeight: 1.1 }}>
                Solana: The Fast and the Furious
              </h1>
            </div>
          </div>
          <p className="font-mono text-sm mb-4" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            Built at 2am, crashed with FTX, came back from the dead. Speed has a price — and Solana paid it.
          </p>
          <div className="flex gap-3 flex-wrap">
            {[['3 PTS base', ACCENT], ['+1 perfect bonus', '#FFD700'], ['~7 min read', 'var(--text-secondary)']].map(([t, c]) => (
              <span key={t} className="font-mono text-xs px-3 py-1 rounded-full" style={{ background: `${c}18`, color: c, border: `1px solid ${c}33` }}>
                {t}
              </span>
            ))}
          </div>
        </motion.div>

        {/* ══════════════════ SECTION 1 ══════════════════ */}
        <SectionConnector emoji="🌙" />

        <SectionCard>
          <SectionTag number="1" label="The Engineer Who Bet Everything" />
          <h2 className="font-syne font-black text-2xl mb-5" style={{ color: 'var(--text-primary)' }}>
            Built at 2am. <span style={{ color: ACCENT }}>Possibly Drunk.</span>
          </h2>
          <p className="font-mono text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>Anatoly Yakovenko</strong> spent years at Qualcomm building chips and optimizing systems. He was
            the kind of engineer who thought in nanoseconds. Then in 2017, at 2am — he admits this — he had an idea
            that would change blockchain forever.
          </p>
          <div className="rounded-xl p-5 mb-5" style={{ background: 'var(--bg-secondary)', border: `1px solid ${ACCENT}33` }}>
            <p className="font-mono text-sm italic leading-relaxed mb-2" style={{ color: 'var(--text-primary)' }}>
              "What if we used time itself as a consensus mechanism?"
            </p>
            <p className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>— Anatoly Yakovenko, 2017 (2am edition)</p>
          </div>
          <p className="font-mono text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
            He published the Solana whitepaper in 2017. Nobody took it seriously at first.
            Then the network launched. Then the numbers came in.
          </p>
          <p className="font-mono text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Now Solana processes more transactions per day than every other blockchain combined.
            Not bad for a 2am shower thought.
          </p>

          <LevelImage src="./images/solana_start.gif" alt="Solana origin story" />

          <MemeQuote>"Built by an ex-Qualcomm engineer at 2am. Just like your startup idea."</MemeQuote>
        </SectionCard>

        {/* ══════════════════ SECTION 2 ══════════════════ */}
        <SectionConnector emoji="⚡" />

        <SectionCard>
          <SectionTag number="2" label="Speed vs Everything" />
          <h2 className="font-syne font-black text-2xl mb-5" style={{ color: 'var(--text-primary)' }}>
            Faster Than <span style={{ color: GREEN }}>Visa.</span> Let That Sink In.
          </h2>

          <div className="flex flex-col gap-3 mb-6">
            {[
              { chain: 'Bitcoin',  tps: '7 TPS',      color: '#F7931A', width: '2%' },
              { chain: 'Ethereum', tps: '15–30 TPS',  color: '#627EEA', width: '5%' },
              { chain: 'Visa',     tps: '24,000 TPS', color: '#FFD700', width: '37%' },
              { chain: 'Solana',   tps: '65,000 TPS', color: ACCENT,    width: '100%' },
            ].map((row, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="p-4 rounded-xl"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
              >
                <div className="flex justify-between mb-2">
                  <span className="font-syne font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{row.chain}</span>
                  <span className="font-mono text-sm font-bold" style={{ color: row.color }}>{row.tps}</span>
                </div>
                <div className="h-2 rounded-full" style={{ background: 'var(--border)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: row.width }}
                    transition={{ duration: 0.8, delay: i * 0.15, ease: 'easeOut' }}
                    viewport={{ once: true }}
                    className="h-full rounded-full"
                    style={{ background: row.color }}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          <p className="font-mono text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
            How? <strong style={{ color: 'var(--text-primary)' }}>Proof of History (PoH).</strong> Normal blockchains
            waste time arguing about what time it is — every node has to agree on the sequence of events.
            Solana built a cryptographic clock directly into the blockchain.
            No arguing. No waiting. Just speed.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-5">
            {[
              { label: 'Ethereum tx fee', amount: '$5 – $500', color: '#FF3366', icon: '😭' },
              { label: 'Solana tx fee',   amount: '$0.00025',  color: GREEN,      icon: '🎉' },
            ].map((item) => (
              <div key={item.label} className="flex-1 p-4 rounded-xl text-center" style={{ background: 'var(--bg-secondary)', border: `1px solid ${item.color}33` }}>
                <div style={{ fontSize: 28 }}>{item.icon}</div>
                <div className="font-syne font-black text-xl mt-1" style={{ color: item.color }}>{item.amount}</div>
                <div className="font-mono text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{item.label}</div>
              </div>
            ))}
          </div>

          <CalloutBox>
            <p className="font-mono text-sm leading-relaxed" style={{ color: ACCENT }}>
              🎰 <strong>Solana is so fast and cheap that it became the home of memecoins, NFTs, and degens.</strong>
              <br /><br />
              If Ethereum is Wall Street, Solana is the casino floor.
            </p>
          </CalloutBox>
        </SectionCard>

        {/* ══════════════════ SECTION 3 ══════════════════ */}
        <SectionConnector emoji="💀" />

        <SectionCard>
          <SectionTag number="3" label="The FTX Connection" />
          <h2 className="font-syne font-black text-2xl mb-1" style={{ color: 'var(--text-primary)' }}>
            When <span style={{ color: '#FF3366' }}>SBF Fell,</span> Solana Fell With Him
          </h2>
          <div className="font-mono text-xs mb-5" style={{ color: 'var(--text-secondary)' }}>November 2022 — The crash nobody wanted to believe</div>

          <p className="font-mono text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
            Sam Bankman-Fried and FTX loved Solana. They bought massive amounts of SOL early and promoted it everywhere.
            The relationship was open and proud. SOL rode the wave.
          </p>

          <div className="flex flex-col gap-3 mb-5">
            {[
              { label: 'SOL all-time low (early days)', price: '$0.22', dir: 'start', color: 'var(--text-secondary)' },
              { label: 'SOL peak (Nov 2021)',           price: '$260',  dir: 'peak',  color: GREEN },
              { label: 'FTX collapse (Nov 2022)',        price: '',      dir: 'event', color: '#FF3366' },
              { label: 'SOL bottom post-FTX',           price: '$8',    dir: 'end',   color: '#FF3366' },
            ].map((row, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: row.color }} />
                <div className="flex-1 font-mono text-sm" style={{ color: 'var(--text-secondary)' }}>{row.label}</div>
                {row.price && <div className="font-syne font-black text-lg" style={{ color: row.color }}>{row.price}</div>}
                {!row.price && <div className="font-mono text-xs px-2 py-1 rounded" style={{ background: '#FF336622', color: '#FF3366' }}>COLLAPSE</div>}
              </div>
            ))}
          </div>

          <p className="font-mono text-sm leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
            SBF arrested. Billions gone. SOL at $8. Crypto Twitter wrote the obituary.
            Multiple articles declared Solana dead. The post-mortems were thorough.
          </p>
          <p className="font-mono text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            They were wrong.
          </p>

          <LevelImage src="./images/ftx_crash.gif" alt="FTX collapse 2022" />
        </SectionCard>

        {/* ══════════════════ SECTION 4 ══════════════════ */}
        <SectionConnector emoji="🔄" />

        <SectionCard>
          <SectionTag number="4" label="The Comeback Nobody Expected" />
          <h2 className="font-syne font-black text-2xl mb-5" style={{ color: 'var(--text-primary)' }}>
            From <span style={{ color: '#FF3366' }}>$8</span> Back to <span style={{ color: GREEN }}>$293</span>
          </h2>

          <p className="font-mono text-sm leading-relaxed mb-5" style={{ color: 'var(--text-secondary)' }}>
            While everyone was writing the obituary, the developers kept building. That is the whole story.
            That is always the whole story.
          </p>

          <div className="flex flex-col gap-4 mb-5">
            {[
              { icon: '🏪', title: 'Magic Eden',  body: 'The dominant Solana NFT marketplace kept shipping. Collections stayed active. The ecosystem did not die.' },
              { icon: '🚀', title: 'Pump.fun',    body: 'Anyone can create a token in 2 minutes for $2. The meme machine went into overdrive. Millions of tokens launched.' },
              { icon: '📈', title: '2024–2025 revival', body: 'By 2024–2025 SOL hit $293 — almost $300. Transactions per day hit records. The comeback was complete.' },
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

          <MemeQuote>"Solana is dead" — Crypto Twitter, every 6 months since 2022</MemeQuote>

          <div className="mt-6">
            <p className="font-mono text-sm leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
              But also — real talk:
            </p>
            <div className="flex flex-col gap-2 mb-4">
              {[
                'Solana has gone down multiple times. Network outages lasting hours.',
                'Not fully decentralized like Bitcoin.',
                'More like a fast centralized database with crypto vibes.',
              ].map((line, i) => (
                <div key={i} className="flex gap-3 font-mono text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <span style={{ color: '#FF3366', flexShrink: 0 }}>→</span>
                  {line}
                </div>
              ))}
            </div>
          </div>

          <CalloutBox>
            <p className="font-mono text-sm leading-relaxed" style={{ color: ACCENT }}>
              ⚖️ <strong>Solana chose speed over decentralization. Bitcoin chose decentralization over speed.</strong>
              <br /><br />
              Neither is wrong. They are just different tools.
            </p>
          </CalloutBox>
        </SectionCard>

        {/* ══════════════════ SECTION 5 ══════════════════ */}
        <SectionConnector emoji="🎰" />

        <SectionCard>
          <SectionTag number="5" label="Solana Today: The Memecoin Capital" />
          <h2 className="font-syne font-black text-2xl mb-5" style={{ color: 'var(--text-primary)' }}>
            Where Tokens Go <span style={{ color: GREEN }}>1000x</span> or <span style={{ color: '#FF3366' }}>Zero</span> in 48 Hours
          </h2>

          <div className="p-4 rounded-xl mb-5" style={{ background: `rgba(153,69,255,0.08)`, border: `1px solid ${ACCENT}33` }}>
            <div className="font-syne font-bold text-sm mb-1" style={{ color: ACCENT }}>Pump.fun — the memecoin factory</div>
            <p className="font-mono text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              $1M+ in fees per day. Any anon can launch a token in 2 minutes for $2.
              Most go to zero within hours. Some go to hundreds of millions.
              The machine never stops.
            </p>
          </div>

          <div className="flex flex-col gap-3 mb-5">
            {[
              { name: 'BONK',    desc: 'Community memecoin airdropped to Solana holders for free. Hit $2B+ market cap.', color: '#FF9900' },
              { name: 'WIF',     desc: 'dogwifhat — a dog wearing a hat. Nothing more. Hit $4B market cap. Few understand.', color: '#E879F9' },
              { name: 'POPCAT',  desc: 'A cat. Just a cat. Meme from 2020. Billions in trading volume on Solana in 2024.', color: GREEN },
            ].map((coin, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="flex items-start gap-4 p-4 rounded-xl"
                style={{ background: 'var(--bg-secondary)', border: `1px solid ${coin.color}33` }}
              >
                <div
                  className="font-syne font-black text-sm px-2 py-1 rounded flex-shrink-0"
                  style={{ background: `${coin.color}22`, color: coin.color }}
                >
                  ${coin.name}
                </div>
                <p className="font-mono text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{coin.desc}</p>
              </motion.div>
            ))}
          </div>

          <LevelImage src="./images/solana_meme.gif" alt="Solana memecoin chaos" />

          <MemeQuote>
            "Solana: where tokens go from $0 to $100M to $0 again in 48 hours.
            Few understand. Most get rekt. LFG."
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
          <div style={{ fontSize: 48, marginBottom: 12 }}>⚡</div>
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
          <button type="button" onClick={startQuiz} className="btn-primary px-12 py-4 text-lg" style={{ fontFamily: 'Syne, sans-serif', background: `linear-gradient(135deg, ${ACCENT}, #7733cc)` }}>
            Start Quiz ⚡
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
                    <span style={{ fontSize: 24 }}>⚡</span>
                    <h2 className="font-syne font-black text-xl" style={{ color: 'var(--text-primary)' }}>
                      Solana — Quiz
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
