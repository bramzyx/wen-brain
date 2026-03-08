import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/useGameStore'
import { useSound } from '../hooks/useSound'
import { useLevelMeta } from '../hooks/useLevelMeta'

const ACCENT = '#FF3366'

const QUIZ = [
  {
    q: 'How much customer money did FTX lose?',
    options: ['$800 million', '$8 billion', '$800 billion', '$80 million'],
    correct: 1,
    fact: '$8 billion of customer funds — gone. FTX was the second largest crypto exchange, valued at $32 billion. SBF was using customer deposits to fund Alameda Research trades. He got 25 years in prison.',
  },
  {
    q: 'What happened to Terra/Luna in May 2022?',
    options: [
      'It got acquired by Binance',
      'It merged with Ethereum',
      'It crashed from $119 to near zero in 48 hours',
      'It was banned by the SEC',
    ],
    correct: 2,
    fact: '$40 billion wiped in 48 hours. LUNA went from $119 to $0.000001. The algorithmic stablecoin UST lost its peg, the algorithm printed infinite LUNA to compensate, LUNA became worthless, UST fell more — a death spiral with no bottom.',
  },
  {
    q: "What was BitConnect's promised monthly return?",
    options: ['5%', '15%', '40%', '100%'],
    correct: 2,
    fact: '40% monthly = 3,700% per year. Their magic trading bot never had a losing day. Classic Ponzi: new investor money paid old investors. When US regulators sent a cease letter in January 2018, the whole thing collapsed overnight. BCC went from $430 to $0.',
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
        border: '1px solid rgba(255,51,102,0.18)',
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

function WarningBox({ children }) {
  return (
    <div
      style={{
        background: `rgba(255,51,102,0.07)`,
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
        border: '1px solid rgba(255,51,102,0.19)',
        boxShadow: '0 0 24px rgba(255,51,102,0.12)',
        margin: '20px 0',
      }}
    />
  )
}

// ─── Confetti burst ───────────────────────────────────────────────────────────

const CONFETTI = Array.from({ length: 22 }, (_, i) => ({
  angle: (i / 22) * Math.PI * 2,
  dist: 50 + (i * 13) % 80,
  color: ['#FF3366', '#ff6688', '#FFD700', '#9945FF', '#00FFA3', '#ffffff'][i % 6],
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

  const timerColor = timer > 15 ? ACCENT : timer > 8 ? '#FFD700' : '#cc0033'
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
              border = `1px solid ${ACCENT}`; bg = 'rgba(255,51,102,0.10)'; col = ACCENT
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
              border: `1px solid ${isCorrect ? '#00FF9433' : `${ACCENT}33`}`,
              borderLeft: `4px solid ${isCorrect ? '#00FF94' : ACCENT}`,
            }}
          >
            <div className="font-syne font-bold text-sm mb-1" style={{ color: isCorrect ? '#00FF94' : ACCENT }}>
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
      <div className="text-7xl mb-5">{isWagmi ? '🏆' : passed ? '🤡' : '💀'}</div>
      <h2 className="font-syne font-black mb-2" style={{ fontSize: '4rem', color: isWagmi ? '#FFD700' : ACCENT }}>
        {score}/3
      </h2>
      <div className="font-syne font-bold text-2xl mb-2" style={{ color: isWagmi ? '#FFD700' : passed ? '#00FF94' : ACCENT }}>
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
          href={`https://twitter.com/intent/tweet?text=${tweet}&url=https://wenbrain.com?level=5`}
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

export default function Level5Page() {
  const navigate = useNavigate()
  const { completeLevel, submitToLeaderboard, playerName, totalXP } = useGameStore()
  const { play } = useSound()
  useLevelMeta(5)

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
        completeLevel(5, xp)
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
    `$40 billion gone in 48 hours.\n25 years in prison. HEEEY WHATS UP BITCONNECT.\n\nKnow the scams 👇\n@wenbrainbro\n\n#WenBrain #CryptoScams #NGMI`
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

      {/* Red danger glow */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 900,
        height: 900,
        background: 'radial-gradient(ellipse, rgba(255,51,102,0.06) 0%, transparent 65%)',
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
            <span style={{ fontSize: 40 }}>🤡</span>
            <div>
              <div className="font-mono text-xs mb-1" style={{ color: ACCENT }}>LEVEL 5 · BIGGEST SCAMS</div>
              <h1 className="font-syne font-black" style={{ fontSize: 'clamp(1.5rem, 5vw, 2.25rem)', color: 'var(--text-primary)', lineHeight: 1.1 }}>
                The Hall of Shame
              </h1>
            </div>
          </div>
          <p className="font-mono text-sm mb-4" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            FTX. Terra Luna. BitConnect. $40 billion gone in 48 hours. Know these names. Never forget them.
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
        <SectionConnector emoji="🤵" />

        <SectionCard>
          <SectionTag number="1" label="FTX: The Biggest Fraud in Crypto" />
          <h2 className="font-syne font-black text-2xl mb-5" style={{ color: 'var(--text-primary)' }}>
            The Golden Boy Who <span style={{ color: ACCENT }}>Stole $8 Billion</span>
          </h2>

          <p className="font-mono text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>Sam Bankman-Fried</strong> was crypto's golden boy.
            Forbes called him the next Warren Buffett. He donated millions to politicians. He preached
            "effective altruism" — doing good with money while making as much as possible.
            He wore cargo shorts and played video games during investor meetings. People loved it.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            {[
              { label: 'FTX Valuation',       value: '$32B',     color: '#FFD700' },
              { label: 'Celebrity endorsers', value: 'Tom Brady +', color: 'var(--text-primary)' },
              { label: 'Actual money',        value: '$0',       color: ACCENT },
            ].map((stat) => (
              <div key={stat.label} className="flex-1 p-4 rounded-xl text-center" style={{ background: 'var(--bg-secondary)', border: `1px solid ${stat.color}33` }}>
                <div className="font-syne font-black text-2xl" style={{ color: stat.color }}>{stat.value}</div>
                <div className="font-mono text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          <p className="font-mono text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
            In November 2022, CoinDesk revealed that FTX and Alameda Research (SBF's trading firm)
            shared the same balance sheet. FTX was using <strong style={{ color: ACCENT }}>customer funds to trade</strong>.
            $8 billion of customer money — gone.
          </p>

          <div className="flex flex-col gap-2 mb-5">
            {[
              'SBF fled to the Bahamas',
              'Got arrested at his penthouse',
              'Extradited to the US',
              'Tried. Convicted. 25 years in prison.',
              'His girlfriend ran Alameda Research',
              'Everyone in the inner circle got arrested',
            ].map((line, i) => (
              <div key={i} className="flex gap-3 font-mono text-sm" style={{ color: 'var(--text-secondary)' }}>
                <span style={{ color: ACCENT, flexShrink: 0 }}>→</span>
                {line}
              </div>
            ))}
          </div>

          <LevelImage src="./images/ftx_sbf.gif" alt="SBF FTX collapse" />

          <MemeQuote>"I am going to work" — SBF arriving at court in his cargo shorts</MemeQuote>

          <WarningBox>
            <p className="font-mono text-sm leading-relaxed" style={{ color: ACCENT }}>
              🚨 <strong>FTX had a $32 billion valuation. A celebrity endorsement from Tom Brady.
              An arena named after them in Miami. And zero actual money.</strong>
              <br /><br />
              Not financial advice. Just history.
            </p>
          </WarningBox>
        </SectionCard>

        {/* ══════════════════ SECTION 2 ══════════════════ */}
        <SectionConnector emoji="💥" />

        <SectionCard>
          <SectionTag number="2" label="Terra/Luna: $40 Billion in 48 Hours" />
          <h2 className="font-syne font-black text-2xl mb-1" style={{ color: 'var(--text-primary)' }}>
            The <span style={{ color: ACCENT }}>Death Spiral</span> That Erased a Country's GDP
          </h2>
          <div className="font-mono text-xs mb-5" style={{ color: 'var(--text-secondary)' }}>May 2022 — The worst 48 hours in crypto history</div>

          <p className="font-mono text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>Do Kwon</strong> created an algorithmic stablecoin called UST —
            supposed to always equal $1. Not backed by real dollars, but by math and LUNA.
            Everyone called it a Ponzi. Do Kwon called critics{' '}
            <strong style={{ color: ACCENT }}>"poor"</strong>.
          </p>

          <div className="rounded-xl p-5 mb-5" style={{ background: 'var(--bg-secondary)', border: `1px solid ${ACCENT}33` }}>
            <div className="font-syne font-bold text-sm mb-3" style={{ color: ACCENT }}>The Death Spiral — step by step:</div>
            <div className="flex flex-col gap-2">
              {[
                'UST loses its $1 peg',
                'Algorithm prints more LUNA to restore peg',
                'More LUNA supply = LUNA worth less',
                'Less LUNA value = UST falls further',
                'Algorithm prints even more LUNA',
                'Infinite loop. No bottom.',
              ].map((step, i) => (
                <div key={i} className="flex gap-3 font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <span className="font-bold flex-shrink-0" style={{ color: ACCENT }}>{i + 1}.</span>
                  {step}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            {[
              { label: 'LUNA peak price', value: '$119',         color: '#00FF94' },
              { label: 'LUNA after crash', value: '$0.000001',   color: ACCENT },
              { label: 'Total wiped',      value: '$40 billion', color: ACCENT },
              { label: 'Time taken',       value: '48 hours',    color: '#FFD700' },
            ].map((stat) => (
              <div key={stat.label} className="flex-1 p-3 rounded-xl text-center" style={{ background: 'var(--bg-secondary)', border: `1px solid ${stat.color}33` }}>
                <div className="font-syne font-black text-xl" style={{ color: stat.color }}>{stat.value}</div>
                <div className="font-mono text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          <LevelImage src="./images/luna_crash.gif" alt="Terra Luna death spiral chart" />

          <WarningBox>
            <p className="font-mono text-sm leading-relaxed" style={{ color: ACCENT }}>
              💀 <strong>LUNA went from $119 to $0.000001. That is not a typo.</strong>
              <br /><br />
              $40 billion disappeared in 2 days. Do Kwon called skeptics poor.
              Do Kwon is now in court.
            </p>
          </WarningBox>
        </SectionCard>

        {/* ══════════════════ SECTION 3 ══════════════════ */}
        <SectionConnector emoji="🎤" />

        <SectionCard>
          <SectionTag number="3" label="BitConnect: The Legend" />
          <h2 className="font-syne font-black text-2xl mb-5" style={{ color: 'var(--text-primary)' }}>
            HEEEY WHATS UP <span style={{ color: ACCENT }}>BITCONNEEEECT</span>
          </h2>

          <p className="font-mono text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
            BitConnect is the most iconic crypto scam ever. Carlos Matos took the stage at a conference,
            screamed <strong style={{ color: ACCENT }}>"HEEEY WHATS UP BITCONNEEECT"</strong> and became
            a meme forever. The clip has hundreds of millions of views. The man lost everything.
          </p>

          <div className="rounded-xl p-5 mb-5" style={{ background: 'var(--bg-secondary)', border: `1px solid ${ACCENT}33` }}>
            <div className="font-syne font-bold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>The pitch that should have been obvious:</div>
            <div className="flex flex-col gap-3">
              {[
                { claim: '40% monthly returns',        truth: 'That is 3,700% per year. No asset does this.' },
                { claim: 'A magic trading bot',        truth: 'Zero losing days. Ever. Guaranteed.' },
                { claim: 'Guaranteed profit',          truth: 'Nothing in investing is guaranteed. Ever.' },
              ].map((row, i) => (
                <div key={i} className="p-3 rounded-lg" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
                  <div className="font-syne font-bold text-sm mb-1" style={{ color: ACCENT }}>{row.claim}</div>
                  <div className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>{row.truth}</div>
                </div>
              ))}
            </div>
          </div>

          <p className="font-mono text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
            Classic Ponzi: new investor money paid old investors.
            January 2018: US regulators sent a cease-and-desist letter.
            BitConnect collapsed overnight. BCC went from <strong style={{ color: '#FFD700' }}>$430</strong> to{' '}
            <strong style={{ color: ACCENT }}>$0</strong> in hours.
          </p>

          <LevelImage src="./images/bitconnect.gif" alt="BitConnect conference meme" />

          <MemeQuote>"The most unhinged conference moment in history. And he lost everything."</MemeQuote>
        </SectionCard>

        {/* ══════════════════ SECTION 4 ══════════════════ */}
        <SectionConnector emoji="🎭" />

        <SectionCard>
          <SectionTag number="4" label="The Funny and Wild Ones" />
          <h2 className="font-syne font-black text-2xl mb-5" style={{ color: 'var(--text-primary)' }}>
            Too Good <span style={{ color: ACCENT }}>Not to Share</span>
          </h2>

          <div className="flex flex-col gap-4 mb-5">
            {[
              {
                emoji: '🦑',
                title: 'SQUID GAME TOKEN',
                body: 'Launched riding Netflix hype. Price went from $0.01 to $2,861 in days. Developers disabled selling — then sold everything. Price hit $0 in 5 minutes. They made $3.3M. Nobody ever found them.',
                color: '#E879F9',
              },
              {
                emoji: '🐦',
                title: 'HAWK TUAH GIRL',
                body: 'Haliey Welch went viral for a NSFW interview. Launched $HAWK in December 2024. $500M market cap in minutes. Insiders dumped immediately. -90% in hours. Went from meme queen to crypto villain overnight. She says she didn\'t know. Nobody believes her.',
                color: '#FFD700',
              },
              {
                emoji: '🎮',
                title: 'FROSTIES NFT',
                body: 'Cute ice cream NFT project. Raised $1.3M in one night. Next morning: website gone, Discord gone, Twitter gone, devs gone. Police arrested them. First NFT rug pull prosecution in US history.',
                color: '#00FFA3',
              },
              {
                emoji: '👦',
                title: 'THE PUMP.FUN KID',
                body: 'A teenager launched a memecoin on Pump.fun on a livestream. Made $30,000 in minutes. Cried on stream because he felt guilty. Then launched another one. This is crypto in 2024.',
                color: ACCENT,
              },
              {
                emoji: '💾',
                title: 'THE LANDFILL GUY',
                body: 'James Howells threw away a hard drive in 2013. It had 8,000 Bitcoin on it — worth $700M+ today. He has been trying to dig up a landfill in Newport, Wales for 10 years. The council keeps saying no. The Bitcoin sits there. Maybe.',
                color: '#F7931A',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
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

          <LevelImage src="./images/rug_pull.gif" alt="Rug pull meme" />
        </SectionCard>

        {/* ══════════════════ SECTION 5 ══════════════════ */}
        <SectionConnector emoji="🛡️" />

        <SectionCard>
          <SectionTag number="5" label="How to Not Get Scammed" />
          <h2 className="font-syne font-black text-2xl mb-5" style={{ color: 'var(--text-primary)' }}>
            Red Flags — <span style={{ color: ACCENT }}>Run If You See These</span>
          </h2>

          <div className="flex flex-col gap-2 mb-6">
            {[
              'Guaranteed returns — nothing is guaranteed',
              'Anonymous team with no track record',
              'No audit from a reputable firm',
              'Pressure to buy NOW before it is too late',
              'Celebrity endorsements (paid 99% of the time)',
              'Too-good-to-be-true APY (1,000% per year?)',
              'You can buy but not sell',
              'Whitepaper is copy-pasted or does not exist',
              'Team holds 50%+ of supply',
              'Contract not verified on blockchain explorer',
            ].map((flag, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                viewport={{ once: true }}
                className="flex gap-3 items-start p-3 rounded-lg font-mono text-sm"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
              >
                <span style={{ color: ACCENT, flexShrink: 0, fontWeight: 'bold' }}>🚩</span>
                {flag}
              </motion.div>
            ))}
          </div>

          <WarningBox>
            <p className="font-mono text-sm leading-relaxed" style={{ color: ACCENT }}>
              🔒 <strong>The best scam detector is this: if someone is promising you easy money,
              they are trying to take your money. Every time. No exceptions.</strong>
              <br /><br />
              Not financial advice.
            </p>
          </WarningBox>

          <LevelImage src="./images/ngmi.gif" alt="NGMI" />

          <MemeQuote>
            "Crypto has made more millionaires and more broke people than anything else.
            Know which one you want to be."
          </MemeQuote>
        </SectionCard>

        {/* ══════════════════ QUIZ ══════════════════ */}
        <SectionConnector emoji="🚨" />

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
          <div style={{ fontSize: 48, marginBottom: 12 }}>🤡</div>
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
            style={{ fontFamily: 'Syne, sans-serif', background: `linear-gradient(135deg, ${ACCENT}, #cc0033)` }}
          >
            Start Quiz 🤡
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
                    <span style={{ fontSize: 24 }}>🤡</span>
                    <h2 className="font-syne font-black text-xl" style={{ color: 'var(--text-primary)' }}>
                      Hall of Shame — Quiz
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
