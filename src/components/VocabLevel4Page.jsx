import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/useGameStore'
import { useSound } from '../hooks/useSound'

const ACCENT = '#627EEA'
const VOL = 4
const EMOJI = '⚙️'
const TITLE = 'Technical Terms'
const SUBTITLE = 'CA, Gas, Seed Phrase, Wallet, Bridge — the mechanics every anon must understand.'
const GIF = '/images/seed_tehnical.gif'
const NEXT_ROUTE = '/vocab/5'

const TERMS = [
  { word: 'CA', meaning: 'Contract Address — the unique on-chain ID of a token. Always verify before buying.', tweet: '"Drop the CA fren. Need to verify it before aping in."', color: '#627EEA' },
  { word: 'GAS', meaning: 'The fee paid to process a transaction on the blockchain. Can be more than the actual swap.', tweet: '"Gas fee: $4.20. My swap: $3. This is fine. Ethereum is fine."', color: '#FFD700' },
  { word: 'SEED PHRASE', meaning: '12-24 words that give complete access to your wallet. Never share. Never screenshot. Write on paper.', tweet: '"DM me your seed phrase for a free airdrop 👀" — every scammer ever.', color: '#FF3366' },
  { word: 'WALLET', meaning: "Stores your private keys — not your actual coins. Not your keys, not your coins.", tweet: '"Not your keys, not your coins. Hardware wallet activated."', color: '#00FF94' },
  { word: 'BRIDGE', meaning: 'Connects two blockchains to transfer assets between them. Also a top target for hackers.', tweet: '"Bridging ETH to Solana. Taking a nap while it confirms. Pray for me."', color: '#9945FF' },
]

const QUIZ = [
  { term: 'CA', q: 'In crypto, "CA" stands for:', options: ['Crypto Analyst', 'Contract Address — the on-chain ID of a token', 'Centralized Authority', 'Capital Allocation'], correct: 1, fact: 'Drop the CA in the group chat and watch everyone ape in. Always verify the CA before buying.' },
  { term: 'GAS', q: 'What is "gas" in blockchain terms?', options: ['Energy used to mine Bitcoin', 'The fee paid to process a transaction on-chain', 'A privacy layer on Ethereum', 'A type of stablecoin'], correct: 1, fact: 'Gas fees on Ethereum can cost more than your actual transaction. Peak blockchain UX.' },
  { term: 'SEED PHRASE', q: 'What is a seed phrase?', options: ['A password for a crypto exchange', '12-24 words that control access to your wallet forever', 'A smart contract initialization code', 'A DeFi yield farming term'], correct: 1, fact: 'Lose your seed phrase = lose everything. Screenshot it = get hacked. Write it on paper. Store it offline.' },
  { term: 'WALLET', q: 'A crypto wallet actually stores:', options: ['Your crypto coins', 'Private keys that prove you own crypto on the blockchain', 'A password to the exchange', 'NFT image files'], correct: 1, fact: "Your wallet doesn't store crypto — it stores the keys to prove ownership on the blockchain. Not your keys, not your coins." },
  { term: 'BRIDGE', q: 'What does a blockchain bridge do?', options: ['Connects two different blockchains to transfer assets', 'Speeds up Bitcoin transactions', 'A way to stake ETH for rewards', 'A type of hardware wallet'], correct: 0, fact: 'Bridges let you move assets between chains (ETH to Solana, etc). Also a top target for hackers.' },
]

function ConfettiBurst() {
  const colors = ['#627EEA', '#FFD700', '#00FF94', '#FF3366', '#9945FF', '#F7931A']
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999, overflow: 'hidden' }}>
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: -20, x: `${Math.random() * 100}vw`, opacity: 1 }}
          animate={{ y: '110vh', opacity: 0, rotate: Math.random() * 720 }}
          transition={{ duration: Math.random() * 1.5 + 1, ease: 'easeIn', delay: Math.random() * 0.4 }}
          style={{ position: 'absolute', width: 10, height: 10, borderRadius: Math.random() > 0.5 ? '50%' : 2, background: colors[Math.floor(Math.random() * colors.length)] }}
        />
      ))}
    </div>
  )
}

function QuizQuestion({ q, qIndex, total, onPick }) {
  const [picked, setPicked] = useState(null)
  const [timeLeft, setTimeLeft] = useState(30)
  const timerRef = useRef(null)
  const submitted = useRef(false)

  useEffect(() => {
    submitted.current = false
    setPicked(null)
    setTimeLeft(30)
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          if (!submitted.current) { submitted.current = true; onPick(-1) }
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [qIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  const handlePick = (idx) => {
    if (picked !== null || submitted.current) return
    clearInterval(timerRef.current)
    submitted.current = true
    setPicked(idx)
    onPick(idx)
  }

  const isCorrect = picked !== null && picked === q.correct
  const timerPct = (timeLeft / 30) * 100

  return (
    <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.25 }}>
      <div className="flex gap-2 mb-5">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < qIndex ? ACCENT : i === qIndex ? `${ACCENT}88` : 'rgba(255,255,255,0.1)' }} />
        ))}
      </div>
      <div className="mb-4">
        <div className="flex justify-between font-mono text-xs mb-1" style={{ color: timeLeft <= 10 ? '#FF3366' : 'rgba(255,255,255,0.5)' }}>
          <span>TERM: {q.term}</span>
          <span style={{ color: timeLeft <= 10 ? '#FF3366' : ACCENT }}>{timeLeft}s</span>
        </div>
        <div style={{ height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
          <div style={{ height: '100%', borderRadius: 2, background: timeLeft <= 10 ? '#FF3366' : ACCENT, width: `${timerPct}%`, transition: 'width 1s linear, background 0.3s' }} />
        </div>
      </div>
      <h3 className="font-syne font-bold text-xl mb-6" style={{ color: '#fff', lineHeight: 1.4 }}>{q.q}</h3>
      <div className="flex flex-col gap-3 mb-4">
        {q.options.map((opt, i) => {
          let border = '1px solid rgba(255,255,255,0.15)', bg = 'rgba(255,255,255,0.05)', col = 'rgba(255,255,255,0.85)'
          if (picked !== null) {
            if (i === q.correct) { border = '1px solid #00FF94'; bg = 'rgba(0,255,148,0.1)'; col = '#00FF94' }
            else if (i === picked) { border = '1px solid #FF3366'; bg = 'rgba(255,51,102,0.15)'; col = '#FF3366' }
          }
          return (
            <motion.button key={i} type="button" onClick={() => handlePick(i)} disabled={picked !== null} whileHover={picked === null ? { scale: 1.01 } : {}} className="w-full p-4 rounded-xl font-mono text-sm text-left" style={{ background: bg, border, color: col, cursor: picked !== null ? 'default' : 'pointer' }}>
              <span className="font-bold mr-3" style={{ color: ACCENT }}>{['A', 'B', 'C', 'D'][i]}.</span>{opt}
            </motion.button>
          )
        })}
      </div>
      <AnimatePresence>
        {picked !== null && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl p-4" style={{ background: isCorrect ? 'rgba(0,255,148,0.08)' : 'rgba(255,51,102,0.08)', border: `1px solid ${isCorrect ? '#00FF9433' : '#FF336633'}`, borderLeft: `4px solid ${isCorrect ? '#00FF94' : '#FF3366'}` }}>
            <div className="font-syne font-bold text-sm mb-1" style={{ color: isCorrect ? '#00FF94' : '#FF3366' }}>{isCorrect ? '🎯 WAGMI! Correct ser.' : '💀 ngmi moment.'}</div>
            <p className="font-mono text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>{q.fact}</p>
          </motion.div>
        )}
        {picked === null && timeLeft === 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl p-4" style={{ background: 'rgba(255,51,102,0.08)', border: '1px solid #FF336633', borderLeft: '4px solid #FF3366' }}>
            <div className="font-syne font-bold text-sm" style={{ color: '#FF3366' }}>⏰ Time's up! ngmi moment.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function QuizResults({ score, earnedPts, onRetry, onNext, isLast }) {
  const navigate = useNavigate()
  const perfect = score === 5
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', damping: 16 }} className="text-center py-8">
      <div className="text-7xl mb-4">{perfect ? '🏆' : score >= 3 ? '🎯' : '💀'}</div>
      <h2 className="font-syne font-black mb-2" style={{ fontSize: '4rem', color: perfect ? '#FFD700' : ACCENT }}>{score}/5</h2>
      <div className="font-syne font-bold text-xl mb-2" style={{ color: perfect ? '#FFD700' : score >= 3 ? ACCENT : '#FF3366' }}>
        {perfect ? 'WAGMI SER 🚀 Perfect score!' : score >= 3 ? 'Not bad, anon.' : 'ngmi... for now.'}
      </div>
      <div className="font-mono text-sm mb-8" style={{ color: ACCENT }}>+{earnedPts} PTS earned</div>
      <div className="flex flex-col gap-3 items-center">
        {isLast ? (
          <button type="button" onClick={() => navigate('/game')} className="btn-primary px-8 py-3 w-full sm:w-auto" style={{ background: `linear-gradient(135deg,${ACCENT},${ACCENT}bb)`, color: '#fff', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>Back to Journey Map 🗺️</button>
        ) : (
          <button type="button" onClick={onNext} className="btn-primary px-8 py-3 w-full sm:w-auto" style={{ background: `linear-gradient(135deg,${ACCENT},${ACCENT}bb)`, color: '#fff', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>Next Vocab Level 📚</button>
        )}
        <button type="button" onClick={onRetry} className="btn-primary px-8 py-3 w-full sm:w-auto" style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)' }}>Retry 🔄</button>
        {!isLast && <button type="button" onClick={() => navigate('/game')} className="font-mono text-xs" style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}>← Back to Journey</button>}
      </div>
    </motion.div>
  )
}

export default function VocabLevel4Page() {
  const navigate = useNavigate()
  const { play } = useSound()
  const { addXP, isVisitor } = useGameStore()

  useEffect(() => {
    if (!localStorage.getItem('xUser') && !isVisitor) navigate('/')
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const [phase, setPhase] = useState('learn')
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState([])
  const [finalScore, setFinalScore] = useState(0)
  const [earnedPts, setEarnedPts] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)

  const handlePick = (idx) => {
    const q = QUIZ[currentQ]
    const correct = idx !== -1 && idx === q.correct
    if (correct) {
      try { play('correct') } catch (_) {}
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 2000)
    } else {
      try { play('wrong') } catch (_) {}
    }
    const newAnswers = [...answers, { correct }]
    setTimeout(() => {
      setAnswers(newAnswers)
      if (currentQ + 1 >= QUIZ.length) {
        const score = newAnswers.filter((a) => a.correct).length
        const pts = score + (score === 5 ? 1 : 0)
        setFinalScore(score)
        setEarnedPts(pts)
        addXP(pts)
        try { play('levelup') } catch (_) {}
        setPhase('results')
      } else {
        setCurrentQ((c) => c + 1)
      }
    }, 1200)
  }

  const handleRetry = () => {
    setPhase('learn')
    setCurrentQ(0)
    setAnswers([])
    setShowConfetti(false)
  }

  return (
    <div style={{ paddingTop: '84px', background: 'var(--bg-primary)', minHeight: '100vh' }}>
      {showConfetti && <ConfettiBurst />}
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 20px 64px' }}>
        <button type="button" onClick={() => navigate('/game')} className="font-mono text-xs mb-8 flex items-center gap-1 transition-opacity hover:opacity-70" style={{ color: 'var(--text-secondary)' }}>← back to levels</button>

        <div style={{ background: 'var(--bg-card)', border: `1px solid ${ACCENT}44`, borderLeft: `4px solid ${ACCENT}`, borderRadius: 12, padding: 32, marginBottom: 32 }}>
          <div className="flex items-center gap-4 mb-3">
            <span style={{ fontSize: 36 }}>{EMOJI}</span>
            <div>
              <div className="font-mono text-xs mb-1" style={{ color: ACCENT }}>VOCAB · VOL. {VOL}</div>
              <h1 className="font-syne font-black text-2xl" style={{ color: 'var(--text-primary)' }}>{TITLE}</h1>
            </div>
          </div>
          <p className="font-mono text-sm" style={{ color: 'var(--text-secondary)' }}>{SUBTITLE}</p>
          <div className="flex gap-3 flex-wrap mt-4">
            {[['+1 PT', 'per correct', ACCENT], ['+1 PT', 'perfect bonus', '#FFD700'], ['5 questions', '', 'var(--text-secondary)']].map(([val, lbl, c]) => (
              <span key={val + lbl} className="font-mono text-xs px-3 py-1 rounded-full" style={{ background: `${c}18`, color: c, border: `1px solid ${c}33` }}>
                {val}{lbl ? ` ${lbl}` : ''}
              </span>
            ))}
          </div>
        </div>

        {phase === 'learn' && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            {GIF && (
              <div className="mb-6 rounded-xl overflow-hidden" style={{ border: `1px solid ${ACCENT}33` }}>
                <img src={GIF} alt="vocab visual" style={{ width: '100%', maxHeight: 220, objectFit: 'cover', display: 'block' }} />
              </div>
            )}
            <div className="flex flex-col gap-3 mb-8">
              {TERMS.map((t) => (
                <motion.div key={t.word} whileHover={{ scale: 1.01 }} style={{ background: 'var(--bg-card)', border: `1px solid ${t.color}33`, borderLeft: `4px solid ${t.color}`, borderRadius: 10, padding: '16px 20px' }}>
                  <div className="font-syne font-black text-lg mb-1" style={{ color: t.color }}>{t.word}</div>
                  <div className="font-mono text-sm mb-2" style={{ color: 'var(--text-primary)' }}>{t.meaning}</div>
                  <div className="font-mono text-xs italic" style={{ color: 'var(--text-secondary)' }}>{t.tweet}</div>
                </motion.div>
              ))}
            </div>
            <motion.button type="button" onClick={() => setPhase('quiz')} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-primary w-full text-lg py-4" style={{ background: `linear-gradient(135deg,${ACCENT},${ACCENT}bb)`, color: '#fff', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
              Start Quiz 🎯
            </motion.button>
          </motion.div>
        )}

        <AnimatePresence>
          {phase === 'quiz' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: '#080B11', zIndex: 100, overflowY: 'auto' }}>
              <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 20px 60px' }}>
                <div className="flex items-center justify-between mb-8">
                  <div className="font-mono text-xs" style={{ color: ACCENT }}>VOCAB · VOL. {VOL} · QUIZ</div>
                  <div className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{currentQ + 1} / {QUIZ.length}</div>
                </div>
                <AnimatePresence mode="wait">
                  <QuizQuestion key={currentQ} q={QUIZ[currentQ]} qIndex={currentQ} total={QUIZ.length} onPick={handlePick} />
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {phase === 'results' && (
          <div style={{ background: 'var(--bg-card)', border: `1px solid ${ACCENT}33`, borderRadius: 12, padding: 32 }}>
            <QuizResults score={finalScore} earnedPts={earnedPts} onRetry={handleRetry} onNext={() => navigate(NEXT_ROUTE)} isLast={false} />
          </div>
        )}
      </div>
    </div>
  )
}
