'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabaseBrowser } from '@/lib/supabase/client'
import { useAuth } from '@/components/auth/AuthProvider'
import { getEffectiveOrgId } from '@/lib/org'
import { AlertCircle } from 'lucide-react'
import { MaintenanceScheduleInsert } from '@/types/database'

interface MaintenanceScheduleFormProps {
  machineId?: number
  machineName?: string
  onSubmit?: (data: MaintenanceScheduleInsert) => Promise<void>
  onSuccess?: () => void
  onCancel: () => void
  initialData?: any
  isEditMode?: boolean
}

interface Machine {
  id: number
  machine_number: string
  machine_name: string
  manufacturer: string
  machine_type: string
}

const maintenanceTypes = [
  { value: 'routine', label: '定期メンテナンス' },
  { value: 'inspection', label: '定期点検' },
  { value: 'repair', label: '修理' },
  { value: 'overhaul', label: 'オーバーホール' },
  { value: 'emergency', label: '緊急対応' },
  { value: 'preventive', label: '予防保全' }
]

const priorities = [
  { value: 'low', label: '低' },
  { value: 'normal', label: '中' },
  { value: 'high', label: '高' }
]

const statuses = [
  { value: 'scheduled', label: '予定' },
  { value: 'in_progress', label: '実行中' },
  { value: 'completed', label: '完了' },
  { value: 'cancelled', label: 'キャンセル' }
]

export function MaintenanceScheduleForm({ 
  machineId, 
  machineName,
  onSubmit,
  onSuccess, 
  onCancel,
  initialData,
  isEditMode = false
}: MaintenanceScheduleFormProps) {
  const { profile, user } = useAuth()
  const orgId = getEffectiveOrgId(profile)
  const [loading, setLoading] = useState(false)
  const [machines, setMachines] = useState<Machine[]>([])
  const [error, setError] = useState<string | null>(null)
  const supabase = supabaseBrowser()

  const [formData, setFormData] = useState(() => {
    if (initialData) {
      return {
        press_id: initialData.press_id || machineId || 0,
        scheduled_date: initialData.scheduled_date || new Date().toISOString().slice(0, 10),
        maintenance_type: initialData.maintenance_type || 'routine',
        priority: initialData.priority || 'normal',
        planned_work: initialData.planned_work || '',
        estimated_duration: initialData.estimated_duration || null,
        assigned_technician: initialData.assigned_technician || '',
        status: initialData.status || 'scheduled',
        org_id: orgId || '',
        created_by: user?.id || null
      }
    }
    
    return {
      press_id: machineId || 0,
      scheduled_date: new Date().toISOString().slice(0, 10),
      maintenance_type: 'routine',
      priority: 'normal',
      planned_work: '',
      estimated_duration: null,
      assigned_technician: '',
      status: 'scheduled',
      org_id: orgId || '',
      created_by: user?.id || null
    }
  })

  useEffect(() => {
    if (!isEditMode && !machineId) {
      loadMachines()
    }
  }, [orgId, isEditMode, machineId])

  const loadMachines = async () => {
    if (!orgId) return

    const { data, error } = await supabase
      .from('press_machines')
      .select('*')
      .eq('org_id', orgId)
      .order('machine_number', { ascending: true })
    
    if (error) {
      setError('プレス機の読み込みに失敗しました')
    } else {
      setMachines(data || [])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (onSubmit) {
        // 編集モードの場合
        await onSubmit(formData)
      } else {
        // 新規作成モードの場合
        const { error } = await supabase
          .from('maintenance_schedules')
          .insert(formData)

        if (error) throw error
        
        if (onSuccess) {
          onSuccess()
        }
      }
    } catch (error: any) {
      console.error('Submit error:', error)
      setError(error.message || 'メンテナンス予定の保存に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* プレス機選択（新規作成時のみ） */}
      {!isEditMode && !machineId && (
        <div className="space-y-2">
          <Label htmlFor="press_id">プレス機 *</Label>
          <Select
            value={formData.press_id.toString()}
            onValueChange={(value) => setFormData({ ...formData, press_id: parseInt(value) })}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="プレス機を選択してください" />
            </SelectTrigger>
            <SelectContent>
              {machines.map((machine) => (
                <SelectItem key={machine.id} value={machine.id.toString()}>
                  {machine.machine_number} - {machine.machine_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* 予定日 */}
      <div className="space-y-2">
        <Label htmlFor="scheduled_date">予定日 *</Label>
        <Input
          type="date"
          value={formData.scheduled_date}
          onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
          required
        />
      </div>

      {/* メンテナンス種別・優先度 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="maintenance_type">メンテナンス種別</Label>
          <Select
            value={formData.maintenance_type}
            onValueChange={(value) => 
              setFormData({ ...formData, maintenance_type: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {maintenanceTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="priority">優先度</Label>
          <Select
            value={formData.priority}
            onValueChange={(value) => 
              setFormData({ ...formData, priority: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {priorities.map((priority) => (
                <SelectItem key={priority.value} value={priority.value}>
                  {priority.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 作業予定内容 */}
      <div className="space-y-2">
        <Label htmlFor="planned_work">作業予定内容</Label>
        <Textarea
          id="planned_work"
          value={formData.planned_work || ''}
          onChange={(e) => setFormData({ ...formData, planned_work: e.target.value })}
          placeholder="予定している作業内容を入力"
          rows={4}
        />
      </div>

      {/* 予定時間・担当者 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="estimated_duration">予定時間（分）</Label>
          <Input
            type="number"
            value={formData.estimated_duration || ''}
            onChange={(e) => 
              setFormData({ 
                ...formData, 
                estimated_duration: e.target.value ? parseInt(e.target.value) : null 
              })
            }
            placeholder="例: 120"
            min="0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="assigned_technician">担当者</Label>
          <Input
            type="text"
            value={formData.assigned_technician || ''}
            onChange={(e) => setFormData({ ...formData, assigned_technician: e.target.value })}
            placeholder="担当者名"
          />
        </div>
      </div>

      {/* ステータス（編集時のみ） */}
      {isEditMode && (
        <div className="space-y-2">
          <Label htmlFor="status">ステータス</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* ボタン */}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          キャンセル
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? '保存中...' : (isEditMode ? '更新' : '登録')}
        </Button>
      </div>
    </form>
  )
}