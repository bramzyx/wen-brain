import { useState } from 'react'

const WALLETS = [
  {
    chain: 'BTC',
    label: 'Bitcoin',
    color: '#F7931A',
    address: 'bc1q3p4s2lymnlrv2ss8ycgfa2vpnxjhen6r0rulha',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 24, height: 24 }}>
        <circle cx="16" cy="16" r="15" fill="#F7931A" />
        <path d="M21.5 13.5c.3-2-1.2-3-3.3-3.7l.7-2.7-1.6-.4-.7 2.6-.5-.1.7-2.6-1.6-.4-.7 2.7-3.3-.8-.4 1.7s1.2.3 1.1.3c.6.1.7.5.7.8l-.8 3.2h.2l-1.1 4.4c-.1.2-.3.5-.8.4l-1.1-.3-.8 1.8 3.1.8.6.1-.7 2.7 1.6.4.7-2.7.5.1-.7 2.7 1.6.4.7-2.8c2.9.6 5-.2 5.9-2.8.7-2.1-.1-3.3-1.5-4 1.1-.3 1.9-1 2.1-2.5zm-3.7 5.2c-.5 2-3.9 1-5 .7l.9-3.5c1.1.3 4.6.8 4.1 2.8zm.5-5.2c-.5 1.8-3.3 1-4.2.7l.8-3.2c.9.2 3.9.6 3.4 2.5z" fill="white" />
      </svg>
    ),
  },
  {
    chain: 'ETH',
    label: 'Ethereum',
    color: '#627EEA',
    address: '0xF05B5e87b6989E461eFe995986856c39586dfFE5',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 24, height: 24 }}>
        <circle cx="16" cy="16" r="15" fill="#1a1a2e" />
        <polygon points="16,4 24,16.5 16,20 8,16.5" fill="#627EEA" opacity="0.9" />
        <polygon points="16,20 24,16.5 16,28" fill="#627EEA" />
        <polygon points="16,20 8,16.5 16,28" fill="#8fa3f5" />
        <polygon points="16,4 8,16.5 16,13.5" fill="#8fa3f5" opacity="0.8" />
      </svg>
    ),
  },
  {
    chain: 'SOL',
    label: 'Solana',
    color: '#9945FF',
    address: 'XRJZnHXKohJrS9rpF981UdC8CCoQqBB1TstPAdYx4Ms',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 24, height: 24 }}>
        <circle cx="16" cy="16" r="15" fill="#1a0533" />
        <defs>
          <linearGradient id="sol-footer-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#9945FF" />
            <stop offset="100%" stopColor="#00FFA3" />
          </linearGradient>
        </defs>
        <rect x="6" y="9" width="20" height="3" rx="1.5" fill="url(#sol-footer-grad)" />
        <rect x="6" y="14.5" width="20" height="3" rx="1.5" fill="url(#sol-footer-grad)" />
        <rect x="6" y="20" width="20" height="3" rx="1.5" fill="url(#sol-footer-grad)" />
      </svg>
    ),
  },
]

function WalletCard({ chain, label, color, address, icon }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!address) return
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (_) {}
  }

  return (
    <div
      className="flex-1 rounded-xl border"
      style={{
        background: 'var(--bg-card)',
        borderColor: copied ? color + '66' : 'var(--border)',
        transition: 'border-color 0.2s',
        minWidth: 0,
        padding: '32px',
      }}
    >
      <div className="flex items-center gap-3 mb-5">
        <div style={{ width: 36, height: 36, flexShrink: 0 }}>
          {icon}
        </div>
        <div>
          <div className="font-syne font-bold" style={{ color, fontSize: '20px' }}>
            {chain}
          </div>
          <div className="font-mono" style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            {label}
          </div>
        </div>
      </div>

      <div
        className="mb-4 px-3 py-2.5 rounded"
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          opacity: address ? 1 : 0.6,
          overflow: 'hidden',
        }}
      >
        <span
          style={{
            display: 'block',
            fontFamily: 'monospace',
            fontSize: '10px',
            lineHeight: 1.6,
            whiteSpace: 'nowrap',
            letterSpacing: '0.02em',
            color: address ? 'var(--text-primary)' : 'var(--text-secondary)',
          }}
        >
          {address || 'coming soon'}
        </span>
      </div>

      <button
        type="button"
        onClick={handleCopy}
        disabled={!address}
        className="w-full rounded font-mono font-bold transition-all"
        style={{
          padding: '12px 24px',
          fontSize: '13px',
          background: copied ? color + '22' : 'transparent',
          color: copied ? color : 'var(--text-secondary)',
          border: `1px solid ${copied ? color + '55' : 'var(--border)'}`,
          cursor: address ? 'pointer' : 'not-allowed',
          opacity: address ? 1 : 0.45,
        }}
      >
        {copied ? 'Copied! 🫡' : address ? 'Copy Address' : 'Coming Soon'}
      </button>
    </div>
  )
}

export default function Footer() {
  return (
    <footer className="border-t" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>
        <div className="text-center mb-10">
          <h3 className="font-syne font-black text-xl mb-2" style={{ color: 'var(--text-primary)' }}>
            Support the Dev 🛠️
          </h3>
          <p className="font-mono text-sm" style={{ color: 'var(--text-secondary)' }}>
            Tips motivate me to keep building WEN BRAIN and adding new levels.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-5 mb-10">
          {WALLETS.map((w) => (
            <WalletCard key={w.chain} {...w} />
          ))}
        </div>

        <div className="text-center space-y-1">
          <p className="font-mono text-xs" style={{ color: 'var(--text-secondary)', opacity: 0.35 }}>
            *not financial advice. never was. never will be.
          </p>
          <p className="font-mono text-xs" style={{ color: 'var(--text-secondary)', opacity: 0.25 }}>
            © 2026 WEN BRAIN — Learn or Get Rekt
          </p>
        </div>
      </div>
    </footer>
  )
}
