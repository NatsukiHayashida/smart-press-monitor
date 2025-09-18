'use client'

import { useState } from 'react'
import { MaintenanceRecordWithMachine } from '@/types/database'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Edit, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface MaintenanceTableProps {
  records: MaintenanceRecordWithMachine[]
  onRefresh?: () => void
  onNew: () => void
}

export function MaintenanceTable({ records, onRefresh, onNew }: MaintenanceTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  // デバッグ用ログ
  console.log('MaintenanceTable records:', records.length > 0 ? records[0] : 'No records')

  const filteredRecords = records.filter(record =>
    record.press_machines.machine_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.press_machines.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.overall_judgment.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit = (recordId: number) => {
    console.log('Editing record with ID:', recordId, typeof recordId)
    if (!recordId || isNaN(recordId)) {
      console.error('Invalid record ID:', recordId)
      return
    }
    const editUrl = `/maintenance/${recordId}/edit`
    console.log('Navigating to:', editUrl)
    router.push(editUrl)
  }

  const getJudgmentColor = (judgment: string) => {
    switch (judgment) {
      case 'A:良好':
        return 'bg-green-100 text-green-800'
      case 'B:一部修理':
        return 'bg-yellow-100 text-yellow-800'
      case 'C:至急修理を要す':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getReplacementColor = (replacement: string) => {
    switch (replacement) {
      case '実施':
        return 'bg-secondary text-secondary-foreground'
      case '未実施':
        return 'bg-gray-100 text-gray-600'
      case '不要':
        return 'bg-gray-50 text-gray-500'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>メンテナンス記録一覧</CardTitle>
          <div className="flex gap-2 items-center">
            <Input
              placeholder="機械番号、メーカー、判定で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-80"
            />
            {onRefresh && (
              <Button onClick={onRefresh} variant="outline">
                更新
              </Button>
            )}
            <Button onClick={onNew}>
              新規登録
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>機械番号</TableHead>
                <TableHead>メーカー・型式</TableHead>
                <TableHead>メンテナンス日</TableHead>
                <TableHead>総合判定</TableHead>
                <TableHead>クラッチ弁</TableHead>
                <TableHead>ブレーキ弁</TableHead>
                <TableHead>備考</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    メンテナンス記録が見つかりません
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-mono text-sm">{record.id}</TableCell>
                    <TableCell className="font-semibold">
                      {record.press_machines.machine_number}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{record.press_machines.manufacturer}</div>
                        <div className="text-gray-500">{record.press_machines.model_type}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(record.maintenance_date).toLocaleDateString('ja-JP')}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getJudgmentColor(record.overall_judgment)}`}>
                        {record.overall_judgment}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-block px-2 py-1 rounded text-xs ${getReplacementColor(record.clutch_valve_replacement)}`}>
                        {record.clutch_valve_replacement}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-block px-2 py-1 rounded text-xs ${getReplacementColor(record.brake_valve_replacement)}`}>
                        {record.brake_valve_replacement}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="text-sm text-gray-600 truncate" title={record.remarks || ''}>
                        {record.remarks || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(record.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        <div className="mt-4 text-sm text-muted-foreground">
          {filteredRecords.length} / {records.length} 件を表示
        </div>
      </CardContent>
    </Card>
  )
}