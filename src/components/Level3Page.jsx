import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/useGameStore'
import { useSound } from '../hooks/useSound'
import { useLevelMeta } from '../hooks/useLevelMeta'

const ACCENT = '#627EEA'

const QUIZ = [
  {
    q: 'How old was Vitalik when he wrote the Ethereum whitepaper?',
    options: ['17', '21', '19', '25'],
    correct: 2,
    fact: '19 years old. While most people his age were in their first year of university, Vitalik was redesigning the internet.',
  },
  {
    q: 'What is a smart contract?',
    options: [
      'A legal document stored on blockchain',
      'Self-executing code that runs automatically',
      'A type of Ethereum wallet',
      "The name of Ethereum's consensus mechanism",
    ],
    correct: 1,
    fact: 'Self-executing code — no middlemen, no banks, no lawyers. Just logic that runs exactly as written, forever, on thousands of computers simultaneously.',
  },
  {
    q: 'What happened after The DAO hack in 2016?',
    options: [
      'Ethereum shut down permanently',
      'Vitalik went to jail',
      'Ethereum split into ETH and ETC',
      'The hacker returned the money',
    ],
    correct: 2,
    fact: 'The community voted to reverse the blockchain to recover the $60M. "Code is law" purists disagreed and kept the original chain as Ethereum Classic (ETC). Two coins, one origin.',
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
        border: '1px solid rgba(98,126,234,0.18)',
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

function CalloutBox({ color = ACCENT, children }) {
  return (
    <div
      style={{
        background: `rgba(98,126,234,0.07)`,
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
        border: '1px solid rgba(98,126,234,0.19)',
        boxShadow: '0 0 24px rgba(98,126,234,0.12)',
        margin: '20px 0',
      }}
    />
  )
}

// ─── Confetti burst ───────────────────────────────────────────────────────────

const CONFETTI = Array.from({ length: 22 }, (_, i) => ({
  angle: (i / 22) * Math.PI * 2,
  dist: 50 + (i * 13) % 80,
  color: ['#627EEA', '#8fa3f5', '#00FF94', '#FFD700', '#FF3366', '#9945FF'][i % 6],
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
      <div className="text-7xl mb-5">{isWagmi ? '🏆' : passed ? '🎯' : '💀'}</div>
      <h2 className="font-syne font-black mb-2" style={{ fontSize: '4rem', color: isWagmi ? '#FFD700' : ACCENT }}>
        {score}/3
      </h2>
      <div className="font-syne font-bold text-2xl mb-2" style={{ color: isWagmi ? '#FFD700' : passed ? '#00FF94' : '#FF3366' }}>
        {isWagmi ? 'WAGMI SER 🚀' : passed ? 'Not bad, anon.' : 'ngmi... for now.'}
      </div>
      <div className="font-mono text-sm mb-1" style={{ color: '#00FF94' }}>
        +{xp} XP earned{isWagmi ? ' + 150 WAGMI bonus!' : ''}
      </div>
      <div className="font-mono text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
        Total XP: {totalXP.toLocaleString()}
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

export default function Level3Page() {
  const navigate = useNavigate()
  const { completeLevel, submitToLeaderboard, playerName, totalXP } = useGameStore()
  const { play } = useSound()
  useLevelMeta(3)

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
    const baseXP = correct ? 100 : 0
    const speedBonus = correct && timeLeft > 20 ? 50 : 0
    const newAnswers = [...answers, { correct, xp: baseXP + speedBonus }]
    setAnswers(newAnswers)

    if (currentQ + 1 >= shuffledQuiz.length) {
      const score = newAnswers.filter((a) => a.correct).length
      const xp = newAnswers.reduce((s, a) => s + a.xp, 0)
      setFinalScore(score)
      setEarnedXP(xp)
      if (score >= 2) {
        completeLevel(3, score, xp)
        submitToLeaderboard(playerName)
      }
      try { play('levelup') } catch (_) {}
      setQuizPhase('results')
    } else {
      setCurrentQ((c) => c + 1)
    }
  }

  const handleNext = () => navigate('/game')

  const handleRetry = () => {
    setAttempt((a) => a + 1)
    setShuffledQuiz(shuffleArray(QUIZ))
    setCurrentQ(0)
    setAnswers([])
    setQuizPhase('quiz')
  }

  const handleSkip = () => navigate('/game')

  const handleContinueAnyway = () => {
    completeLevel(3, 0, 0)
    submitToLeaderboard(playerName)
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
    `A 19 year old dropped out of university\nand built the world blockchain.\n\nLearn the full story 👇\n@wenbrainbro\n\n#WenBrain #Ethereum #WAGMI`
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

      {/* ETH blue glow */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 900,
        height: 900,
        background: 'radial-gradient(ellipse, rgba(98,126,234,0.05) 0%, transparent 65%)',
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
            <span style={{ fontSize: 40 }}>💙</span>
            <div>
              <div className="font-mono text-xs mb-1" style={{ color: ACCENT }}>LEVEL 3 · SMART CONTRACTS</div>
              <h1 className="font-syne font-black" style={{ fontSize: 'clamp(1.5rem, 5vw, 2.25rem)', color: 'var(--text-primary)', lineHeight: 1.1 }}>
                The Kid Who Built Ethereum
              </h1>
            </div>
          </div>
          <p className="font-mono text-sm mb-4" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            What if Bitcoin could run code? A teenager asked that question and changed everything.
          </p>
          <div className="flex gap-3 flex-wrap">
            {[['300 XP base', ACCENT], ['+150 perfect bonus', '#FFD700'], ['~6 min read', 'var(--text-secondary)']].map(([t, c]) => (
              <span key={t} className="font-mono text-xs px-3 py-1 rounded-full" style={{ background: `${c}18`, color: c, border: `1px solid ${c}33` }}>
                {t}
              </span>
            ))}
          </div>
        </motion.div>

        {/* ══════════════════ SECTION 1 ══════════════════ */}
        <SectionConnector emoji="🧒" />

        <SectionCard>
          <SectionTag number="1" label="A Teenager With a Big Idea" />
          <h2 className="font-syne font-black text-2xl mb-5" style={{ color: 'var(--text-primary)' }}>
            Born in Russia. Moved to Canada. <span style={{ color: ACCENT }}>Changed the World.</span>
          </h2>
          <p className="font-mono text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>Vitalik Buterin</strong> was born in Russia in 1994, moved
            to Canada at age 6. As a kid he was obsessed with math and computers — the kind of kid who memorised
            thousand-digit numbers for fun. At 17 he discovered Bitcoin and became completely obsessed.
          </p>
          <p className="font-mono text-sm leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
            He started writing for <em style={{ color: 'var(--text-primary)' }}>Bitcoin Magazine</em> as a teenager,
            earning Bitcoin for articles when it was worth almost nothing. Then, at 19, he had the thought:
          </p>
          <div className="rounded-xl p-5 mb-4" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <p className="font-mono text-sm italic leading-relaxed mb-2" style={{ color: 'var(--text-primary)' }}>
              "What if Bitcoin could run code?"
            </p>
            <p className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>— Vitalik Buterin, 2013</p>
          </div>
          <p className="font-mono text-sm leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
            In late 2013 he published the Ethereum whitepaper. He was accepted to University of Waterloo —
            one of the best CS programs in the world — and dropped out immediately after winning a{' '}
            <strong style={{ color: ACCENT }}>$100,000 Thiel Fellowship</strong> to build Ethereum instead.
          </p>
          <p className="font-mono text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Ethereum launched in July 2015. Within a few years it became a trillion-dollar network.
          </p>

          <LevelImage src="/images/vitalik_young.gif" alt="Vitalik Buterin young genius" />

          <MemeQuote>"While you were partying at university, Vitalik was building the internet of money."</MemeQuote>
        </SectionCard>

        {/* ══════════════════ SECTION 2 ══════════════════ */}
        <SectionConnector emoji="📜" />

        <SectionCard>
          <SectionTag number="2" label="Smart Contracts: Bitcoin But Smarter" />
          <h2 className="font-syne font-black text-2xl mb-5" style={{ color: 'var(--text-primary)' }}>
            Bitcoin Does One Thing. <span style={{ color: ACCENT }}>Ethereum Does Everything.</span>
          </h2>
          <p className="font-mono text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
            Bitcoin is great for one thing: sending value from A to B. But that's all it does.
            Vitalik wanted a blockchain that could run <strong style={{ color: 'var(--text-primary)' }}>programs</strong>.
            Enter: smart contracts.
          </p>

          <div className="rounded-xl p-5 mb-5" style={{ background: 'var(--bg-secondary)', border: `1px solid ${ACCENT}33` }}>
            <p className="font-mono text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
              Imagine a vending machine. You put money in, you get a snack out. No human needed.
              No trust needed. The machine just runs.
              <br /><br />
              Smart contracts are vending machines — but for anything: loans, trades, games, art, insurance, voting.
              No bank. No lawyer. No middleman. Just code that runs exactly as written.
            </p>
          </div>

          <div className="flex flex-col gap-4 mb-4">
            {[
              { icon: '🏦', title: 'DeFi — Decentralized Finance', body: 'Borrow, lend, and earn interest without a bank. Smart contracts replace the entire banking middleware.' },
              { icon: '🖼️', title: 'NFTs — Digital Ownership', body: 'Prove you own a digital item — art, game items, music — without any central authority. The contract is the proof.' },
              { icon: '🗳️', title: 'DAOs — Internet Organizations', body: 'Communities that make decisions via code and token votes. No CEO, no HR, no office. Just rules in a contract.' },
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
              🔒 <strong>Smart contracts cannot be changed once deployed.</strong>
              <br /><br />
              No CEO can shut them down. No government can freeze them. No hacker can alter them.
              They just run. Forever. On thousands of computers simultaneously.
            </p>
          </CalloutBox>

          <MemeQuote>01000101 01010100 01001000 = probably the future tbh</MemeQuote>
        </SectionCard>

        {/* ══════════════════ SECTION 3 ══════════════════ */}
        <SectionConnector emoji="💀" />

        <SectionCard>
          <SectionTag number="3" label="The DAO Hack — $60M Gone" />
          <h2 className="font-syne font-black text-2xl mb-1" style={{ color: 'var(--text-primary)' }}>
            The Hack That <span style={{ color: ACCENT }}>Split Ethereum in Two</span>
          </h2>
          <div className="font-mono text-xs mb-5" style={{ color: 'var(--text-secondary)' }}>June 2016 — The crypto world panics</div>

          <p className="font-mono text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
            In 2016 a project called <strong style={{ color: 'var(--text-primary)' }}>The DAO</strong> raised $150 million
            in ETH — the largest crowdfund in history at the time. It was a smart contract-based investment fund.
            Democratic. Transparent. Revolutionary.
          </p>
          <p className="font-mono text-sm leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
            Then a hacker found a bug in the smart contract and drained{' '}
            <strong style={{ color: '#FF3366' }}>$60 million worth of ETH</strong>. The entire crypto community watched
            in real time as the funds disappeared.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            {[
              { label: 'Option A', title: 'Code is Law', desc: 'The hack was valid. The contract ran as written. Tough luck.', color: '#FF3366' },
              { label: 'Option B', title: 'Reverse It', desc: 'Rewrite blockchain history. Return the funds. Protect the people.', color: '#00FF94' },
            ].map((opt) => (
              <div key={opt.label} className="flex-1 p-4 rounded-xl" style={{ background: 'var(--bg-secondary)', border: `1px solid ${opt.color}33`, borderLeft: `3px solid ${opt.color}` }}>
                <div className="font-mono text-xs mb-1" style={{ color: opt.color }}>{opt.label}</div>
                <div className="font-syne font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{opt.title}</div>
                <p className="font-mono text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{opt.desc}</p>
              </div>
            ))}
          </div>

          <p className="font-mono text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
            The community voted to reverse it. The blockchain was forked. Two chains were born:
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            {[
              { symbol: 'ETH', name: 'Ethereum', desc: 'Reversed the hack. Moved forward.', color: ACCENT },
              { symbol: 'ETC', name: 'Ethereum Classic', desc: 'Kept original chain. Code is law.', color: '#6B7280' },
            ].map((chain) => (
              <div key={chain.symbol} className="flex-1 p-4 rounded-xl text-center" style={{ background: 'var(--bg-secondary)', border: `1px solid ${chain.color}44` }}>
                <div className="font-syne font-black text-xl mb-1" style={{ color: chain.color }}>{chain.symbol}</div>
                <div className="font-syne font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{chain.name}</div>
                <p className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>{chain.desc}</p>
              </div>
            ))}
          </div>

          <LevelImage src="/images/dao_hack.gif" alt="The DAO hack 2016" />

          <MemeQuote>"The hack that created two Ethereums. Only in crypto, ser."</MemeQuote>
        </SectionCard>

        {/* ══════════════════ SECTION 4 ══════════════════ */}
        <SectionConnector emoji="⛽" />

        <SectionCard>
          <SectionTag number="4" label="Gas Fees: The Necessary Evil" />
          <h2 className="font-syne font-black text-2xl mb-5" style={{ color: 'var(--text-primary)' }}>
            Paying <span style={{ color: ACCENT }}>$500</span> to Make a $100 Trade
          </h2>
          <p className="font-mono text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
            Every action on Ethereum costs <strong style={{ color: ACCENT }}>gas</strong> — the fee you pay
            miners (now validators) to process your transaction. In good times, fees are pennies.
            In chaotic times, they become absurd.
          </p>

          <div className="flex flex-col gap-3 mb-5">
            {[
              { action: 'Sending ETH', fee: '$50', era: 'NFT craze 2021' },
              { action: 'Buying an NFT', fee: '$200', era: 'NFT craze 2021' },
              { action: 'Using a DeFi app', fee: '$500', era: 'DeFi summer 2020' },
            ].map((row, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="flex items-center justify-between p-4 rounded-xl"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
              >
                <div>
                  <div className="font-syne font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{row.action}</div>
                  <div className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>{row.era}</div>
                </div>
                <div className="font-syne font-black text-lg" style={{ color: '#FF3366' }}>{row.fee}</div>
              </motion.div>
            ))}
          </div>

          <p className="font-mono text-sm leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
            This is why <strong style={{ color: ACCENT }}>Layer 2s</strong> were invented — networks that sit on top
            of Ethereum and do the same thing 100x cheaper: Arbitrum, Base, Optimism.
          </p>

          <CalloutBox>
            <p className="font-mono text-sm leading-relaxed" style={{ color: ACCENT }}>
              ⛽ <strong>Gas fees are Ethereum's biggest problem — and its biggest proof of demand.</strong>
              <br /><br />
              Nobody pays $500 in fees for something nobody wants.
              The congestion IS the signal.
            </p>
          </CalloutBox>

          <MemeQuote>"Me trying to buy a $10 NFT but paying $300 in gas fees" 😭</MemeQuote>
        </SectionCard>

        {/* ══════════════════ SECTION 5 ══════════════════ */}
        <SectionConnector emoji="🌐" />

        <SectionCard>
          <SectionTag number="5" label="What Ethereum Became" />
          <h2 className="font-syne font-black text-2xl mb-5" style={{ color: 'var(--text-primary)' }}>
            The <span style={{ color: ACCENT }}>World Computer</span>
          </h2>
          <div className="flex flex-col gap-4 mb-5">
            {[
              { icon: '💰', title: 'DeFi', body: 'Decentralized Finance. $100B+ locked in smart contracts doing banking without banks. Lending, borrowing, earning yield — 24/7, permissionless.' },
              { icon: '🖼️', title: 'NFTs', body: 'Bored Apes. CryptoPunks. Billions traded. Digital ownership proved on-chain. Love them or hate them — they ran on Ethereum.' },
              { icon: '🏛️', title: 'DAOs', body: 'Internet communities with shared treasuries and on-chain voting. ConstitutionDAO raised $47M in days to buy the US Constitution. They lost. But still.' },
              { icon: '💵', title: 'Stablecoins', body: 'USDC and DAI — dollar-pegged tokens — run on Ethereum. Trillions in value move across the network every year.' },
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

          <div className="p-4 rounded-xl mb-4" style={{ background: `rgba(98,126,234,0.08)`, border: `1px solid ${ACCENT}33` }}>
            <div className="font-syne font-bold text-sm mb-1" style={{ color: ACCENT }}>The Merge — September 2022</div>
            <p className="font-mono text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Ethereum switched from energy-hungry proof-of-work mining to eco-friendly proof-of-stake overnight.
              Energy usage dropped by <strong style={{ color: ACCENT }}>99.9%</strong> in a single transaction.
              The largest infrastructure upgrade in blockchain history.
            </p>
          </div>

          <LevelImage src="/images/eth_ecosystem.gif" alt="Ethereum ecosystem growing" />

          <MemeQuote>"Vitalik built Ethereum at 19. What have you done today, ser?"</MemeQuote>
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
          <div style={{ fontSize: 48, marginBottom: 12 }}>💙</div>
          <h2 className="font-syne font-black text-2xl mb-2" style={{ color: 'var(--text-primary)' }}>Quiz Time</h2>
          <p className="font-mono text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            3 questions · 30 seconds each · Answer fast for speed bonus
          </p>
          <div className="flex justify-center gap-8 mb-8">
            {[['+100 XP', 'per correct', ACCENT], ['+50 XP', 'speed bonus', '#FFD700'], ['+150 XP', 'perfect score', '#00FF94']].map(([val, lbl, c]) => (
              <div key={lbl} className="text-center">
                <div className="font-syne font-bold text-xl" style={{ color: c }}>{val}</div>
                <div className="font-mono text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{lbl}</div>
              </div>
            ))}
          </div>
          <button type="button" onClick={startQuiz} className="btn-primary px-12 py-4 text-lg" style={{ fontFamily: 'Syne, sans-serif' }}>
            Start Quiz 💙
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
                    <span style={{ fontSize: 24 }}>💙</span>
                    <h2 className="font-syne font-black text-xl" style={{ color: 'var(--text-primary)' }}>
                      Smart Contracts — Quiz
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
