'use client'

interface MiniLineChartProps {
  data: number[]
  color?: string
  height?: number
}

// Sparkline-style trend line, same zero-dependency reasoning as
// BarChart.tsx. Used for small "trend at a glance" spots rather than a
// full labeled chart.
export default function MiniLineChart({ data, color = '#16a34a', height = 48 }: MiniLineChartProps) {
  if (data.length === 0) return null
  const max = Math.max(1, ...data)
  const min = Math.min(0, ...data)
  const range = max - min || 1
  const step = 100 / Math.max(1, data.length - 1)

  const points = data.map((v, i) => `${i * step},${height - ((v - min) / range) * height}`).join(' ')

  return (
    <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth={2} vectorEffect="non-scaling-stroke" />
    </svg>
  )
}
