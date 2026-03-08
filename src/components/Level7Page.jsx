import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/useGameStore'
import { useSound } from '../hooks/useSound'
import { useLevelMeta } from '../hooks/useLevelMeta'

const ACCENT = '#0099FF'

const QUIZ = [
  {
    q: 'What does a crypto whale do to buy Bitcoin at a lower price?',
    options: [
      'Ask nicely on Twitter',
      'Sell large amounts to crash the price then buy back cheaper',
      'Mine new Bitcoin directly',
      'Borrow from the Federal Reserve',
    ],
    correct: 1,
    fact: 'Classic whale playbook: dump a huge position suddenly, retail panics and sells, price crashes, whale scoops back up cheaper. They end up with more Bitcoin than they started with and retail gets wrecked. On-chain tracking tools can sometimes catch this in real time.',
  },
  {
    q: 'What does the Fear and Greed Index measure?',
    options: [
      'The speed of Bitcoin transactions',
      'How many whales are active',
      'The overall emotional state of crypto markets',
      'The total supply of Bitcoin',
    ],
    correct: 2,
    fact: '0 = Extreme Fear (historically good time to accumulate). 100 = Extreme Greed (historically good time to be careful). Most retail investors buy at 80–100 (greed) and sell at 10–20 (fear). The exact opposite of optimal.',
  },
  {
    q: 'What happened in January 2024 that changed Bitcoin forever?',
    options: [
      'Satoshi returned',
      'Bitcoin was banned in the US',
      'SEC approved Bitcoin ETFs allowing institutions to invest freely',
      'Bitcoin hit $1 million',
    ],
    correct: 2,
    fact: "The SEC approved spot Bitcoin ETFs in January 2024. BlackRock's IBIT pulled in $10 billion in its first month — the fastest ETF launch in history. Wall Street had officially entered the game. Institutional money can now flow into Bitcoin as easily as buying a stock.",
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
        border: '1px solid rgba(0,153,255,0.18)',
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
        background: `rgba(0,153,255,0.07)`,
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
        border: '1px solid rgba(0,153,255,0.19)',
        boxShadow: '0 0 24px rgba(0,153,255,0.12)',
        margin: '20px 0',
      }}
    />
  )
}

// ─── Confetti burst ───────────────────────────────────────────────────────────

const CONFETTI = Array.from({ length: 22 }, (_, i) => ({
  angle: (i / 22) * Math.PI * 2,
  dist: 50 + (i * 13) % 80,
  color: ['#0099FF', '#33aaff', '#00FF94', '#FFD700', '#FF3366', '#ffffff'][i % 6],
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
      <div className="text-7xl mb-5">{isWagmi ? '🏆' : passed ? '🐋' : '💀'}</div>
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
          href={`https://twitter.com/intent/tweet?text=${tweet}&url=https://wenbrain.com?level=7`}
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

export default function Level7Page() {
  const navigate = useNavigate()
  const { completeLevel, submitToLeaderboard, playerName, totalXP } = useGameStore()
  const { play } = useSound()
  useLevelMeta(7)

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
        completeLevel(7, xp)
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
    `You are the small fish ser.\nWhales move markets while you sleep.\n\nLearn how it really works 👇\n@wenbrainbro\n\n#WenBrain #Crypto #Bitcoin`
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

      {/* Ocean blue glow */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 900,
        height: 900,
        background: 'radial-gradient(ellipse, rgba(0,153,255,0.06) 0%, transparent 65%)',
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
            <span style={{ fontSize: 40 }}>🐋</span>
            <div>
              <div className="font-mono text-xs mb-1" style={{ color: ACCENT }}>LEVEL 7 · HOW IT REALLY WORKS</div>
              <h1 className="font-syne font-black" style={{ fontSize: 'clamp(1.5rem, 5vw, 2.25rem)', color: 'var(--text-primary)', lineHeight: 1.1 }}>
                Whales, Markets & Manipulation
              </h1>
            </div>
          </div>
          <p className="font-mono text-sm mb-4" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            Insider secrets: how whales move markets, why charts lie, and how Wall Street finally joined the game.
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
        <SectionConnector emoji="🐋" />

        <SectionCard>
          <SectionTag number="1" label="What is a Whale?" />
          <h2 className="font-syne font-black text-2xl mb-5" style={{ color: 'var(--text-primary)' }}>
            You Are the <span style={{ color: ACCENT }}>Small Fish</span>
          </h2>

          <p className="font-mono text-sm leading-relaxed mb-5" style={{ color: 'var(--text-secondary)' }}>
            In crypto a whale is someone who holds so much of a coin they can move the price just by buying or selling.
            Bitcoin whales hold <strong style={{ color: 'var(--text-primary)' }}>1,000+ BTC</strong> — that is $83M+ at current prices.
            There are about 2,000 of them. They watch each other. They watch you.
          </p>

          <div className="rounded-xl p-5 mb-5" style={{ background: 'var(--bg-secondary)', border: `1px solid ${ACCENT}33` }}>
            <div className="font-syne font-bold text-sm mb-3" style={{ color: ACCENT }}>How whales buy cheaper — step by step:</div>
            <div className="flex flex-col gap-2">
              {[
                { step: 'Whale wants to buy more BTC cheaply', color: 'var(--text-secondary)' },
                { step: 'Dumps a huge position suddenly', color: '#FF3366' },
                { step: 'Price drops. Retail panics and sells.', color: '#FF3366' },
                { step: 'Whale buys back everything cheaper', color: ACCENT },
                { step: 'Price recovers. Whale holds more BTC.', color: '#00FF94' },
                { step: 'Retail got played. Again.', color: 'var(--text-secondary)' },
              ].map((row, i) => (
                <div key={i} className="flex gap-3 font-mono text-sm" style={{ color: row.color }}>
                  <span style={{ color: ACCENT, flexShrink: 0 }}>{i + 1}.</span>
                  {row.step}
                </div>
              ))}
            </div>
          </div>

          <LevelImage src="/gifs/whale" alt="Crypto whale market manipulation" />

          <MemeQuote>"Whale spotted on chain" — Crypto Twitter going into panic mode</MemeQuote>

          <CalloutBox>
            <p className="font-mono text-sm leading-relaxed" style={{ color: ACCENT }}>
              🔍 <strong>On-chain data is public. You can watch whale wallets move in real time.</strong>
              <br /><br />
              Whale Alert tweets every time a whale moves millions. Knowledge is the only defense.
            </p>
          </CalloutBox>
        </SectionCard>

        {/* ══════════════════ SECTION 2 ══════════════════ */}
        <SectionConnector emoji="📊" />

        <SectionCard>
          <SectionTag number="2" label="Wash Trading & Fake Volume" />
          <h2 className="font-syne font-black text-2xl mb-5" style={{ color: 'var(--text-primary)' }}>
            Not Everything <span style={{ color: ACCENT }}>You See Is Real</span>
          </h2>

          <p className="font-mono text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>Wash trading</strong> = buying and selling to yourself
            to create fake volume and fake activity. Makes a coin look popular when it is not.
          </p>

          <div className="rounded-xl p-5 mb-5" style={{ background: 'var(--bg-secondary)', border: `1px solid ${ACCENT}33` }}>
            <div className="font-syne font-bold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>The playbook:</div>
            <div className="flex flex-col gap-2">
              {[
                ['Project launches new token. Nobody buys it.', 'var(--text-secondary)'],
                ['Founders trade it to themselves — fake volume.', '#FF3366'],
                ['Charts look active. Volume looks huge.', '#FF3366'],
                ['New investors see activity and buy in.', ACCENT],
                ['Founders sell their real bags into the demand.', '#FF3366'],
                ['Game over.', 'var(--text-secondary)'],
              ].map(([text, color], i) => (
                <div key={i} className="flex gap-3 font-mono text-sm" style={{ color }}>
                  <span style={{ color: ACCENT, flexShrink: 0 }}>→</span>
                  {text}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 mb-5">
            <div className="font-syne font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>Where it happens:</div>
            {[
              'Small cap tokens — constantly',
              'NFT collections — to inflate floor price',
              'Centralized exchanges — some had 95% fake volume',
            ].map((line, i) => (
              <div key={i} className="flex gap-3 font-mono text-sm" style={{ color: 'var(--text-secondary)' }}>
                <span style={{ color: '#FF3366', flexShrink: 0 }}>🚩</span>
                {line}
              </div>
            ))}
          </div>

          <LevelImage src="/gifs/fake_volume" alt="Fake volume wash trading" />

          <CalloutBox>
            <p className="font-mono text-sm leading-relaxed" style={{ color: ACCENT }}>
              📈 <strong>CoinMarketCap shows reported volume. Not verified volume.</strong>
              <br /><br />
              If a coin has $50M volume but only 100 holders, something is very wrong.
              Always check multiple sources.
            </p>
          </CalloutBox>
        </SectionCard>

        {/* ══════════════════ SECTION 3 ══════════════════ */}
        <SectionConnector emoji="📱" />

        <SectionCard>
          <SectionTag number="3" label="Pump and Dump Groups" />
          <h2 className="font-syne font-black text-2xl mb-1" style={{ color: 'var(--text-primary)' }}>
            Telegram Is <span style={{ color: ACCENT }}>Full of Them</span>
          </h2>
          <div className="font-mono text-xs mb-5" style={{ color: 'var(--text-secondary)' }}>
            "Join our signals group! We pump coins together and all get rich!"
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-5">
            <div className="flex-1 p-4 rounded-xl" style={{ background: 'var(--bg-secondary)', border: `1px solid ${ACCENT}33`, borderLeft: `3px solid ${ACCENT}` }}>
              <div className="font-syne font-bold text-sm mb-2" style={{ color: ACCENT }}>The pitch</div>
              <p className="font-mono text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                "Join our signals group! We pump coins together and all get rich!"
              </p>
            </div>
            <div className="flex-1 p-4 rounded-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid #FF336633', borderLeft: '3px solid #FF3366' }}>
              <div className="font-syne font-bold text-sm mb-2" style={{ color: '#FF3366' }}>The reality</div>
              <p className="font-mono text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Organizers buy first. Signal goes out. Group buys. Organizers sell. Group holds bags.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 mb-5">
            <div className="font-syne font-bold text-sm mb-1" style={{ color: '#FF3366' }}>Classic signs:</div>
            {[
              '"Next pump in 10 minutes" countdown',
              'Anonymous admins with no track record',
              'No explanation of why the coin is good',
              'Pressure to buy immediately or miss out',
              'They call it a "community movement"',
            ].map((line, i) => (
              <div key={i} className="flex gap-3 font-mono text-sm" style={{ color: 'var(--text-secondary)' }}>
                <span style={{ color: '#FF3366', flexShrink: 0 }}>🚩</span>
                {line}
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl mb-4" style={{ background: `rgba(0,153,255,0.08)`, border: `1px solid ${ACCENT}33` }}>
            <p className="font-mono text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Pump and dump is <strong style={{ color: '#FF3366' }}>illegal</strong> in stock markets.
              In crypto it happens openly every day. Regulators are slowly catching up.
              Until then: if someone is telling you to buy <strong style={{ color: ACCENT }}>RIGHT NOW</strong> — that is a red flag.
            </p>
          </div>

          <LevelImage src="/gifs/pump_dump" alt="Pump and dump scheme" />

          <MemeQuote>"This is definitely not a pump and dump" — every pump and dump group ever</MemeQuote>
        </SectionCard>

        {/* ══════════════════ SECTION 4 ══════════════════ */}
        <SectionConnector emoji="😱" />

        <SectionCard>
          <SectionTag number="4" label="The Emotions of Every Crypto Investor" />
          <h2 className="font-syne font-black text-2xl mb-5" style={{ color: 'var(--text-primary)' }}>
            This Cycle Happens <span style={{ color: ACCENT }}>to Almost Everyone</span>
          </h2>

          <div className="flex flex-col gap-2 mb-5">
            {[
              { emoji: '😐', label: 'SKEPTICISM',    text: '"Crypto is a scam"',                     color: 'var(--text-secondary)' },
              { emoji: '👀', label: 'ATTENTION',     text: '"Wait it keeps going up"',               color: 'var(--text-secondary)' },
              { emoji: '🤔', label: 'RESEARCH',      text: '"Ok let me look into this"',             color: ACCENT },
              { emoji: '💰', label: 'FOMO',          text: '"I need to buy NOW" ← usually the top',  color: '#FFD700' },
              { emoji: '😰', label: 'ANXIETY',       text: '"Why is it going down"',                 color: '#FF9900' },
              { emoji: '🙏', label: 'DENIAL',        text: '"It will come back"',                    color: '#FF9900' },
              { emoji: '😱', label: 'PANIC',         text: '"I need to sell everything" ← usually the bottom', color: '#FF3366' },
              { emoji: '😭', label: 'CAPITULATION',  text: 'Sells at a loss',                        color: '#FF3366' },
              { emoji: '😤', label: 'ANGER',         text: '"Crypto is a scam"',                     color: 'var(--text-secondary)' },
              { emoji: '🔄', label: 'REPEAT',        text: 'Back to step 1',                         color: ACCENT },
            ].map((row, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.4 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 p-3 rounded-lg"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
              >
                <span style={{ fontSize: 18, flexShrink: 0, width: 28, textAlign: 'center' }}>{row.emoji}</span>
                <span className="font-syne font-bold text-xs flex-shrink-0" style={{ color: row.color, minWidth: 100 }}>{row.label}</span>
                <span className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>{row.text}</span>
              </motion.div>
            ))}
          </div>

          <div className="p-4 rounded-xl mb-4" style={{ background: `rgba(0,153,255,0.08)`, border: `1px solid ${ACCENT}33` }}>
            <div className="font-syne font-bold text-sm mb-1" style={{ color: ACCENT }}>The Fear and Greed Index</div>
            <div className="flex gap-4 mt-3">
              {[
                { val: '0', label: 'Extreme Fear', sub: 'good time to buy', color: '#00FF94' },
                { val: '100', label: 'Extreme Greed', sub: 'good time to be careful', color: '#FF3366' },
              ].map((item) => (
                <div key={item.val} className="flex-1 p-3 rounded-lg text-center" style={{ background: 'var(--bg-primary)', border: `1px solid ${item.color}33` }}>
                  <div className="font-syne font-black text-2xl" style={{ color: item.color }}>{item.val}</div>
                  <div className="font-syne font-bold text-xs mt-1" style={{ color: item.color }}>{item.label}</div>
                  <div className="font-mono text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{item.sub}</div>
                </div>
              ))}
            </div>
          </div>

          <LevelImage src="/gifs/emotions" alt="Crypto investor emotions cycle" />

          <CalloutBox>
            <p className="font-mono text-sm leading-relaxed" style={{ color: ACCENT }}>
              💡 <strong>Warren Buffett said: be fearful when others are greedy. Be greedy when others are fearful.</strong>
              <br /><br />
              Crypto people know this quote. Almost none of them follow it.
            </p>
          </CalloutBox>
        </SectionCard>

        {/* ══════════════════ SECTION 5 ══════════════════ */}
        <SectionConnector emoji="🏦" />

        <SectionCard>
          <SectionTag number="5" label="The Big Players Who Changed Everything" />
          <h2 className="font-syne font-black text-2xl mb-5" style={{ color: 'var(--text-primary)' }}>
            When <span style={{ color: ACCENT }}>Institutions Arrived</span>
          </h2>

          <div className="flex flex-col gap-4 mb-5">
            {[
              {
                emoji: '🏦',
                title: 'Michael Saylor + MicroStrategy',
                body: 'MicroStrategy bought 500,000+ BTC with company money. Saylor called Bitcoin digital gold and went all in. Has not sold one sat. Changed how corporations view Bitcoin as a treasury asset.',
                color: '#F7931A',
              },
              {
                emoji: '🌎',
                title: 'El Salvador',
                body: 'President Bukele made Bitcoin legal tender — first country ever. Every citizen received $30 in BTC from the government. The IMF was furious. Bukele did not care. El Salvador is now profitable on their BTC holdings.',
                color: '#00CC44',
              },
              {
                emoji: '🏛️',
                title: 'BlackRock Bitcoin ETF — January 2024',
                body: "SEC approved spot Bitcoin ETFs. BlackRock's IBIT pulled $10 billion in its first month — the fastest ETF launch in history. Wall Street officially joined the game. Institutional money now flows into BTC as easily as buying a stock.",
                color: ACCENT,
              },
              {
                emoji: '🇺🇸',
                title: 'US Strategic Bitcoin Reserve — 2025',
                body: 'The US government announced a Strategic Bitcoin Reserve, holding seized Bitcoin as a national asset. The same government that said Bitcoin was for criminals now holds it strategically. This is how you know Bitcoin won.',
                color: '#FFD700',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="flex gap-4 p-4 rounded-xl"
                style={{ background: 'var(--bg-secondary)', border: `1px solid ${item.color}33`, borderLeft: `3px solid ${item.color}` }}
              >
                <span style={{ fontSize: 24, flexShrink: 0, lineHeight: 1.3 }}>{item.emoji}</span>
                <div>
                  <div className="font-syne font-bold text-sm mb-1" style={{ color: item.color }}>{item.title}</div>
                  <p className="font-mono text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.body}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <LevelImage src="/gifs/institutions" alt="Institutional Bitcoin adoption" />

          <MemeQuote>
            "First they ignore you. Then they laugh at you. Then they fight you.
            Then they buy Bitcoin ETFs. — probably Satoshi, definitely not Gandhi"
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
          <div style={{ fontSize: 48, marginBottom: 12 }}>🐋</div>
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
            style={{ fontFamily: 'Syne, sans-serif', background: `linear-gradient(135deg, ${ACCENT}, #0066cc)` }}
          >
            Start Quiz 🐋
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
                    <span style={{ fontSize: 24 }}>🐋</span>
                    <h2 className="font-syne font-black text-xl" style={{ color: 'var(--text-primary)' }}>
                      Whales & Markets — Quiz
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
