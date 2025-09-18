'use client'

import { useState } from 'react'
import { MaintenanceScheduleWithMachine } from '@/types/database'
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
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, Calendar, Clock, User } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface MaintenanceScheduleTableProps {
  schedules: MaintenanceScheduleWithMachine[]
  onRefresh?: () => void
  onNew: () => void
}

export function MaintenanceScheduleTable({ schedules, onRefresh, onNew }: MaintenanceScheduleTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  const filteredSchedules = schedules.filter(schedule =>
    schedule.press_machines.machine_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    schedule.press_machines.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    schedule.maintenance_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    schedule.planned_work?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    schedule.assigned_technician?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit = (scheduleId: number) => {
    console.log('Editing schedule with ID:', scheduleId)
    if (!scheduleId || isNaN(scheduleId)) {
      console.error('Invalid schedule ID:', scheduleId)
      return
    }
    const editUrl = `/maintenance/schedules/${scheduleId}/edit`
    console.log('Navigating to:', editUrl)
    router.push(editUrl)
  }

  const getMaintenanceTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'routine': '定期メンテナンス',
      'inspection': '定期点検',
      'repair': '修理',
      'overhaul': 'オーバーホール',
      'emergency': '緊急対応',
      'preventive': '予防保全'
    }
    return types[type] || type
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'normal':
        return 'bg-secondary text-secondary-foreground'
      case 'low':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-secondary text-secondary-foreground'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-gray-100 text-gray-600'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    const statuses: Record<string, string> = {
      'scheduled': '予定',
      'in_progress': '実行中',
      'completed': '完了',
      'cancelled': 'キャンセル'
    }
    return statuses[status] || status
  }

  const getPriorityLabel = (priority: string) => {
    const priorities: Record<string, string> = {
      'high': '高',
      'normal': '中',
      'low': '低'
    }
    return priorities[priority] || priority
  }

  const isUpcoming = (scheduledDate: string) => {
    const today = new Date()
    const scheduleDate = new Date(scheduledDate)
    const diffTime = scheduleDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 7 && diffDays >= 0
  }

  const isOverdue = (scheduledDate: string, status: string) => {
    if (status === 'completed' || status === 'cancelled') return false
    const today = new Date()
    const scheduleDate = new Date(scheduledDate)
    return scheduleDate < today
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>メンテナンス予定一覧</CardTitle>
          <div className="flex gap-2 items-center">
            <Input
              placeholder="機械番号、種別、担当者で検索..."
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
              新規予定
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>予定日</TableHead>
                <TableHead>機械番号</TableHead>
                <TableHead>メーカー・型式</TableHead>
                <TableHead>種別</TableHead>
                <TableHead>優先度</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead>担当者</TableHead>
                <TableHead>予定時間</TableHead>
                <TableHead>作業内容</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSchedules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    メンテナンス予定が見つかりません
                  </TableCell>
                </TableRow>
              ) : (
                filteredSchedules.map((schedule) => (
                  <TableRow 
                    key={schedule.id}
                    className={
                      isOverdue(schedule.scheduled_date, schedule.status) ? 'bg-red-50' :
                      isUpcoming(schedule.scheduled_date) ? 'bg-yellow-50' : ''
                    }
                  >
                    <TableCell className="font-mono text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>
                          {new Date(schedule.scheduled_date).toLocaleDateString('ja-JP')}
                        </span>
                        {isOverdue(schedule.scheduled_date, schedule.status) && (
                          <Badge variant="destructive" className="text-xs">期限切れ</Badge>
                        )}
                        {isUpcoming(schedule.scheduled_date) && (
                          <Badge variant="outline" className="text-xs">間もなく</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {schedule.press_machines.machine_number}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{schedule.press_machines.manufacturer}</div>
                        <div className="text-gray-500">{schedule.press_machines.model_type}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {getMaintenanceTypeLabel(schedule.maintenance_type)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${getPriorityColor(schedule.priority)}`}>
                        {getPriorityLabel(schedule.priority)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${getStatusColor(schedule.status)}`}>
                        {getStatusLabel(schedule.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1 text-sm">
                        <User className="w-3 h-3 text-gray-500" />
                        <span>{schedule.assigned_technician || '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1 text-sm">
                        <Clock className="w-3 h-3 text-gray-500" />
                        <span>
                          {schedule.estimated_duration ? `${schedule.estimated_duration}分` : '-'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="text-sm text-gray-600 truncate" title={schedule.planned_work || ''}>
                        {schedule.planned_work || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(schedule.id)}
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
          {filteredSchedules.length} / {schedules.length} 件を表示
        </div>
      </CardContent>
    </Card>
  )
}