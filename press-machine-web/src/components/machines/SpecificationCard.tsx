'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface SpecificationItem {
  label: string
  value: string
  highlight?: boolean
}

interface SpecificationCardProps {
  title: string
  icon?: string
  items: SpecificationItem[]
}

export function SpecificationCard({ title, icon, items }: SpecificationCardProps) {
  // 値がある項目のみを表示
  const validItems = items.filter(item => item.value && item.value !== '-')
  
  // すべての項目が空の場合はカードを表示しない
  if (validItems.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon && <span className="text-lg">{icon}</span>}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {validItems.map((item, index) => (
            <div key={index}>
              <label className="text-sm font-medium text-gray-500">{item.label}</label>
              <p className={`${item.highlight ? 'text-lg font-semibold text-primary' : 'font-medium'}`}>
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}