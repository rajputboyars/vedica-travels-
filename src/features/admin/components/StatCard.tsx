import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import type { ReactNode } from 'react'

export default function StatCard({ title, value, icon, sub, href }: { title: string; value: number | string; icon: ReactNode; sub: string; href: string }) {
  return (
    <Link href={href}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">{title}</span>
            {icon}
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-1">{value}</div>
          <div className="text-xs text-gray-400">{sub}</div>
        </CardContent>
      </Card>
    </Link>
  )
}
