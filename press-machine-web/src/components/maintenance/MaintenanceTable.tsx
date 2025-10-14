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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useRouter } from 'next/navigation'

interface MaintenanceTableProps {
  records: MaintenanceRecordWithMachine[]
  onRefresh?: () => void
  onNew: () => void
  onDelete?: (id: number) => Promise<void>
}

export function MaintenanceTable({ records, onRefresh, onNew, onDelete }: MaintenanceTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [recordToDelete, setRecordToDelete] = useState<number | null>(null)
  const [recordToDeleteDetails, setRecordToDeleteDetails] = useState<{ machineNumber: string; date: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
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

  const handleDeleteClick = (record: any) => {
    setRecordToDelete(record.id)
    setRecordToDeleteDetails({
      machineNumber: record.press_machines.machine_number,
      date: new Date(record.maintenance_date).toLocaleDateString('ja-JP')
    })
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (recordToDelete && onDelete) {
      setIsDeleting(true)
      try {
        await onDelete(recordToDelete)
        setDeleteDialogOpen(false)
        setRecordToDelete(null)
        setRecordToDeleteDetails(null)
      } catch (error) {
        console.error('Delete failed:', error)
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setRecordToDelete(null)
    setRecordToDeleteDetails(null)
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
        <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0">
          <CardTitle>メンテナンス記録一覧</CardTitle>
          <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
            <Input
              placeholder="検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-60 md:w-80"
            />
            <div className="flex gap-2">
              {onRefresh && (
                <Button onClick={onRefresh} variant="outline" size="sm" className="flex-1 sm:flex-initial">
                  更新
                </Button>
              )}
              <Button onClick={onNew} size="sm" className="flex-1 sm:flex-initial">
                新規登録
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* デスクトップ: テーブル表示 */}
        <div className="hidden md:block rounded-md border">
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
                          title="編集"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        {onDelete && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(record)}
                            className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                            title="削除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
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
          {filteredRecords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              メンテナンス記録が見つかりません
            </div>
          ) : (
            filteredRecords.map((record) => (
              <div key={record.id} className="p-3 hover:bg-accent/50 active:bg-accent transition-colors border-b border-gray-200">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-bold truncate">{record.press_machines.machine_number}</h3>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getJudgmentColor(record.overall_judgment)}`}>
                        {record.overall_judgment}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {record.press_machines.manufacturer} {record.press_machines.model_type}
                    </p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(record.id)}
                      className="h-7 w-7 p-0"
                      title="編集"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    {onDelete && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(record)}
                        className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                        title="削除"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{new Date(record.maintenance_date).toLocaleDateString('ja-JP')}</span>
                  <div className="flex gap-2">
                    <span className={`px-1.5 py-0.5 rounded ${getReplacementColor(record.clutch_valve_replacement)}`}>
                      クラッチ: {record.clutch_valve_replacement}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded ${getReplacementColor(record.brake_valve_replacement)}`}>
                      ブレーキ: {record.brake_valve_replacement}
                    </span>
                  </div>
                </div>
                {record.remarks && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-1" title={record.remarks}>
                    備考: {record.remarks}
                  </p>
                )}
              </div>
            ))
          )}
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          {filteredRecords.length} / {records.length} 件を表示
        </div>
      </CardContent>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>メンテナンス記録を削除しますか？</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>以下のメンテナンス記録を削除しようとしています：</p>
                {recordToDeleteDetails && (
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="font-semibold">機械番号: {recordToDeleteDetails.machineNumber}</p>
                    <p className="text-sm text-gray-600">メンテナンス日: {recordToDeleteDetails.date}</p>
                  </div>
                )}
                <p className="text-red-600 font-semibold">この操作は取り消せません。本当に削除しますか？</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel} disabled={isDeleting}>
              キャンセル
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? '削除中...' : '削除する'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}