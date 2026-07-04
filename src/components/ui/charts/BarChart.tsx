'use client'

export interface BarChartDatum {
  label: string
  value: number
}

interface BarChartProps {
  data: BarChartDatum[]
  color?: string
  height?: number
  valueFormatter?: (value: number) => string
}

// Hand-rolled SVG bar chart — no chart library dependency. This sandbox's
// npm install is unreliable for pulling in a package like Recharts/
// Chart.js (many transitive deps), and a dashboard overview only needs a
// handful of simple bars/lines, so a ~40-line SVG component is both
// "free" (Phase 8's requirement) and zero-risk to install. Swappable for
// Recharts later without touching any call site — this component's
// props (`data`, `color`, `height`) are the same shape either way.
export default function BarChart({ data, color = '#ea580c', height = 160, valueFormatter }: BarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.value))
  const barWidth = 100 / data.length

  return (
    <div>
      <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
        {data.map((d, i) => {
          const barHeight = (d.value / max) * (height - 20)
          const x = i * barWidth
          return (
            <g key={i}>
              <rect
                x={x + barWidth * 0.15}
                y={height - 20 - barHeight}
                width={barWidth * 0.7}
                height={barHeight}
                fill={color}
                rx={1}
              >
                <title>{`${d.label}: ${valueFormatter ? valueFormatter(d.value) : d.value}`}</title>
              </rect>
            </g>
          )
        })}
        <line x1={0} y1={height - 20} x2={100} y2={height - 20} stroke="#e5e7eb" strokeWidth={0.5} />
      </svg>
      <div className="flex text-[10px] text-gray-400 mt-1">
        {data.map((d, i) => (
          <div key={i} style={{ width: `${barWidth}%` }} className="text-center truncate px-0.5">
            {d.label}
          </div>
        ))}
      </div>
    </div>
  )
}
