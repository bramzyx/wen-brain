import { Link, useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/useGameStore'
import { useSound } from '../hooks/useSound'
import { startXLogin } from '../hooks/useXAuth'

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.213 5.567z" />
  </svg>
)

export default function Navbar() {
  const { totalXP, soundEnabled, toggleSound, xUser, logout } = useGameStore()
  const { play } = useSound()
  const navigate = useNavigate()

  const handleLogout = () => {
    play('click')
    localStorage.removeItem('xUser')
    localStorage.removeItem('wen-brain-save')
    logout()
    navigate('/')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-[#080B11]/85 backdrop-blur-md border-[#1a1a1a]">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between relative">
        
        {/* Left: Logo and Twitter Button */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Link to="/" className="flex items-center gap-1 no-underline">
            <span className="font-mono font-bold text-lg tracking-tighter text-white">WEN</span>
            <span className="font-mono font-bold text-lg tracking-tighter text-[#F7931A]">BRAIN</span>
          </Link>

          {/* Dark X Follow Button with Glitch */}
          <a 
            href="https://x.com/wenbrain" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-black text-white border border-[#333] px-2 py-1 sm:px-3 sm:py-1 rounded text-[10px] font-mono hover:bg-[#111] transition-all"
          >
            <XIcon />
            <span className="glitch-text" style={{ animationDelay: '0.5s' }}>Follow</span>
          </a>
        </div>

        {/* Middle: Clean Points Counter */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center">
          <span className="text-xs font-mono font-bold" style={{ color: 'var(--text-secondary)' }}>
            {totalXP || 0} <span style={{ color: '#F7931A' }}>PTS</span>
          </span>
        </div>

        {/* Right: Auth + Sound */}
        <div className="flex items-center gap-3">
          {xUser ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-2 py-1 rounded bg-[#111] border border-[#222]">
                <img src={xUser.avatarUrl} className="w-5 h-5 rounded-full" alt="avatar" />
                <span className="text-[10px] text-[#00FF94] font-mono">@{xUser.username}</span>
              </div>
              <button onClick={handleLogout} className="text-[10px] text-gray-500 hover:text-white font-mono">Sign out</button>
            </div>
          ) : (
            <button onClick={() => startXLogin()} className="bg-black text-white border border-[#333] px-3 py-1 rounded text-[10px] font-mono hover:bg-[#111]">
              Login
            </button>
          )}

          <button onClick={() => toggleSound()} className="p-1.5 rounded bg-[#111] text-xs">
            {soundEnabled ? '🔊' : '🔇'}
          </button>
        </div>
      </div>
    </nav>
  )
}