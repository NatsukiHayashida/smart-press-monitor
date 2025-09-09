'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabaseBrowser } from '@/lib/supabase/client'
import { PressMachine, PressMachineInsert } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getProductionGroupOptions } from '@/lib/productionGroups'

const machineSchema = z.object({
  // 基本情報
  machine_number: z.string().min(1, '機械番号は必須です'),
  equipment_number: z.string().optional(),
  manufacturer: z.string().optional(),
  model_type: z.string().optional(),
  serial_number: z.string().optional(),
  machine_type: z.enum(['圧造', 'その他']),
  production_group: z.number().refine(
    (val) => [1, 2, 3, 30, 32].includes(val),
    { message: '有効な生産グループを選択してください' }
  ),
  tonnage: z.number().optional(),
  
  // 詳細仕様
  maker: z.string().optional(),
  model: z.string().optional(),
  serial_no: z.string().optional(),
  manufacture_year: z.number().optional(),
  manufacture_month: z.number().optional(),
  
  // 圧力能力
  capacity_kn: z.number().optional(),
  capacity_ton: z.number().optional(),
  
  // ストローク
  stroke_spm_min: z.number().optional(),
  stroke_spm_max: z.number().optional(),
  stroke_length_mm: z.number().optional(),
  
  // ダイハイト/スライド調整
  die_height_mm: z.number().optional(),
  slide_adjust_mm: z.number().optional(),
  
  // スライド寸法
  slide_size_lr_mm: z.number().optional(),
  slide_size_fb_mm: z.number().optional(),
  
  // ボルスタ寸法
  bolster_size_lr_mm: z.number().optional(),
  bolster_size_fb_mm: z.number().optional(),
  bolster_thickness_mm: z.number().optional(),
  
  // 速度・停止関連
  max_down_speed_mm_s: z.number().optional(),
  stop_time_emergency_ms: z.number().optional(),
  stop_time_twohand_ms: z.number().optional(),
  stop_time_light_ms: z.number().optional(),
  inertia_drop_mm: z.number().optional(),
  
  // 許容重量・環境
  max_upper_die_weight_kg: z.number().optional(),
  ambient_temp_min_c: z.number().optional(),
  ambient_temp_max_c: z.number().optional(),
  
  // 電気・空気
  motor_power_kw: z.number().optional(),
  power_spec_text: z.string().optional(),
  air_pressure_mpa: z.number().optional(),
  air_pressure_kgf_cm2: z.number().optional(),
  
  // オーバーラン監視
  overrun_angle_min_deg: z.number().optional(),
  overrun_angle_max_deg: z.number().optional(),
  
  // メモ
  notes: z.string().optional(),
})

type MachineFormData = z.infer<typeof machineSchema>

interface MachineFormExpandedProps {
  machine?: PressMachine
  onSuccess: () => void
  onCancel?: () => void
}

export function MachineFormExpanded({ machine, onSuccess, onCancel }: MachineFormExpandedProps) {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const supabase = supabaseBrowser()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<MachineFormData>({
    resolver: zodResolver(machineSchema),
    defaultValues: machine ? {
      machine_number: machine.machine_number,
      equipment_number: machine.equipment_number || '',
      manufacturer: machine.manufacturer || '',
      model_type: machine.model_type || '',
      serial_number: machine.serial_number || '',
      machine_type: machine.machine_type as '圧造' | 'その他',
      production_group: machine.production_group,
      tonnage: machine.tonnage || undefined,
      maker: machine.maker || '',
      model: machine.model || '',
      serial_no: machine.serial_no || '',
      manufacture_year: machine.manufacture_year || undefined,
      manufacture_month: machine.manufacture_month || undefined,
      capacity_kn: machine.capacity_kn || undefined,
      capacity_ton: machine.capacity_ton || undefined,
      stroke_spm_min: machine.stroke_spm_min || undefined,
      stroke_spm_max: machine.stroke_spm_max || undefined,
      stroke_length_mm: machine.stroke_length_mm || undefined,
      die_height_mm: machine.die_height_mm || undefined,
      slide_adjust_mm: machine.slide_adjust_mm || undefined,
      slide_size_lr_mm: machine.slide_size_lr_mm || undefined,
      slide_size_fb_mm: machine.slide_size_fb_mm || undefined,
      bolster_size_lr_mm: machine.bolster_size_lr_mm || undefined,
      bolster_size_fb_mm: machine.bolster_size_fb_mm || undefined,
      bolster_thickness_mm: machine.bolster_thickness_mm || undefined,
      max_down_speed_mm_s: machine.max_down_speed_mm_s || undefined,
      stop_time_emergency_ms: machine.stop_time_emergency_ms || undefined,
      stop_time_twohand_ms: machine.stop_time_twohand_ms || undefined,
      stop_time_light_ms: machine.stop_time_light_ms || undefined,
      inertia_drop_mm: machine.inertia_drop_mm || undefined,
      max_upper_die_weight_kg: machine.max_upper_die_weight_kg || undefined,
      ambient_temp_min_c: machine.ambient_temp_min_c || undefined,
      ambient_temp_max_c: machine.ambient_temp_max_c || undefined,
      motor_power_kw: machine.motor_power_kw || undefined,
      power_spec_text: machine.power_spec_text || '',
      air_pressure_mpa: machine.air_pressure_mpa || undefined,
      air_pressure_kgf_cm2: machine.air_pressure_kgf_cm2 || undefined,
      overrun_angle_min_deg: machine.overrun_angle_min_deg || undefined,
      overrun_angle_max_deg: machine.overrun_angle_max_deg || undefined,
      notes: machine.notes || '',
    } : {
      machine_type: '圧造',
      production_group: 1,
    }
  })

  const machineTypeValue = watch('machine_type')
  const productionGroupValue = watch('production_group')

  const onSubmit = async (data: MachineFormData) => {
    if (!profile?.org_id) return

    setLoading(true)

    try {
      const machineData: any = {
        ...data,
        org_id: profile.org_id!,
        equipment_number: data.equipment_number || null,
        manufacturer: data.manufacturer || null,
        model_type: data.model_type || null,
        serial_number: data.serial_number || null,
        tonnage: data.tonnage || null,
        maker: data.maker || null,
        model: data.model || null,
        serial_no: data.serial_no || null,
        manufacture_year: data.manufacture_year || null,
        manufacture_month: data.manufacture_month || null,
        capacity_kn: data.capacity_kn || null,
        capacity_ton: data.capacity_ton || null,
        stroke_spm_min: data.stroke_spm_min || null,
        stroke_spm_max: data.stroke_spm_max || null,
        stroke_length_mm: data.stroke_length_mm || null,
        die_height_mm: data.die_height_mm || null,
        slide_adjust_mm: data.slide_adjust_mm || null,
        slide_size_lr_mm: data.slide_size_lr_mm || null,
        slide_size_fb_mm: data.slide_size_fb_mm || null,
        bolster_size_lr_mm: data.bolster_size_lr_mm || null,
        bolster_size_fb_mm: data.bolster_size_fb_mm || null,
        bolster_thickness_mm: data.bolster_thickness_mm || null,
        max_down_speed_mm_s: data.max_down_speed_mm_s || null,
        stop_time_emergency_ms: data.stop_time_emergency_ms || null,
        stop_time_twohand_ms: data.stop_time_twohand_ms || null,
        stop_time_light_ms: data.stop_time_light_ms || null,
        inertia_drop_mm: data.inertia_drop_mm || null,
        max_upper_die_weight_kg: data.max_upper_die_weight_kg || null,
        ambient_temp_min_c: data.ambient_temp_min_c || null,
        ambient_temp_max_c: data.ambient_temp_max_c || null,
        motor_power_kw: data.motor_power_kw || null,
        power_spec_text: data.power_spec_text || null,
        air_pressure_mpa: data.air_pressure_mpa || null,
        air_pressure_kgf_cm2: data.air_pressure_kgf_cm2 || null,
        overrun_angle_min_deg: data.overrun_angle_min_deg || null,
        overrun_angle_max_deg: data.overrun_angle_max_deg || null,
        notes: data.notes || null,
      }

      if (machine) {
        // 更新
        const { error } = await supabase
          .from('press_machines')
          .update(machineData)
          .eq('id', machine.id)

        if (error) throw error
      } else {
        // 新規作成
        const { error } = await supabase
          .from('press_machines')
          .insert(machineData)

        if (error) throw error
      }

      onSuccess()
    } catch (error) {
      console.error('Machine save error:', error)
      alert('保存中にエラーが発生しました。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {machine ? 'プレス機編集' : 'プレス機登録'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">基本情報</TabsTrigger>
              <TabsTrigger value="specs">仕様</TabsTrigger>
              <TabsTrigger value="dimensions">寸法</TabsTrigger>
              <TabsTrigger value="operation">動作</TabsTrigger>
              <TabsTrigger value="other">その他</TabsTrigger>
            </TabsList>

            {/* 基本情報タブ */}
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="machine_number">機械番号 *</Label>
                  <Input
                    {...register('machine_number')}
                    className={errors.machine_number ? 'border-red-500' : ''}
                  />
                  {errors.machine_number && (
                    <p className="text-sm text-red-500">{errors.machine_number.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="equipment_number">設備番号</Label>
                  <Input {...register('equipment_number')} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="manufacturer">メーカー</Label>
                  <Input {...register('manufacturer')} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model_type">型式</Label>
                  <Input {...register('model_type')} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="serial_number">シリアル番号</Label>
                  <Input {...register('serial_number')} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tonnage">トン数</Label>
                  <Input
                    type="number"
                    {...register('tonnage', { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="machine_type">機械種別</Label>
                  <Select
                    value={machineTypeValue}
                    onValueChange={(value) => setValue('machine_type', value as '圧造' | 'その他')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="圧造">圧造</SelectItem>
                      <SelectItem value="その他">その他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="production_group">生産グループ</Label>
                  <Select
                    value={productionGroupValue?.toString()}
                    onValueChange={(value) => setValue('production_group', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getProductionGroupOptions().map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* 仕様タブ */}
            <TabsContent value="specs" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maker">メーカー（詳細）</Label>
                  <Input {...register('maker')} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">型式（詳細）</Label>
                  <Input {...register('model')} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="serial_no">製造番号</Label>
                  <Input {...register('serial_no')} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manufacture_year">製造年</Label>
                  <Input
                    type="number"
                    {...register('manufacture_year', { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="manufacture_month">製造月</Label>
                  <Input
                    type="number"
                    min="1"
                    max="12"
                    {...register('manufacture_month', { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capacity_kn">圧力能力 (kN)</Label>
                  <Input
                    type="number"
                    {...register('capacity_kn', { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity_ton">圧力能力 (ton)</Label>
                  <Input
                    type="number"
                    {...register('capacity_ton', { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="motor_power_kw">モーター出力 (kW)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    {...register('motor_power_kw', { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="power_spec_text">電源仕様</Label>
                <Input {...register('power_spec_text')} placeholder="例: 200V 3相 60Hz" />
              </div>
            </TabsContent>

            {/* 寸法タブ */}
            <TabsContent value="dimensions" className="space-y-4">
              <h4 className="text-sm font-semibold">ストローク</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stroke_spm_min">SPM 最小</Label>
                  <Input
                    type="number"
                    {...register('stroke_spm_min', { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stroke_spm_max">SPM 最大</Label>
                  <Input
                    type="number"
                    {...register('stroke_spm_max', { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stroke_length_mm">ストローク長 (mm)</Label>
                  <Input
                    type="number"
                    {...register('stroke_length_mm', { valueAsNumber: true })}
                  />
                </div>
              </div>

              <h4 className="text-sm font-semibold">ダイハイト・スライド</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="die_height_mm">ダイハイト (mm)</Label>
                  <Input
                    type="number"
                    {...register('die_height_mm', { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slide_adjust_mm">スライド調整量 (mm)</Label>
                  <Input
                    type="number"
                    {...register('slide_adjust_mm', { valueAsNumber: true })}
                  />
                </div>
              </div>

              <h4 className="text-sm font-semibold">スライド寸法</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="slide_size_lr_mm">左右 (mm)</Label>
                  <Input
                    type="number"
                    {...register('slide_size_lr_mm', { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slide_size_fb_mm">前後 (mm)</Label>
                  <Input
                    type="number"
                    {...register('slide_size_fb_mm', { valueAsNumber: true })}
                  />
                </div>
              </div>

              <h4 className="text-sm font-semibold">ボルスタ寸法</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bolster_size_lr_mm">左右 (mm)</Label>
                  <Input
                    type="number"
                    {...register('bolster_size_lr_mm', { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bolster_size_fb_mm">前後 (mm)</Label>
                  <Input
                    type="number"
                    {...register('bolster_size_fb_mm', { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bolster_thickness_mm">厚み (mm)</Label>
                  <Input
                    type="number"
                    {...register('bolster_thickness_mm', { valueAsNumber: true })}
                  />
                </div>
              </div>
            </TabsContent>

            {/* 動作タブ */}
            <TabsContent value="operation" className="space-y-4">
              <h4 className="text-sm font-semibold">速度・停止時間</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max_down_speed_mm_s">最大下降速度 (mm/s)</Label>
                  <Input
                    type="number"
                    {...register('max_down_speed_mm_s', { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inertia_drop_mm">慣性下降 (mm)</Label>
                  <Input
                    type="number"
                    {...register('inertia_drop_mm', { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stop_time_emergency_ms">急停止時間 (ms)</Label>
                  <Input
                    type="number"
                    {...register('stop_time_emergency_ms', { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stop_time_twohand_ms">両手操作停止時間 (ms)</Label>
                  <Input
                    type="number"
                    {...register('stop_time_twohand_ms', { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stop_time_light_ms">光線式停止時間 (ms)</Label>
                  <Input
                    type="number"
                    {...register('stop_time_light_ms', { valueAsNumber: true })}
                  />
                </div>
              </div>

              <h4 className="text-sm font-semibold">オーバーラン監視角度</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="overrun_angle_min_deg">最小角度 (度)</Label>
                  <Input
                    type="number"
                    {...register('overrun_angle_min_deg', { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="overrun_angle_max_deg">最大角度 (度)</Label>
                  <Input
                    type="number"
                    {...register('overrun_angle_max_deg', { valueAsNumber: true })}
                  />
                </div>
              </div>
            </TabsContent>

            {/* その他タブ */}
            <TabsContent value="other" className="space-y-4">
              <h4 className="text-sm font-semibold">環境・重量</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max_upper_die_weight_kg">上型最大重量 (kg)</Label>
                  <Input
                    type="number"
                    {...register('max_upper_die_weight_kg', { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ambient_temp_min_c">使用環境温度 最低 (℃)</Label>
                  <Input
                    type="number"
                    {...register('ambient_temp_min_c', { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ambient_temp_max_c">使用環境温度 最高 (℃)</Label>
                  <Input
                    type="number"
                    {...register('ambient_temp_max_c', { valueAsNumber: true })}
                  />
                </div>
              </div>

              <h4 className="text-sm font-semibold">空気圧</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="air_pressure_mpa">空気圧 (MPa)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register('air_pressure_mpa', { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="air_pressure_kgf_cm2">空気圧 (kgf/cm²)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    {...register('air_pressure_kgf_cm2', { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">メモ・備考</Label>
                <Textarea
                  {...register('notes')}
                  rows={4}
                  placeholder="その他の情報、備考などを入力してください"
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* 保存・キャンセルボタン */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                キャンセル
              </Button>
            )}
            <Button type="submit" disabled={loading}>
              {loading ? (machine ? '更新中...' : '登録中...') : (machine ? '更新' : '登録')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}