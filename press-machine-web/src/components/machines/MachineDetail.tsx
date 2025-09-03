'use client'

import { PressMachine } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { SpecificationCard } from './SpecificationCard'
import { getProductionGroupName } from '@/lib/productionGroups'

interface MachineDetailProps {
  machine: PressMachine
}

export function MachineDetail({ machine }: MachineDetailProps) {
  return (
    <div className="space-y-6">
      {/* 基本情報カード */}
      <Card>
        <CardHeader>
          <CardTitle>基本情報</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">機械番号</label>
              <p className="text-lg font-semibold text-green-600">{machine.machine_number}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">設備番号</label>
              <p>{machine.equipment_number || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">メーカー</label>
              <p className="font-medium">{machine.maker || machine.manufacturer || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">型式</label>
              <p className="font-medium">{machine.model || machine.model_type || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">製造番号</label>
              <p>{machine.serial_no || machine.serial_number || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">製造年月</label>
              <p>
                {machine.manufacture_year && machine.manufacture_month 
                  ? `${machine.manufacture_year}年${machine.manufacture_month}月`
                  : '-'
                }
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">種別</label>
              <div>
                <Badge variant={machine.machine_type === '圧造' ? 'default' : 'secondary'}>
                  {machine.machine_type}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">生産グループ</label>
              <p>
                <span className="inline-block px-2 py-1 rounded bg-gray-100 text-gray-800 text-sm">
                  {getProductionGroupName(machine.production_group)}
                </span>
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">トン数</label>
              <p className="font-medium">{machine.tonnage ? `${machine.tonnage}t` : '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 能力・性能仕様 */}
      <SpecificationCard
        title="能力・性能仕様"
        icon="⚡"
        items={[
          { 
            label: '圧力能力 (kN)', 
            value: machine.capacity_kn ? `${machine.capacity_kn} kN` : '-',
            highlight: true
          },
          { 
            label: '圧力能力 (ton)', 
            value: machine.capacity_ton ? `${machine.capacity_ton} ton` : '-',
            highlight: true
          },
          { 
            label: 'ストローク最小 (spm)', 
            value: machine.stroke_spm_min ? `${machine.stroke_spm_min} spm` : '-'
          },
          { 
            label: 'ストローク最大 (spm)', 
            value: machine.stroke_spm_max ? `${machine.stroke_spm_max} spm` : '-'
          },
          { 
            label: 'ストローク範囲', 
            value: machine.stroke_spm_min && machine.stroke_spm_max
              ? `${machine.stroke_spm_min}〜${machine.stroke_spm_max} spm`
              : '-',
            highlight: true
          },
          { 
            label: 'ストローク長', 
            value: machine.stroke_length_mm ? `${machine.stroke_length_mm} mm` : '-',
            highlight: true
          },
          { 
            label: '最大下降速度', 
            value: machine.max_down_speed_mm_s ? `${machine.max_down_speed_mm_s} mm/s` : '-' 
          }
        ]}
      />

      {/* 寸法仕様 */}
      <SpecificationCard
        title="寸法仕様"
        icon="📐"
        items={[
          { 
            label: 'ダイハイト', 
            value: machine.die_height_mm ? `${machine.die_height_mm} mm` : '-',
            highlight: true
          },
          { 
            label: 'スライド調整量', 
            value: machine.slide_adjust_mm ? `${machine.slide_adjust_mm} mm` : '-',
            highlight: true 
          },
          { 
            label: 'スライド寸法 左右', 
            value: machine.slide_size_lr_mm ? `${machine.slide_size_lr_mm} mm` : '-'
          },
          { 
            label: 'スライド寸法 前後', 
            value: machine.slide_size_fb_mm ? `${machine.slide_size_fb_mm} mm` : '-'
          },
          { 
            label: 'スライド寸法 (左右×前後)', 
            value: machine.slide_size_lr_mm && machine.slide_size_fb_mm
              ? `${machine.slide_size_lr_mm} × ${machine.slide_size_fb_mm} mm`
              : '-',
            highlight: true
          },
          { 
            label: 'ボルスタ寸法 左右', 
            value: machine.bolster_size_lr_mm ? `${machine.bolster_size_lr_mm} mm` : '-'
          },
          { 
            label: 'ボルスタ寸法 前後', 
            value: machine.bolster_size_fb_mm ? `${machine.bolster_size_fb_mm} mm` : '-'
          },
          { 
            label: 'ボルスタ寸法 (左右×前後)', 
            value: machine.bolster_size_lr_mm && machine.bolster_size_fb_mm
              ? `${machine.bolster_size_lr_mm} × ${machine.bolster_size_fb_mm} mm`
              : '-',
            highlight: true
          },
          { 
            label: 'ボルスタ厚み', 
            value: machine.bolster_thickness_mm ? `${machine.bolster_thickness_mm} mm` : '-',
            highlight: true
          }
        ]}
      />

      {/* 安全装置 */}
      <SpecificationCard
        title="安全装置"
        icon="🛡️"
        items={[
          { 
            label: '急停止時間', 
            value: machine.stop_time_emergency_ms ? `${machine.stop_time_emergency_ms} ms` : '-',
            highlight: true
          },
          { 
            label: '両手操作停止時間', 
            value: machine.stop_time_twohand_ms ? `${machine.stop_time_twohand_ms} ms` : '-' 
          },
          { 
            label: '光線式停止時間', 
            value: machine.stop_time_light_ms ? `${machine.stop_time_light_ms} ms` : '-' 
          },
          { 
            label: '慣性下降', 
            value: machine.inertia_drop_mm ? `${machine.inertia_drop_mm} mm` : '-',
            highlight: true
          },
          { 
            label: 'オーバーラン監視角度 最小', 
            value: machine.overrun_angle_min_deg ? `${machine.overrun_angle_min_deg}°` : '-'
          },
          { 
            label: 'オーバーラン監視角度 最大', 
            value: machine.overrun_angle_max_deg ? `${machine.overrun_angle_max_deg}°` : '-'
          },
          { 
            label: 'オーバーラン監視角度 範囲', 
            value: machine.overrun_angle_min_deg && machine.overrun_angle_max_deg
              ? `${machine.overrun_angle_min_deg}°〜${machine.overrun_angle_max_deg}°`
              : machine.overrun_angle_min_deg ? `${machine.overrun_angle_min_deg}°` : '-',
            highlight: true
          }
        ]}
      />

      {/* 環境・電気仕様 */}
      <SpecificationCard
        title="環境・電気仕様"
        icon="🔌"
        items={[
          { 
            label: '使用環境温度 最小', 
            value: machine.ambient_temp_min_c ? `${machine.ambient_temp_min_c}°C` : '-'
          },
          { 
            label: '使用環境温度 最大', 
            value: machine.ambient_temp_max_c ? `${machine.ambient_temp_max_c}°C` : '-'
          },
          { 
            label: '使用環境温度 範囲', 
            value: machine.ambient_temp_min_c && machine.ambient_temp_max_c
              ? `${machine.ambient_temp_min_c}°C〜${machine.ambient_temp_max_c}°C`
              : '-',
            highlight: true
          },
          { 
            label: 'モーター出力', 
            value: machine.motor_power_kw ? `${machine.motor_power_kw} kW` : '-',
            highlight: true
          },
          { 
            label: '電源仕様', 
            value: machine.power_spec_text || '-',
            highlight: true
          },
          { 
            label: 'エア圧力 (MPa)', 
            value: machine.air_pressure_mpa ? `${machine.air_pressure_mpa} MPa` : '-'
          },
          { 
            label: 'エア圧力 (kgf/cm²)', 
            value: machine.air_pressure_kgf_cm2 ? `${machine.air_pressure_kgf_cm2} kgf/cm²` : '-'
          },
          { 
            label: 'エア圧力 (統合)', 
            value: machine.air_pressure_mpa ? `${machine.air_pressure_mpa} MPa` :
                   machine.air_pressure_kgf_cm2 ? `${machine.air_pressure_kgf_cm2} kgf/cm²` : '-',
            highlight: true
          },
          { 
            label: '上型最大重量', 
            value: machine.max_upper_die_weight_kg ? `${machine.max_upper_die_weight_kg} kg` : '-',
            highlight: true
          }
        ]}
      />

      {/* 備考・メモ */}
      {machine.notes && (
        <Card>
          <CardHeader>
            <CardTitle>備考・メモ</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{machine.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* システム情報 */}
      <Card>
        <CardHeader>
          <CardTitle>システム情報</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
            <div>
              <label className="font-medium">登録日時</label>
              <p>{new Date(machine.created_at).toLocaleString('ja-JP')}</p>
            </div>
            <div>
              <label className="font-medium">最終更新</label>
              <p>{new Date(machine.updated_at).toLocaleString('ja-JP')}</p>
            </div>
            <div>
              <label className="font-medium">機械ID</label>
              <p className="font-mono text-blue-600">#{machine.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}