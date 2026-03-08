import { Link, useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/useGameStore'
import { useSound } from '../hooks/useSound'
import { startXLogin } from '../hooks/useXAuth'

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.213 5.567z" />
  </svg>
)

export default function Navbar() {
  const { totalXP, soundEnabled, toggleSound, xUser, isVisitor, logout } = useGameStore()
  const { play } = useSound()
  const navigate = useNavigate()

  const handleLogout = () => {
    play('click')
    try {
      localStorage.removeItem('xUser')
      localStorage.removeItem('wen-brain-save')
    } catch {}
    logout()
    sessionStorage.setItem('showLoginModal', '1')
    navigate('/')
  }

  const handleXLogin = async () => {
    play('click')
    try { await startXLogin() } catch (_) {}
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b"
      style={{ background: 'rgba(8,11,17,0.85)', backdropFilter: 'blur(12px)', borderColor: 'var(--border)' }}>
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        
        {/* Left Side: Logo */}
        <div className="flex items-center gap-4">
          <Link to="/" style={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700, letterSpacing: '0.06em', fontSize: '1.1rem', textDecoration: 'none' }}>
            <span style={{ color: 'var(--text-primary)' }}>WEN</span><span style={{ color: '#F7931A' }}>BRAIN</span>
          </Link>
        </div>

        {/* Middle: Points (Now visible on all screens) */}
        <div className="flex items-center">
          <span className="font-mono text-xs font-bold" style={{ color: '#F7931A' }}>
            🧠 {totalXP} <span className="text-[10px] text-gray-500 ml-1">PTS</span>
          </span>
        </div>

        {/* Right Side: Social + User + Sound */}
        <div className="flex items-center gap-3">
          
          {/* ALWAYS SHOW X FOLLOW BUTTON */}
          <a 
            href="https://x.com/wenbrain" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-white text-black px-3 py-1 rounded-full text-[10px] font-bold hover:bg-gray-200 transition-colors"
          >
            <XIcon />
            <span>Follow</span>
          </a>

          {/* User Auth Section */}
          {xUser ? (
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2 px-2 py-1 rounded border border-[#333] bg-[#111]">
                {xUser.avatarUrl ? (
                  <img src={xUser.avatarUrl} alt={xUser.username} className="w-5 h-5 rounded-full" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-[#1DA1F2] flex items-center justify-center text-[10px]">
                    {xUser.username[0].toUpperCase()}
                  </div>
                )}
                <span className="font-mono text-[10px] text-[#00FF94]">@{xUser.username}</span>
              </div>
              <button onClick={handleLogout} className="text-[10px] text-gray-500 hover:text-white transition-colors">
                Exit
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleXLogin}
              className="font-mono text-[10px] px-3 py-1 rounded border border-[#333] bg-black text-white hover:bg-[#111]"
            >
              Login
            </button>
          )}

          {/* Sound toggle */}
          <button
            type="button"
            onClick={() => { play('click'); toggleSound() }}
            className="w-7 h-7 rounded flex items-center justify-center text-xs transition-colors bg-[#111]"
            style={{ color: soundEnabled ? '#F7931A' : '#444' }}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
        </div>
      </div>
    </nav>
  )
}