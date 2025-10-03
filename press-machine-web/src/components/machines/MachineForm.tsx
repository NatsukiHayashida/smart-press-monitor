'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { PressMachine } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getProductionGroupOptions } from '@/lib/productionGroups'
import { createPressMachine, updatePressMachine } from '@/app/machines/actions'
import { toast } from 'sonner'

const machineSchema = z.object({
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
})

type MachineFormData = z.infer<typeof machineSchema>

interface MachineFormProps {
  machine?: PressMachine
  onSuccess: () => void
  onCancel?: () => void
}

export function MachineForm({ machine, onSuccess, onCancel }: MachineFormProps) {
  const [loading, setLoading] = useState(false)

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
    } : {
      machine_type: '圧造',
      production_group: 1,
    }
  })

  const machineTypeValue = watch('machine_type')
  const productionGroupValue = watch('production_group')

  const onSubmit = async (data: MachineFormData) => {
    setLoading(true)

    try {
      const machineData = {
        machineNumber: data.machine_number,
        equipmentNumber: data.equipment_number || null,
        manufacturer: data.manufacturer || null,
        modelType: data.model_type || null,
        serialNumber: data.serial_number || null,
        machineType: data.machine_type,
        productionGroup: data.production_group,
        tonnage: data.tonnage || null,
      }

      let result
      if (machine) {
        // 更新
        result = await updatePressMachine(machine.id, machineData)
      } else {
        // 新規作成
        result = await createPressMachine(machineData)
      }

      if (result.success) {
        toast.success(machine ? 'プレス機を更新しました' : 'プレス機を登録しました')
        onSuccess()
      } else {
        toast.error(result.error || '保存中にエラーが発生しました')
      }
    } catch (error) {
      console.error('Error saving machine:', error)
      toast.error('保存中にエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="machine_number">機械番号 *</Label>
          <Input
            id="machine_number"
            {...register('machine_number')}
            placeholder="例: P001"
          />
          {errors.machine_number && (
            <p className="text-sm text-red-600 mt-1">{errors.machine_number.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="equipment_number">設備番号</Label>
          <Input
            id="equipment_number"
            {...register('equipment_number')}
            placeholder="例: EQ001"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="manufacturer">メーカー</Label>
          <Input
            id="manufacturer"
            {...register('manufacturer')}
            placeholder="例: アマダ"
          />
        </div>

        <div>
          <Label htmlFor="model_type">型式</Label>
          <Input
            id="model_type"
            {...register('model_type')}
            placeholder="例: TP-100"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="serial_number">シリアル番号</Label>
        <Input
          id="serial_number"
          {...register('serial_number')}
          placeholder="例: SN123456"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>種別 *</Label>
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

        <div>
          <Label htmlFor="production_group">生産グループ *</Label>
          <Select 
            value={productionGroupValue?.toString()} 
            onValueChange={(value) => setValue('production_group', parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="グループを選択" />
            </SelectTrigger>
            <SelectContent>
              {getProductionGroupOptions().map(option => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.production_group && (
            <p className="text-sm text-red-600 mt-1">{errors.production_group.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="tonnage">トン数</Label>
          <Input
            id="tonnage"
            type="number"
            min="0"
            step="0.1"
            {...register('tonnage', { valueAsNumber: true })}
            placeholder="例: 100"
          />
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            キャンセル
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? '保存中...' : machine ? '更新' : '登録'}
        </Button>
      </div>
    </form>
  )
}