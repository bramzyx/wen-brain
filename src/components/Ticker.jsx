const TICKERS = [
  { symbol: 'BTC', price: '$67,420', change: '+4.2%', color: '#F7931A' },
  { symbol: 'ETH', price: '$3,541', change: '+2.1%', color: '#627EEA' },
  { symbol: 'SOL', price: '$178.33', change: '+8.7%', color: '#9945FF' },
  { symbol: 'PEPE', price: '$0.0000142', change: '+15.3%', color: '#00CC44' },
  { symbol: 'DOGE', price: '$0.1821', change: '+3.5%', color: '#C2A633' },
  { symbol: 'WIF', price: '$2.87', change: '+22.1%', color: '#FF6B35' },
  { symbol: 'BONK', price: '$0.0000283', change: '+11.4%', color: '#FF9500' },
  { symbol: 'SHIB', price: '$0.0000241', change: '+5.8%', color: '#FF4500' },
  { symbol: 'TAO', price: '$441.20', change: '+6.3%', color: '#00FFA3' },
  { symbol: 'FLOKI', price: '$0.000198', change: '+9.1%', color: '#FFD700' },
]

const TickerItem = ({ symbol, price, change, color }) => (
  <span className="inline-flex items-center gap-2 px-4 font-mono text-xs whitespace-nowrap">
    <span style={{ color }} className="font-bold">{symbol}</span>
    <span style={{ color: 'var(--text-primary)' }}>{price}</span>
    <span style={{ color: '#00FF94' }}>{change}</span>
    <span style={{ color: 'var(--border)' }}>|</span>
  </span>
)

export default function Ticker() {
  const doubled = [...TICKERS, ...TICKERS]

  return (
    <div
      className="fixed top-14 left-0 right-0 z-40 overflow-hidden border-b py-1"
      style={{ background: 'rgba(8,11,17,0.9)', borderColor: 'var(--border)', height: '28px' }}
    >
      <div
        className="flex"
        style={{ animation: 'ticker 30s linear infinite', width: 'max-content' }}
      >
        {doubled.map((t, i) => (
          <TickerItem key={i} {...t} />
        ))}
      </div>
    </div>
  )
}
