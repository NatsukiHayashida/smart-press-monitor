'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabaseBrowser } from '@/lib/supabase/client'
import { useAuth } from '@/components/auth/AuthProvider-minimal'
import { PressMachine, MaintenanceRecordInsert } from '@/types/database'

interface MaintenanceFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export function MaintenanceForm({ onSuccess, onCancel }: MaintenanceFormProps) {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [machines, setMachines] = useState<PressMachine[]>([])
  const supabase = supabaseBrowser()

  const [formData, setFormData] = useState<MaintenanceRecordInsert>({
    org_id: profile?.org_id || '',
    press_id: 0,
    maintenance_date: new Date().toISOString().slice(0, 10),
    overall_judgment: 'A:良好',
    clutch_valve_replacement: '未実施',
    brake_valve_replacement: '未実施',
    remarks: ''
  })

  useEffect(() => {
    loadMachines()
  }, [profile?.org_id])

  const loadMachines = async () => {
    if (!profile?.org_id) return

    const { data } = await supabase
      .from('press_machines')
      .select('*')
      .eq('org_id', profile.org_id!)
      .order('machine_number', { ascending: true })
    
    setMachines(data || [])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('maintenance_records')
        .insert(formData)

      if (error) {
        alert(`エラー: ${error.message}`)
      } else {
        onSuccess()
      }
    } catch (error) {
      alert('メンテナンス記録の登録に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>メンテナンス記録登録</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="press_id">プレス機</Label>
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
                    {machine.machine_number} - {machine.manufacturer} {machine.model_type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maintenance_date">メンテナンス日</Label>
            <Input
              type="date"
              value={formData.maintenance_date}
              onChange={(e) => setFormData({ ...formData, maintenance_date: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="overall_judgment">総合判定</Label>
            <Select
              value={formData.overall_judgment}
              onValueChange={(value) => setFormData({ ...formData, overall_judgment: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A:良好">A:良好</SelectItem>
                <SelectItem value="B:一部修理">B:一部修理</SelectItem>
                <SelectItem value="C:至急修理を要す">C:至急修理を要す</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clutch_valve_replacement">クラッチ弁交換</Label>
              <Select
                value={formData.clutch_valve_replacement}
                onValueChange={(value) => setFormData({ ...formData, clutch_valve_replacement: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="未実施">未実施</SelectItem>
                  <SelectItem value="実施">実施</SelectItem>
                  <SelectItem value="不要">不要</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="brake_valve_replacement">ブレーキ弁交換</Label>
              <Select
                value={formData.brake_valve_replacement}
                onValueChange={(value) => setFormData({ ...formData, brake_valve_replacement: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="未実施">未実施</SelectItem>
                  <SelectItem value="実施">実施</SelectItem>
                  <SelectItem value="不要">不要</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="remarks">備考</Label>
            <Textarea
              placeholder="メンテナンスの詳細、特記事項などを入力してください"
              value={formData.remarks || ''}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              rows={4}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              キャンセル
            </Button>
            <Button type="submit" disabled={loading || !formData.press_id}>
              {loading ? '登録中...' : '登録'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}