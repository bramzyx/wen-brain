import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/useGameStore'
import { useSound } from '../hooks/useSound'

const ACCENT = '#00FF94'

const QUIZ = [
  {
    term: 'DEGEN',
    q: 'What does "degen" mean in crypto culture?',
    options: ['A developer on Ethereum', 'A degenerate gambler — high risk, high reward trader', 'A decentralized exchange governance token', 'A type of NFT collection'],
    correct: 1,
    fact: 'Degen is worn as a badge of honor. Aping into 100x plays with rent money? Full degen.',
  },
  {
    term: 'APE IN',
    q: 'To "ape in" to a crypto project means...',
    options: ['To research it thoroughly for 6 months', 'To buy heavily without doing much research', 'To short sell the token', 'To stake it in a liquidity pool'],
    correct: 1,
    fact: 'You see a Telegram post, buy $10k, and ask questions later. That\'s aping in. NGMI behavior or 100x play.',
  },
  {
    term: 'WAGMI',
    q: 'WAGMI stands for:',
    options: ['We All Gonna Make It', 'Wallet Address Global Market Index', 'Web3 Asset Growth Management Initiative', 'Wrapped Asset General Market Index'],
    correct: 0,
    fact: 'The crypto community\'s battle cry of collective optimism. Bear market? WAGMI. Rug pulled? WAGMI.',
  },
  {
    term: 'NGMI',
    q: 'NGMI means:',
    options: ['Not Gonna Make It — you made a bad decision', 'Next Generation Market Index', 'Non-Governance Market Infrastructure', 'New Global Mining Initiative'],
    correct: 0,
    fact: 'Selling your Bitcoin at $100? NGMI. Buying the top of a rug pull? Absolute NGMI.',
  },
  {
    term: 'GM',
    q: 'Why do crypto people say "GM" to each other constantly?',
    options: ['It\'s a formal greeting required by DAO rules', 'Good Morning — a community ritual of positivity and solidarity', 'General Message — a chat protocol term', 'It stands for Gas Minimum'],
    correct: 1,
    fact: 'GM is the crypto world\'s handshake. Reply GM to a GM. It\'s the law of the blockchain.',
  },
]

function VocabResults({ score, earnedPts, onRetry, onNext }) {
  const navigate = useNavigate()
  const perfect = score === 5
  return (
    <motion.div initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', damping: 18 }} className="text-center py-6">
      <div className="text-7xl mb-5">{perfect ? '🏆' : score >= 3 ? '🎯' : '💀'}</div>
      <h2 className="font-syne font-black mb-2" style={{ fontSize: '4rem', color: perfect ? '#FFD700' : ACCENT }}>{score}/5</h2>
      <div className="font-syne font-bold text-2xl mb-2" style={{ color: perfect ? '#FFD700' : score >= 3 ? ACCENT : '#FF3366' }}>
        {perfect ? 'WAGMI SER 🚀' : score >= 3 ? 'Not bad, anon.' : 'ngmi... for now.'}
      </div>
      <div className="font-mono text-sm mb-6" style={{ color: ACCENT }}>+{earnedPts} PTS earned</div>
      <div className="flex flex-col gap-3 items-center">
        <button type="button" onClick={onNext} className="btn-primary px-8 py-3 w-full sm:w-auto" style={{ background: 'linear-gradient(135deg,#00FF94,#00cc77)', color: '#000', fontFamily: 'Syne, sans-serif' }}>Next Vocab Level 📚</button>
        <button type="button" onClick={onRetry} className="btn-primary px-8 py-3 w-full sm:w-auto" style={{ background: 'none', border: '1px solid var(--border)', fontFamily: 'Syne, sans-serif' }}>Retry 🔄</button>
        <button type="button" onClick={() => navigate('/game')} className="font-mono text-xs" style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}>← Back to Journey</button>
      </div>
    </motion.div>
  )
}

export default function VocabLevel3Page() {
  const navigate = useNavigate()
  const { play } = useSound()
  const { addXP } = useGameStore()

  const [phase, setPhase] = useState('quiz')
  const [currentQ, setCurrentQ] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answers, setAnswers] = useState([])
  const [finalScore, setFinalScore] = useState(0)
  const [earnedPts, setEarnedPts] = useState(0)

  const q = QUIZ[currentQ]

  const handlePick = (idx) => {
    if (selected !== null) return
    try { play('click') } catch (_) {}
    setSelected(idx)
    try { play(idx === q.correct ? 'correct' : 'wrong') } catch (_) {}
  }

  const handleNext = () => {
    const correct = selected === q.correct
    const newAnswers = [...answers, { correct }]
    setAnswers(newAnswers)
    setSelected(null)
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
  }

  const handleRetry = () => { setPhase('quiz'); setCurrentQ(0); setSelected(null); setAnswers([]) }
  const isCorrect = selected !== null && selected === q.correct

  return (
    <div style={{ paddingTop: '84px', background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 20px 64px' }}>
        <button type="button" onClick={() => navigate('/game')} className="font-mono text-xs mb-8 flex items-center gap-1 transition-opacity hover:opacity-70" style={{ color: 'var(--text-secondary)' }}>← back to levels</button>

        <div style={{ background: 'var(--bg-card)', border: `1px solid ${ACCENT}44`, borderLeft: `4px solid ${ACCENT}`, borderRadius: 12, padding: 32, marginBottom: 32 }}>
          <div className="flex items-center gap-4 mb-3">
            <span style={{ fontSize: 36 }}>🐸</span>
            <div>
              <div className="font-mono text-xs mb-1" style={{ color: ACCENT }}>VOCAB · VOL. 3</div>
              <h1 className="font-syne font-black text-2xl" style={{ color: 'var(--text-primary)' }}>Community Slang</h1>
            </div>
          </div>
          <p className="font-mono text-sm" style={{ color: 'var(--text-secondary)' }}>Degen, Ape in, Wagmi, Ngmi, Gm — the language of crypto Twitter.</p>
        </div>

        <AnimatePresence mode="wait">
          {phase === 'quiz' ? (
            <motion.div key={currentQ} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.25 }} style={{ background: 'var(--bg-card)', border: `1px solid ${ACCENT}33`, borderRadius: 12, padding: 32 }}>
              <div className="flex gap-2 mb-6">
                {QUIZ.map((_, i) => (<div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < currentQ ? ACCENT : i === currentQ ? `${ACCENT}88` : 'var(--border)' }} />))}
              </div>
              <div className="font-mono text-xs mb-2" style={{ color: ACCENT }}>TERM: {q.term}</div>
              <h3 className="font-syne font-bold text-xl mb-6" style={{ color: 'var(--text-primary)', lineHeight: 1.4 }}>{q.q}</h3>
              <div className="flex flex-col gap-3 mb-5">
                {q.options.map((opt, i) => {
                  let border = '1px solid var(--border)', bg = 'var(--bg-secondary)', col = 'var(--text-primary)'
                  if (selected !== null) {
                    if (i === q.correct) { border = '1px solid #00FF94'; bg = 'rgba(0,255,148,0.10)'; col = '#00FF94' }
                    else if (i === selected) { border = '1px solid #FF3366'; bg = 'rgba(255,51,102,0.10)'; col = '#FF3366' }
                  }
                  return (
                    <motion.button key={i} type="button" onClick={() => handlePick(i)} disabled={selected !== null} whileHover={selected === null ? { scale: 1.01 } : {}} className="w-full p-4 rounded-xl font-mono text-sm text-left" style={{ background: bg, border, color: col, cursor: selected !== null ? 'default' : 'pointer' }}>
                      <span className="font-bold mr-3" style={{ color: ACCENT }}>{['A','B','C','D'][i]}.</span>{opt}
                    </motion.button>
                  )
                })}
              </div>
              <AnimatePresence>
                {selected !== null && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl p-4 mb-4" style={{ background: isCorrect ? 'rgba(0,255,148,0.07)' : 'rgba(255,51,102,0.07)', border: `1px solid ${isCorrect ? '#00FF9433' : '#FF336633'}`, borderLeft: `4px solid ${isCorrect ? '#00FF94' : '#FF3366'}` }}>
                    <div className="font-syne font-bold text-sm mb-1" style={{ color: isCorrect ? '#00FF94' : '#FF3366' }}>{isCorrect ? '🎯 WAGMI! Correct ser.' : '💀 ngmi moment.'}</div>
                    <p className="font-mono text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{q.fact}</p>
                  </motion.div>
                )}
              </AnimatePresence>
              {selected !== null && (
                <motion.button type="button" onClick={handleNext} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="btn-primary w-full text-base" style={{ fontFamily: 'Syne, sans-serif' }}>
                  {currentQ + 1 >= QUIZ.length ? 'See My Score 🏆' : 'Next Question →'}
                </motion.button>
              )}
            </motion.div>
          ) : (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: 'var(--bg-card)', border: `1px solid ${ACCENT}33`, borderRadius: 12, padding: 32 }}>
              <VocabResults score={finalScore} earnedPts={earnedPts} onRetry={handleRetry} onNext={() => navigate('/vocab/4')} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
