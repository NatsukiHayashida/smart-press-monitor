'use client'

import { useState } from 'react'
import { PressMachine } from '@/types/database'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { getProductionGroupName } from '@/lib/productionGroups'
import { Printer } from 'lucide-react'

interface MachineTableProps {
  machines: PressMachine[]
  onRefresh?: () => void
}

export function MachineTable({ machines, onRefresh }: MachineTableProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const handlePrint = () => {
    window.print()
  }

  // バッジ色の定義
  const machineTypeColors: {[key: string]: string} = {
    '圧造': 'bg-blue-100 text-blue-800 border-blue-200',
    '汎用': 'bg-slate-100 text-slate-800 border-slate-200',
    'その他': 'bg-orange-100 text-orange-800 border-orange-200'
  }

  const groupColors: {[key: string]: string} = {
    '生産1': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    '生産2': 'bg-cyan-100 text-cyan-800 border-cyan-200',
    '生産3': 'bg-purple-100 text-purple-800 border-purple-200',
    '東大阪': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    '本社': 'bg-red-100 text-red-800 border-red-200',
    '試作': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'その他': 'bg-rose-100 text-rose-800 border-rose-200'
  }

  const filteredMachines = machines.filter(machine =>
    machine.machine_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    machine.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    machine.model_type?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Card className="print-card">
      <CardHeader className="print-hide">
        <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0">
          <CardTitle>プレス機一覧</CardTitle>
          <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
            <Input
              placeholder="検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-60 md:w-80"
            />
            <div className="flex gap-2">
              <Button onClick={handlePrint} variant="outline" size="sm" className="flex-1 sm:flex-initial items-center gap-2">
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">印刷</span>
              </Button>
              {onRefresh && (
                <Button onClick={onRefresh} variant="outline" size="sm" className="flex-1 sm:flex-initial">
                  更新
                </Button>
              )}
              <Link href="/machines/new" className="flex-1 sm:flex-initial">
                <Button size="sm" className="w-full">新規追加</Button>
              </Link>
            </div>
          </div>
        </div>
      </CardHeader>

      {/* 印刷用タイトル */}
      <div className="hidden print:block print-title">
        プレス機一覧
      </div>
      <CardContent className="print-compact">
        {/* デスクトップ: テーブル表示 */}
        <div className="hidden md:block rounded-md border print-no-break print-table-container">
          <Table className="print-table">
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">ID</TableHead>
                <TableHead className="text-center">機械番号</TableHead>
                <TableHead className="text-center">設備番号</TableHead>
                <TableHead>メーカー</TableHead>
                <TableHead>型式</TableHead>
                <TableHead>種別</TableHead>
                <TableHead>グループ</TableHead>
                <TableHead>トン数</TableHead>
                <TableHead>登録日</TableHead>
                <TableHead className="print-hide">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMachines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    プレス機が見つかりません
                  </TableCell>
                </TableRow>
              ) : (
                filteredMachines.map((machine) => (
                  <TableRow key={machine.id} className="print-no-break">
                    <TableCell className="font-mono text-sm text-center text-primary">{machine.id}</TableCell>
                    <TableCell className="font-semibold text-center text-green-600">{machine.machine_number}</TableCell>
                    <TableCell className="text-center">{machine.equipment_number || '-'}</TableCell>
                    <TableCell>{machine.manufacturer || '-'}</TableCell>
                    <TableCell>{machine.model_type || '-'}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`${machineTypeColors[machine.machine_type] || machineTypeColors['その他']} print:hidden`}
                      >
                        {machine.machine_type}
                      </Badge>
                      <span className="hidden print:inline">
                        {machine.machine_type}
                      </span>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const groupName = getProductionGroupName(machine.production_group)
                        return (
                          <>
                            <Badge
                              variant="outline"
                              className={`${groupColors[groupName] || groupColors['その他']} print:hidden`}
                            >
                              {groupName}
                            </Badge>
                            <span className="hidden print:inline">
                              {groupName}
                            </span>
                          </>
                        )
                      })()}
                    </TableCell>
                    <TableCell>{machine.tonnage ? `${machine.tonnage}t` : '-'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(machine.created_at).toLocaleDateString('ja-JP')}
                    </TableCell>
                    <TableCell className="print-hide">
                      <div className="flex gap-1">
                        <Link href={`/machines/${machine.id}`}>
                          <Button variant="outline" size="sm">
                            詳細
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* モバイル: コンパクトなリスト表示 */}
        <div className="md:hidden">
          {filteredMachines.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              プレス機が見つかりません
            </div>
          ) : (
            filteredMachines.map((machine) => {
              const groupName = getProductionGroupName(machine.production_group)
              return (
                <Link key={machine.id} href={`/machines/${machine.id}`}>
                  <div className="p-3 hover:bg-accent/50 active:bg-accent transition-colors border-b border-gray-200">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-bold text-green-600 truncate">{machine.machine_number}</h3>
                          <Badge
                            variant="outline"
                            className={`text-xs ${machineTypeColors[machine.machine_type] || machineTypeColors['その他']}`}
                          >
                            {machine.machine_type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {machine.manufacturer} {machine.model_type}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs flex-shrink-0 ${groupColors[groupName] || groupColors['その他']}`}
                      >
                        {groupName}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>設備: {machine.equipment_number || '-'}</span>
                      <span>{machine.tonnage ? `${machine.tonnage}t` : ''}</span>
                    </div>
                  </div>
                </Link>
              )
            })
          )}
        </div>

        <div className="mt-4 text-sm text-muted-foreground print-hide">
          {filteredMachines.length} / {machines.length} 台を表示
        </div>

        {/* 印刷用フッター */}
        <div className="hidden print:block text-right text-sm mt-6" style={{fontSize: '10pt', marginTop: '20pt'}}>
          {filteredMachines.length}/{machines.length}台を表示
        </div>
      </CardContent>
    </Card>
  )
}