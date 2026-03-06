// Crypto logo particles — SVG inline for most, img for PEPE + TRX (per user spec)

function BtcLogo() {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="15" fill="#F7931A"/>
      <path
        d="M21.5 13.5c.3-2-1.2-3-3.3-3.7l.7-2.7-1.6-.4-.7 2.6-.5-.1.7-2.6-1.6-.4-.7 2.7-3.3-.8-.4 1.7s1.2.3 1.1.3c.6.1.7.5.7.8l-.8 3.2h.2l-1.1 4.4c-.1.2-.3.5-.8.4l-1.1-.3-.8 1.8 3.1.8.6.1-.7 2.7 1.6.4.7-2.7.5.1-.7 2.7 1.6.4.7-2.8c2.9.6 5-.2 5.9-2.8.7-2.1-.1-3.3-1.5-4 1.1-.3 1.9-1 2.1-2.5zm-3.7 5.2c-.5 2-3.9 1-5 .7l.9-3.5c1.1.3 4.6.8 4.1 2.8zm.5-5.2c-.5 1.8-3.3 1-4.2.7l.8-3.2c.9.2 3.9.6 3.4 2.5z"
        fill="white"
      />
    </svg>
  )
}

function EthLogo() {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="15" fill="#1a1a2e"/>
      <polygon points="16,4 24,16.5 16,20 8,16.5"  fill="#627EEA" opacity="0.9"/>
      <polygon points="16,20 24,16.5 16,28"         fill="#627EEA"/>
      <polygon points="16,20 8,16.5 16,28"          fill="#8fa3f5"/>
      <polygon points="16,4 8,16.5 16,13.5"         fill="#8fa3f5" opacity="0.8"/>
    </svg>
  )
}

function SolLogo({ id }) {
  const gid = `sg${id}`
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="15" fill="#1a0533"/>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#9945FF"/>
          <stop offset="100%" stopColor="#00FFA3"/>
        </linearGradient>
      </defs>
      <rect x="6" y="9"    width="20" height="3"   rx="1.5" fill={`url(#${gid})`}/>
      <rect x="6" y="14.5" width="20" height="3"   rx="1.5" fill={`url(#${gid})`}/>
      <rect x="6" y="20"   width="20" height="3"   rx="1.5" fill={`url(#${gid})`}/>
    </svg>
  )
}

function BaseLogo() {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="15" fill="#0052FF"/>
      <circle cx="16" cy="16" r="9"  fill="none" stroke="white" strokeWidth="2.5" opacity="0.9"/>
      <circle cx="16" cy="16" r="4.5" fill="white" opacity="0.9"/>
    </svg>
  )
}

function UsdtLogo() {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="15" fill="#26A17B"/>
      <rect x="10"  y="9"    width="12" height="2.5" rx="1.25" fill="white"/>
      <rect x="14.5" y="11.5" width="3"  height="11"  rx="1.5"  fill="white"/>
      <rect x="9"   y="17"   width="14" height="2"   rx="1"    fill="white" opacity="0.7"/>
    </svg>
  )
}

function SuiLogo() {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="15" fill="#0d1b2e"/>
      <path d="M16 4C16 4 10 10 10 16.5C10 20.09 12.69 23 16 23C19.31 23 22 20.09 22 16.5C22 10 16 4 16 4Z" fill="#4DA2FF"/>
      <path d="M13 20C13 20 10.5 17.5 10.5 15C10.5 13 12 11.5 13.5 10.5" stroke="#6dbfff" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
    </svg>
  )
}

function DogeLogo() {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="15" fill="#C2A633"/>
      <text x="16" y="22" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold" fontFamily="serif">Ð</text>
    </svg>
  )
}

// PEPE + TRX: official logos via CoinGecko CDN (as requested)
function PepeImg() {
  return (
    <img
      src="https://assets.coingecko.com/coins/images/29850/small/pepe-token.jpeg"
      alt="PEPE"
      style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
      onError={(e) => { e.target.style.display = 'none' }}
    />
  )
}

function TrxImg() {
  return (
    <img
      src="https://assets.coingecko.com/coins/images/1094/small/tron-logo.png"
      alt="TRX"
      style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
      onError={(e) => { e.target.style.display = 'none' }}
    />
  )
}

// 16 logos assigned to positions — 2 each of PEPE and TRX as requested
const LOGOS = [
  { comp: BtcLogo,  label: 'BTC'  },
  { comp: EthLogo,  label: 'ETH'  },
  { comp: SolLogo,  label: 'SOL'  },
  { comp: PepeImg,  label: 'PEPE' },
  { comp: TrxImg,   label: 'TRX'  },
  { comp: BaseLogo, label: 'BASE' },
  { comp: UsdtLogo, label: 'USDT' },
  { comp: SuiLogo,  label: 'SUI'  },
  { comp: DogeLogo, label: 'DOGE' },
  { comp: BtcLogo,  label: 'BTC'  },
  { comp: EthLogo,  label: 'ETH'  },
  { comp: SolLogo,  label: 'SOL'  },
  { comp: PepeImg,  label: 'PEPE' },
  { comp: TrxImg,   label: 'TRX'  },
  { comp: BaseLogo, label: 'BASE' },
  { comp: UsdtLogo, label: 'USDT' },
]

// 16 evenly-distributed positions around the screen EDGES only.
// All icons are fully visible: ≥60px from left/right, ≥80px from top/bottom.
// Float animation lifts icons 18px upward, so top icons have extra clearance baked in.
const POSITIONS = [
  // TOP EDGE (y 11-13%) — 4 logos spread across width
  { left: '12%', top: '11%', size: 34, dur: 6.0, delay: 0.0 },
  { left: '34%', top: '12%', size: 30, dur: 7.5, delay: 1.2 },
  { left: '57%', top: '11%', size: 32, dur: 6.8, delay: 0.5 },
  { left: '78%', top: '12%', size: 36, dur: 5.5, delay: 1.8 },

  // LEFT EDGE (x 4-6%) — 4 logos spread down
  { left: '5%',  top: '22%', size: 32, dur: 7.0, delay: 0.3 },
  { left: '4%',  top: '40%', size: 28, dur: 6.5, delay: 1.5 },
  { left: '5%',  top: '57%', size: 34, dur: 8.0, delay: 0.8 },
  { left: '4%',  top: '74%', size: 30, dur: 6.2, delay: 2.0 },

  // RIGHT EDGE (x 87-89%) — 4 logos spread down
  { left: '88%', top: '18%', size: 30, dur: 6.5, delay: 0.6 },
  { left: '89%', top: '37%', size: 36, dur: 7.2, delay: 1.4 },
  { left: '87%', top: '56%', size: 32, dur: 5.8, delay: 0.1 },
  { left: '88%', top: '74%', size: 28, dur: 7.8, delay: 1.9 },

  // BOTTOM EDGE (y 83-85%) — 4 logos spread across width
  { left: '8%',  top: '84%', size: 36, dur: 6.3, delay: 0.4 },
  { left: '30%', top: '85%', size: 30, dur: 7.0, delay: 1.0 },
  { left: '60%', top: '84%', size: 34, dur: 6.7, delay: 1.6 },
  { left: '82%', top: '83%', size: 32, dur: 5.9, delay: 0.7 },
]

export default function ParticleField() {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ overflow: 'visible' }} aria-hidden>
      {POSITIONS.map((pos, i) => {
        const { comp: Logo, label } = LOGOS[i]
        return (
          <div
            key={i}
            className="particle"
            style={{
              left: pos.left,
              top: pos.top,
              '--duration': `${pos.dur}s`,
              '--delay': `${pos.delay}s`,
              width: pos.size,
              height: pos.size,
              overflow: 'visible',
              padding: '4px',
            }}
            title={label}
          >
            <Logo id={i} />
          </div>
        )
      })}
    </div>
  )
}
