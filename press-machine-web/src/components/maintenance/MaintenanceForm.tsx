'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/auth/AuthProvider'
import { getEffectiveOrgId } from '@/lib/org'
import { AlertCircle } from 'lucide-react'

interface MaintenanceFormProps {
  machineId?: number
  machineName?: string
  onSubmit?: (data: any) => Promise<void>
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

const replacementOptions = ['実施', '未実施', '一部実施']
const overallJudgmentOptions = ['A:良好', 'B:一部修理', 'C:要修理']

export function MaintenanceForm({ 
  machineId, 
  machineName,
  onSubmit,
  onSuccess, 
  onCancel,
  initialData,
  isEditMode = false
}: MaintenanceFormProps) {
  const { profile } = useAuth()
  const orgId = getEffectiveOrgId(profile)
  const [loading, setLoading] = useState(false)
  const [machines, setMachines] = useState<Machine[]>([])
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const [formData, setFormData] = useState(() => {
    if (initialData) {
      return {
        press_id: initialData.press_id || machineId || 0,
        maintenance_date: initialData.maintenance_date || new Date().toISOString().slice(0, 10),
        overall_judgment: initialData.overall_judgment || 'A:良好',
        clutch_valve_replacement: initialData.clutch_valve_replacement || '未実施',
        brake_valve_replacement: initialData.brake_valve_replacement || '未実施',
        remarks: initialData.remarks || '',
        org_id: orgId || ''
      }
    }
    
    return {
      press_id: machineId || 0,
      maintenance_date: new Date().toISOString().slice(0, 10),
      overall_judgment: 'A:良好',
      clutch_valve_replacement: '未実施',
      brake_valve_replacement: '未実施',
      remarks: '',
      org_id: orgId || ''
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
          .from('maintenance_records')
          .insert(formData)

        if (error) throw error
        
        if (onSuccess) {
          onSuccess()
        }
      }
    } catch (error: any) {
      console.error('Submit error:', error)
      setError(error.message || 'メンテナンス記録の保存に失敗しました')
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

      {/* メンテナンス日 */}
      <div className="space-y-2">
        <Label htmlFor="maintenance_date">メンテナンス日 *</Label>
        <Input
          type="date"
          value={formData.maintenance_date}
          onChange={(e) => setFormData({ ...formData, maintenance_date: e.target.value })}
          required
        />
      </div>

      {/* バルブ交換状況 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">バルブ交換状況</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clutch_valve_replacement">クラッチ弁交換</Label>
              <Select
                value={formData.clutch_valve_replacement}
                onValueChange={(value) => 
                  setFormData({ ...formData, clutch_valve_replacement: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {replacementOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="brake_valve_replacement">ブレーキ弁交換</Label>
              <Select
                value={formData.brake_valve_replacement}
                onValueChange={(value) => 
                  setFormData({ ...formData, brake_valve_replacement: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {replacementOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 総合判定 */}
      <div className="space-y-2">
        <Label htmlFor="overall_judgment">総合判定 *</Label>
        <Select
          value={formData.overall_judgment}
          onValueChange={(value) => setFormData({ ...formData, overall_judgment: value })}
          required
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {overallJudgmentOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 備考 */}
      <div className="space-y-2">
        <Label htmlFor="remarks">備考</Label>
        <Textarea
          id="remarks"
          value={formData.remarks || ''}
          onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
          placeholder="メンテナンス作業の詳細や特記事項を入力"
          rows={4}
        />
      </div>

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