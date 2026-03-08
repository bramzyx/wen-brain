import { Link, useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/useGameStore'
import { useSound } from '../hooks/useSound'
import { startXLogin } from '../hooks/useXAuth'

const XIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
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
        {/* Logo */}
        <div className="flex items-center gap-4">
          <Link to="/" style={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700, letterSpacing: '0.06em', fontSize: '1.1rem', textDecoration: 'none' }}>
            <span style={{ color: 'var(--text-primary)' }}>WEN</span><span style={{ color: '#F7931A' }}>BRAIN</span>
          </Link>
        </div>

        {/* Points display */}
        <div className="hidden sm:block">
          <span className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
            🧠 Points: <span style={{ color: '#F7931A' }}>{totalXP}</span>
          </span>
        </div>

        {/* Right side: user + sound */}
        <div className="flex items-center gap-2">

          {/* X logged-in: avatar + @username + sign out */}
          {xUser && (
            <div className="hidden sm:flex items-center gap-2">
              <div className="flex items-center gap-2 px-2 py-1 rounded"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                {xUser.avatarUrl ? (
                  <img
                    src={xUser.avatarUrl}
                    alt={xUser.username}
                    className="w-6 h-6 rounded-full"
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                    style={{ background: '#1DA1F2', color: '#fff' }}>
                    {xUser.username[0].toUpperCase()}
                  </div>
                )}
                <span className="font-mono text-xs" style={{ color: '#00FF94' }}>
                  @{xUser.username}
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="font-mono text-xs px-2 py-1 rounded transition-opacity hover:opacity-70"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                title="Sign out"
              >
                Sign out
              </button>
            </div>
          )}

          {/* Visitor mode: show Login with X button */}
          {isVisitor && !xUser && (
            <button
              type="button"
              onClick={handleXLogin}
              className="hidden sm:flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 rounded transition-all hover:opacity-80"
              style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
            >
              <XIcon />
              Login with X
            </button>
          )}

          {/* Visitor sign out (exit visitor mode) */}
          {isVisitor && !xUser && (
            <button
              type="button"
              onClick={handleLogout}
              className="hidden sm:block font-mono text-xs px-2 py-1 rounded transition-opacity hover:opacity-70"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
              title="Exit visitor mode"
            >
              Exit
            </button>
          )}

          {/* Sound toggle */}
          <button
            type="button"
            onClick={() => { play('click'); toggleSound() }}
            className="w-8 h-8 rounded flex items-center justify-center text-sm transition-colors"
            style={{ background: 'var(--bg-card)', color: soundEnabled ? '#F7931A' : 'var(--text-secondary)' }}
            title={soundEnabled ? 'Sound ON' : 'Sound OFF'}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
        </div>
      </div>
    </nav>
  )
}
