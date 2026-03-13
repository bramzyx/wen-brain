import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/useGameStore'
import { useSound } from '../hooks/useSound'
import { useLevelMeta } from '../hooks/useLevelMeta'

const ACCENT = '#FFD700'
const GREEN  = '#00CC44'

const QUIZ = [
  {
    q: 'What was Dogecoin originally created as?',
    options: [
      'A serious Bitcoin competitor',
      'A joke to mock crypto speculation',
      "Elon Musk's personal project",
      'A payment system for Reddit',
    ],
    correct: 1,
    fact: 'Two engineers made it in 3 hours as a joke. They took a Shiba Inu meme and turned it into a coin to mock the insanity of crypto speculation. It later hit a $90 billion market cap. The joke won.',
  },
  {
    q: 'What happened when Vitalik Buterin received half the SHIB supply?',
    options: [
      'He kept it all',
      'He burned it and kept the proceeds',
      'He donated it worth $1B to India COVID relief',
      'He sold it on Binance',
    ],
    correct: 2,
    fact: 'The SHIB creators sent half the supply to Vitalik as a joke — thinking he would never touch it. He donated it to India COVID relief, worth over $1 billion at the time. A memecoin accidentally funded one of the largest crypto charity donations ever.',
  },
  {
    q: 'What is Pump.fun?',
    options: [
      'A crypto exchange like Coinbase',
      'A platform where anyone can launch a token in minutes',
      "Ethereum's official token launcher",
      'A Bitcoin mining pool',
    ],
    correct: 1,
    fact: 'Pump.fun on Solana lets anyone launch a token in 2 minutes. No code, no team, no whitepaper needed. It makes $1M+ per day in fees. Over 4 million tokens were launched in 2024. Less than 1% ever reached $1M market cap.',
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
        boxShadow: '0 0 24px rgba(255,215,0,0.10)',
        margin: '20px 0',
      }}
    />
  )
}

function CoinLogo({ srcs, alt, color }) {
  const sources = Array.isArray(srcs) ? srcs : [srcs]
  const [idx, setIdx] = useState(0)
  const allFailed = idx >= sources.length
  return (
    <img
      key={idx}
      src={allFailed ? '' : sources[idx]}
      alt={alt}
      onError={() => setIdx((i) => i + 1)}
      style={{
        width: 40, height: 40, borderRadius: '50%', objectFit: 'cover',
        display: 'block', margin: '0 auto',
        opacity: allFailed ? 0 : 1,
        border: allFailed ? 'none' : `2px solid ${color}22`,
      }}
    />
  )
}

// ─── Confetti burst ───────────────────────────────────────────────────────────

const CONFETTI = Array.from({ length: 22 }, (_, i) => ({
  angle: (i / 22) * Math.PI * 2,
  dist: 50 + (i * 13) % 80,
  color: ['#FFD700', '#00CC44', '#FF3366', '#9945FF', '#00FFA3', '#ffffff'][i % 6],
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

  const timerColor = timer > 15 ? ACCENT : timer > 8 ? '#FF9900' : '#FF3366'
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
              border = `1px solid ${GREEN}`; bg = 'rgba(0,204,68,0.10)'; col = GREEN
              shadow = `0 0 16px rgba(0,204,68,0.25)`
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
              background: isCorrect ? 'rgba(0,204,68,0.07)' : 'rgba(255,51,102,0.07)',
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
      <div className="text-7xl mb-5">{isWagmi ? '🏆' : passed ? '🐕' : '💀'}</div>
      <h2 className="font-syne font-black mb-2" style={{ fontSize: '4rem', color: isWagmi ? ACCENT : ACCENT }}>
        {score}/3
      </h2>
      <div className="font-syne font-bold text-2xl mb-2" style={{ color: isWagmi ? ACCENT : passed ? GREEN : '#FF3366' }}>
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
          href={`https://twitter.com/intent/tweet?text=${tweet}&url=https://wenbrain.com/level/6`}
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
            style={{ background: `linear-gradient(135deg,${GREEN},#009933)`, color: '#fff', fontFamily: 'Syne, sans-serif' }}
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

export default function Level6Page() {
  const navigate = useNavigate()
  const { completeLevel, submitToLeaderboard, playerName, totalXP } = useGameStore()
  const { play } = useSound()
  useLevelMeta(6)

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
        completeLevel(6, xp)
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
    `A joke dog coin hit $90 billion market cap.\nA frog from 4chan made people millionaires.\n\nMuch wow. Very crypto 👇\n@wenbrainbro\n\n#WenBrain #Dogecoin #Memecoins`
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

      {/* Yellow glow */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 900,
        height: 900,
        background: 'radial-gradient(ellipse, rgba(255,215,0,0.05) 0%, transparent 65%)',
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
            <span style={{ fontSize: 40 }}>🐸</span>
            <div>
              <div className="font-mono text-xs mb-1" style={{ color: ACCENT }}>LEVEL 6 · DOGE TO PEPE</div>
              <h1 className="font-syne font-black" style={{ fontSize: 'clamp(1.5rem, 5vw, 2.25rem)', color: 'var(--text-primary)', lineHeight: 1.1 }}>
                Memecoins: From Joke to Millionaire
              </h1>
            </div>
          </div>
          <p className="font-mono text-sm mb-4" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            A dog meme hit $90 billion. A frog hit $1 billion in 2 weeks. None of it makes sense. All of it happened.
          </p>
          <div className="flex gap-3 flex-wrap">
            {[['3 PTS base', ACCENT], ['+1 perfect bonus', GREEN], ['~7 min read', 'var(--text-secondary)']].map(([t, c]) => (
              <span key={t} className="font-mono text-xs px-3 py-1 rounded-full" style={{ background: `${c}18`, color: c, border: `1px solid ${c}33` }}>
                {t}
              </span>
            ))}
          </div>
        </motion.div>

        {/* ══════════════════ SECTION 1 ══════════════════ */}
        <SectionConnector emoji="🐕" />

        <SectionCard>
          <SectionTag number="1" label="It Started With a Dog" />
          <h2 className="font-syne font-black text-2xl mb-5" style={{ color: 'var(--text-primary)' }}>
            Made in 3 Hours. <span style={{ color: ACCENT }}>Worth $90 Billion.</span>
          </h2>

          <p className="font-mono text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
            In 2013 two engineers were bored. <strong style={{ color: 'var(--text-primary)' }}>Jackson Palmer</strong> and{' '}
            <strong style={{ color: 'var(--text-primary)' }}>Billy Markus</strong> wanted to make fun of the insane crypto
            speculation happening around them. They took a Shiba Inu dog meme called Doge and made it a cryptocurrency in
            3 hours. As a joke. They never thought it would be worth anything.
          </p>

          <div className="rounded-xl p-5 mb-5" style={{ background: 'var(--bg-secondary)', border: `1px solid ${ACCENT}33` }}>
            <div className="font-mono text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>Fast forward to 2021:</div>
            <div className="flex flex-col gap-2">
              {[
                { event: 'Elon Musk tweets "Doge" — one word', result: 'Price pumps 800% in 24 hours' },
                { event: 'Market cap hits $90 billion', result: 'Worth more than Ford Motor Company' },
                { event: 'Jackson Palmer left crypto disgusted', result: 'Billy Markus became a millionaire' },
              ].map((row, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span style={{ color: ACCENT, flexShrink: 0 }}>→</span>
                  <div>
                    <span className="font-mono text-sm" style={{ color: 'var(--text-primary)' }}>{row.event}</span>
                    <span className="font-mono text-xs ml-2" style={{ color: ACCENT }}>({row.result})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <LevelImage src="/images/doge_moon.gif?v=2" alt="Doge to the moon" />

          <MemeQuote>Much wow. Very crypto. Such money.</MemeQuote>

          <CalloutBox>
            <p className="font-mono text-sm leading-relaxed" style={{ color: ACCENT }}>
              🐕 <strong>Dogecoin was created in 3 hours as a joke. It reached a $90 billion market cap.</strong>
              <br /><br />
              This tells you everything you need to know about crypto markets.
            </p>
          </CalloutBox>
        </SectionCard>

        {/* ══════════════════ SECTION 2 ══════════════════ */}
        <SectionConnector emoji="🌳" />

        <SectionCard>
          <SectionTag number="2" label="The Memecoin Family Tree" />
          <h2 className="font-syne font-black text-2xl mb-5" style={{ color: 'var(--text-primary)' }}>
            From Doge <span style={{ color: ACCENT }}>Came Everything Else</span>
          </h2>

          <div className="flex flex-col gap-4 mb-5">
            {[
              {
                srcs: 'https://assets.coingecko.com/coins/images/5/small/dogecoin.png',
                ticker: 'DOGE', name: 'Dogecoin',
                body: 'The original. Still alive. Still pumps when Elon tweets. The grandfather of all memecoins.',
                color: '#F7931A',
              },
              {
                srcs: 'https://assets.coingecko.com/coins/images/11939/small/shiba.png',
                ticker: 'SHIB', name: 'Shiba Inu',
                body: '"Dogecoin killer" launched anonymously in 2020. Created 1 quadrillion tokens. Sent half to Vitalik as a joke — he donated them worth $1B to India COVID relief. A meme coin accidentally funded one of the largest crypto charity donations ever.',
                color: '#FF6600',
              },
              {
                srcs: 'https://assets.coingecko.com/coins/images/29850/small/pepe-token.jpeg',
                ticker: 'PEPE', name: 'Pepe',
                body: 'Matt Furie created the green frog in 2005 as a comic. Had nothing to do with crypto. In 2023 someone launched $PEPE. Hit $1B market cap in 2 weeks. Matt Furie got nothing. Zero. Nada.',
                color: GREEN,
              },
              {
                srcs: 'https://s2.coinmarketcap.com/static/img/coins/64x64/28752.png',
                ticker: 'WIF', name: 'dogwifhat',
                body: 'A Solana dog wearing a hat. Literally just a dog with a hat. Hit $4B market cap. Someone spent $700,000 to put the dog on the Las Vegas Sphere. This is real life.',
                color: '#E879F9',
              },
              {
                srcs: 'https://assets.coingecko.com/coins/images/28600/small/bonk.jpg',
                ticker: 'BONK', name: 'Bonk',
                body: 'Solana community memecoin. Airdropped free to NFT holders on Christmas 2022 when Solana was declared dead. BONK helped revive the entire Solana ecosystem. A meme coin saved a blockchain.',
                color: ACCENT,
              },
            ].map((coin, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                viewport={{ once: true }}
                className="flex gap-4 p-4 rounded-xl"
                style={{ background: 'var(--bg-secondary)', border: `1px solid ${coin.color}33`, borderLeft: `3px solid ${coin.color}` }}
              >
                <div className="flex-shrink-0 text-center" style={{ minWidth: 48 }}>
                  <CoinLogo srcs={coin.srcs} alt={coin.name} color={coin.color} />
                  <div className="font-syne font-black text-xs mt-1" style={{ color: coin.color }}>${coin.ticker}</div>
                </div>
                <div>
                  <div className="font-syne font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{coin.name}</div>
                  <p className="font-mono text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{coin.body}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <p className="font-mono text-xs" style={{ color: 'var(--text-secondary)', opacity: 0.55 }}>
            ...and many more: POPCAT, FLOKI, BABYDOGE, MOG, BRETT and thousands of others. New ones launch every hour on Pump.fun.
          </p>

          <LevelImage src="/images/memecoin_family.gif?v=2" alt="Memecoin family tree" />
        </SectionCard>

        {/* ══════════════════ SECTION 3 ══════════════════ */}
        <SectionConnector emoji="🏭" />

        <SectionCard>
          <SectionTag number="3" label="Pump.fun: The Memecoin Factory" />
          <h2 className="font-syne font-black text-2xl mb-5" style={{ color: 'var(--text-primary)' }}>
            Anyone. <span style={{ color: ACCENT }}>2 Minutes.</span> A Token.
          </h2>

          <p className="font-mono text-sm leading-relaxed mb-5" style={{ color: 'var(--text-secondary)' }}>
            In 2024 someone built Pump.fun on Solana. No coding required. No team. No whitepaper.
            Just a name, a picture, and a dream — or a rug pull. Usually a rug pull.
          </p>

          <div className="rounded-xl p-5 mb-5" style={{ background: 'var(--bg-secondary)', border: `1px solid ${ACCENT}33` }}>
            <div className="font-syne font-bold text-sm mb-3" style={{ color: ACCENT }}>How it works (the honest version):</div>
            <div className="flex flex-col gap-2">
              {[
                'You create a token',
                'You buy some for yourself (insider bag)',
                'You shill it on Twitter / Telegram',
                'People FOMO in — price goes up',
                'You sell everything — price crashes',
                'Buyers left holding nothing',
              ].map((step, i) => (
                <div key={i} className="flex gap-3 font-mono text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <span className="font-bold flex-shrink-0" style={{ color: i < 4 ? ACCENT : '#FF3366' }}>{i + 1}.</span>
                  <span style={{ color: i >= 4 ? '#FF3366' : 'var(--text-secondary)' }}>{step}</span>
                </div>
              ))}
            </div>
            <div className="font-syne font-bold text-sm mt-3" style={{ color: '#FF3366' }}>This is called a rug pull. It happens hundreds of times per day.</div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            {[
              { label: 'Pump.fun daily fees', value: '$1M+',          color: GREEN },
              { label: 'Tokens launched 2024', value: '4M+',          color: ACCENT },
              { label: 'Reach $1M market cap', value: '<1%',          color: '#FF3366' },
              { label: 'Go to zero in an hour', value: 'Most of them', color: '#FF3366' },
            ].map((stat) => (
              <div key={stat.label} className="flex-1 p-3 rounded-xl text-center" style={{ background: 'var(--bg-secondary)', border: `1px solid ${stat.color}33` }}>
                <div className="font-syne font-black text-lg" style={{ color: stat.color }}>{stat.value}</div>
                <div className="font-mono text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          <LevelImage src="/images/pumpfun.gif?v=2" alt="Pump.fun memecoin chaos" />

          <CalloutBox>
            <p className="font-mono text-sm leading-relaxed" style={{ color: ACCENT }}>
              🎰 <strong>Pump.fun is the purest form of crypto: completely unregulated, completely chaotic,
              and occasionally life-changing.</strong>
              <br /><br />
              Usually in the wrong direction.
            </p>
          </CalloutBox>
        </SectionCard>

        {/* ══════════════════ SECTION 4 ══════════════════ */}
        <SectionConnector emoji="🏆" />

        <SectionCard>
          <SectionTag number="4" label="The People Who Won" />
          <h2 className="font-syne font-black text-2xl mb-5" style={{ color: 'var(--text-primary)' }}>
            Yes, Some People <span style={{ color: GREEN }}>Actually Made It</span>
          </h2>

          <div className="flex flex-col gap-3 mb-6">
            {[
              { coin: 'DOGE (2015 → peak 2021)',  invest: '$1,000', result: '$3,000,000',  color: '#F7931A' },
              { coin: 'SHIB (2020 → peak 2021)',  invest: '$1,000', result: '$15,000,000', color: '#FF6600' },
              { coin: 'PEPE (launch → peak 2023)', invest: '$1,000', result: '$4,000,000',  color: GREEN },
              { coin: 'WIF (launch → peak 2024)',  invest: '$1,000', result: '$15,000,000', color: '#E879F9' },
            ].map((row, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="flex items-center justify-between p-4 rounded-xl"
                style={{ background: 'var(--bg-secondary)', border: `1px solid ${row.color}33` }}
              >
                <div>
                  <div className="font-syne font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{row.coin}</div>
                  <div className="font-mono text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>Invested: {row.invest}</div>
                </div>
                <div className="font-syne font-black text-xl" style={{ color: row.color }}>{row.result}</div>
              </motion.div>
            ))}
          </div>

          <div className="rounded-xl p-5 mb-5" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <div className="font-syne font-bold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>The pattern (easy to say, impossible to do):</div>
            <div className="flex flex-col gap-1">
              {[
                ['Buy early', GREEN],
                ['Hold through the chaos', ACCENT],
                ['Sell before it crashes', GREEN],
              ].map(([line, color]) => (
                <div key={line} className="flex gap-2 font-mono text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <span style={{ color }}>✓</span> {line}
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
              <div className="font-syne font-bold text-sm mb-2" style={{ color: '#FF3366' }}>What most people actually do:</div>
              {[
                'Buy at the top (FOMO)',
                'Hold while it crashes (hopium)',
                'Sell at the bottom (panic)',
                'Repeat until broke',
              ].map((line) => (
                <div key={line} className="flex gap-2 font-mono text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <span style={{ color: '#FF3366' }}>✗</span> {line}
                </div>
              ))}
            </div>
          </div>

          <MemeQuote>"Buy high sell low" — retail investor motto</MemeQuote>

          <LevelImage src="/images/wagmi_ngmi.gif?v=2" alt="WAGMI vs NGMI" />

          <CalloutBox>
            <p className="font-mono text-sm leading-relaxed" style={{ color: ACCENT }}>
              📊 <strong>For every memecoin millionaire there are 1,000 people who lost money.</strong>
              <br /><br />
              The millionaire posts about it. The others stay quiet.
              This is called survivorship bias.
            </p>
          </CalloutBox>
        </SectionCard>

        {/* ══════════════════ SECTION 5 ══════════════════ */}
        <SectionConnector emoji="🎲" />

        <SectionCard>
          <SectionTag number="5" label="The Honest Truth About Memecoins" />
          <h2 className="font-syne font-black text-2xl mb-5" style={{ color: 'var(--text-primary)' }}>
            100% Speculation. <span style={{ color: ACCENT }}>Zero Utility.</span> Play Accordingly.
          </h2>

          <p className="font-mono text-sm leading-relaxed mb-5" style={{ color: 'var(--text-secondary)' }}>
            Memecoins have no utility. No product. No team. No roadmap.
            They are 100% speculation and vibes — and that is fine, IF you know that going in.
          </p>

          <div className="flex flex-col gap-3 mb-5">
            {[
              { rule: 'Only use money you can lose completely', pass: true },
              { rule: 'Take profits on the way up, not all at once', pass: true },
              { rule: 'Never go all in on one memecoin', pass: true },
              { rule: 'Early = better. Late = exit liquidity.', pass: true },
              { rule: 'Follow the narrative, not the chart', pass: true },
              { rule: 'When influencers shill it, it is too late', pass: true },
              { rule: 'Have an exit plan before you enter', pass: true },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                viewport={{ once: true }}
                className="flex gap-3 items-start p-3 rounded-lg font-mono text-sm"
                style={{ background: 'var(--bg-secondary)', border: `1px solid ${GREEN}22`, color: 'var(--text-secondary)' }}
              >
                <span style={{ color: GREEN, flexShrink: 0, fontWeight: 'bold' }}>✅</span>
                {item.rule}
              </motion.div>
            ))}
          </div>

          <LevelImage src="/images/degen_life.gif?v=2" alt="Degen life" />

          <MemeQuote>
            "Memecoins are not investments.
            They are multiplayer gambling with extra steps and a dog picture.
            Play accordingly. Not financial advice."
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
          <div style={{ fontSize: 48, marginBottom: 12 }}>🐸</div>
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
            style={{ fontFamily: 'Syne, sans-serif', background: `linear-gradient(135deg, ${ACCENT}, #cc9900)`, color: '#000' }}
          >
            Start Quiz 🐸
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
                    <span style={{ fontSize: 24 }}>🐸</span>
                    <h2 className="font-syne font-black text-xl" style={{ color: 'var(--text-primary)' }}>
                      Memecoins — Quiz
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
