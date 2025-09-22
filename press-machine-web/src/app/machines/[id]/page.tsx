'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/auth/AuthProvider'
import { getEffectiveOrgId } from '@/lib/org'
import { PressMachine, MaintenanceRecordWithMachine, MaintenanceScheduleWithMachine } from '@/types/database'
import { MachineDetail } from '@/components/machines/MachineDetail'
import { Header } from '@/components/layout/Header'
import { LoginForm } from '@/components/auth/LoginForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit, Trash2, AlertCircle, Plus, Wrench, Calendar, Clock, Printer } from 'lucide-react'
import Link from 'next/link'

export default function MachineDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const { user, profile, loading } = useAuth()
  const [machine, setMachine] = useState<PressMachine | null>(null)
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecordWithMachine[]>([])
  const [maintenanceSchedules, setMaintenanceSchedules] = useState<MaintenanceScheduleWithMachine[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)

  const orgId = getEffectiveOrgId(profile)
  const machineId = params.id as string

  useEffect(() => {
    if (loading) return
    if (!user) { setError('ログインが必要です'); setIsLoading(false); return }
    if (!orgId) { setError('組織が未設定です（org_id が見つかりません）'); setIsLoading(false); return }
    if (!machineId || isNaN(Number(machineId))) { setError('無効な機械IDです'); setIsLoading(false); return }

    loadMachine()
    loadMaintenanceRecords()
    // loadMaintenanceSchedules() // maintenance_schedulesテーブルが作成されるまでコメントアウト
  }, [loading, user, orgId, machineId])

  // Realtime subscription for maintenance records
  useEffect(() => {
    if (!orgId || !machineId) return
    
    console.log('Setting up maintenance realtime subscription for machine:', machineId)
    const ch = supabase.channel(`maintenance_records-machine-${machineId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'maintenance_records', 
        filter: `press_id=eq.${machineId}` 
      }, (payload) => {
        console.log('Maintenance realtime update received for machine:', payload)
        loadMaintenanceRecords()
      })
      .subscribe()
    
    return () => { 
      console.log('Cleaning up maintenance realtime subscription for machine')
      supabase.removeChannel(ch) 
    }
  }, [orgId, machineId, supabase])

  // Realtime subscription for maintenance schedules
  useEffect(() => {
    if (!orgId || !machineId) return
    
    console.log('Setting up schedule realtime subscription for machine:', machineId)
    
    try {
      const ch = supabase.channel(`maintenance_schedules-machine-${machineId}`)
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'maintenance_schedules', 
          filter: `press_id=eq.${machineId}` 
        }, (payload) => {
          console.log('Schedule realtime update received for machine:', payload)
          // loadMaintenanceSchedules() // maintenance_schedulesテーブルが作成されるまでコメントアウト
        })
        .subscribe()
      
      return () => { 
        console.log('Cleaning up schedule realtime subscription for machine')
        supabase.removeChannel(ch) 
      }
    } catch (error) {
      console.log('Could not set up realtime subscription for schedules (table may not exist):', error)
    }
  }, [orgId, machineId, supabase])

  const loadMachine = async () => {
    let mounted = true
    console.log('Loading machine details for ID:', machineId, 'org:', orgId)
    const { data, error } = await supabase
      .from('press_machines')
      .select('*')
      .eq('id', Number(machineId))
      .eq('org_id', orgId!)
      .single()

    if (!mounted) return
    if (error) {
      console.error('Machine query error:', error)
      setError(error.message)
      setIsLoading(false)
      return
    }
    console.log('Machine loaded:', data)
    setMachine(data)
    setIsLoading(false)
  }

  const loadMaintenanceRecords = async () => {
    const { data, error } = await supabase
      .from('maintenance_records')
      .select('*')
      .eq('press_id', Number(machineId))
      .eq('org_id', orgId!)
      .order('maintenance_date', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Error loading maintenance records:', error)
    } else {
      setMaintenanceRecords(data || [])
    }
  }

  const loadMaintenanceSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from('maintenance_schedules')
        .select('*')
        .eq('press_id', Number(machineId))
        .eq('org_id', orgId!)
        .in('status', ['scheduled', 'in_progress'])
        .order('scheduled_date', { ascending: true })
        .limit(5)

      if (error) {
        console.error('Error loading maintenance schedules:', error)
        // テーブルが存在しない場合は空配列を設定
        if (error.code === 'PGRST116' || error.code === 'PGRST205' || error.message?.includes('does not exist') || error.message?.includes('Could not find the table')) {
          console.log('maintenance_schedules table does not exist yet')
          setMaintenanceSchedules([])
          return
        }
      } else {
        setMaintenanceSchedules(data || [])
      }
    } catch (err) {
      console.error('Unexpected error loading maintenance schedules:', err)
      setMaintenanceSchedules([])
    }
  }

  const handleUpdateSuccess = () => {
    setIsEditing(false)
    loadMachine()
  }

  const handleDelete = async () => {
    if (!machine || !confirm('このプレス機を削除しますか？この操作は取り消せません。')) return

    const { error } = await supabase
      .from('press_machines')
      .delete()
      .eq('id', machine.id)

    if (error) {
      console.error('Error deleting machine:', error)
      alert('削除中にエラーが発生しました')
    } else {
      router.push('/machines')
    }
  }

  const handlePrint = () => {
    console.log('Print button clicked, machine data:', machine)
    console.log('Maintenance records:', maintenanceRecords)
    console.log('Maintenance schedules:', maintenanceSchedules)

    try {
      // 印刷専用のスタイルを一時的に挿入
      const printStyleId = 'print-only-styles'
      let printStyle = document.getElementById(printStyleId) as HTMLStyleElement

      if (!printStyle) {
        printStyle = document.createElement('style')
        printStyle.id = printStyleId
        document.head.appendChild(printStyle)
      }

      printStyle.innerHTML = `
        @media print {
          body * {
            visibility: hidden;
          }
          .print-content, .print-content * {
            visibility: visible;
          }
          .print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          @page {
            margin: 20mm;
            size: A4;
          }
        }
      `

      // 印刷用コンテンツを一時的に作成
      const printDiv = document.createElement('div')
      printDiv.className = 'print-content'
      printDiv.innerHTML = generatePrintContent().replace(/<\/?html[^>]*>|<\/?head[^>]*>|<\/?body[^>]*>/g, '')

      // bodyに一時的に追加
      document.body.appendChild(printDiv)

      // 印刷実行
      window.print()

      // クリーンアップ
      setTimeout(() => {
        document.body.removeChild(printDiv)
        if (printStyle) {
          document.head.removeChild(printStyle)
        }
      }, 1000)

    } catch (error) {
      console.error('Print error:', error)
      alert('印刷中にエラーが発生しました: ' + error.message)
    }
  }

  const generatePrintContent = () => {
    const currentDate = new Date().toLocaleString('ja-JP')

    console.log('Generating print content with machine:', machine)
    console.log('Available machine fields:', Object.keys(machine || {}))
    console.log('Maintenance records for printing:', maintenanceRecords)
    if (maintenanceRecords.length > 0) {
      console.log('First maintenance record fields:', Object.keys(maintenanceRecords[0]))
      console.log('First maintenance record:', maintenanceRecords[0])
    }

    if (!machine) {
      console.error('No machine data available for printing')
      return '<div><h1>エラー: 機械データが見つかりません</h1></div>'
    }

    return `
        <style>
          @page {
            size: A4;
            margin: 20mm;
          }

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif;
            font-size: 11pt;
            line-height: 1.4;
            color: #000;
            background: white;
          }

          .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 10pt;
            margin-bottom: 15pt;
          }

          .header h1 {
            font-size: 18pt;
            font-weight: bold;
            margin-bottom: 5pt;
            color: #000;
          }

          .header .subtitle {
            font-size: 14pt;
            color: #000;
            margin-bottom: 5pt;
          }

          .print-date {
            font-size: 10pt;
            color: #000;
            text-align: right;
            margin-bottom: 12pt;
          }

          .section {
            margin-bottom: 12pt;
            break-inside: avoid;
          }

          .section-title {
            font-size: 13pt;
            font-weight: bold;
            background: #f0f0f0;
            padding: 6pt 10pt;
            border-left: 4px solid #2563eb;
            margin-bottom: 8pt;
            color: #000;
          }

          .info-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8pt;
            margin-bottom: 10pt;
          }

          .info-item {
            padding: 6pt;
            border: 1px solid #ddd;
          }

          .info-label {
            font-size: 10pt;
            color: #000;
            font-weight: bold;
            display: block;
            margin-bottom: 2pt;
          }

          .info-value {
            font-size: 11pt;
            font-weight: normal;
            color: #000;
          }

          .specs-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8pt;
          }

          .maintenance-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10pt;
          }

          .maintenance-table th,
          .maintenance-table td {
            border: 1px solid #ddd;
            padding: 6pt 8pt;
            text-align: left;
            color: #000;
          }

          .maintenance-table th {
            background: #f0f0f0;
            font-weight: bold;
          }

          .status-good { color: #000; font-weight: bold; }
          .status-partial { color: #000; font-weight: bold; }
          .status-poor { color: #000; font-weight: bold; }

          .footer {
            position: fixed;
            bottom: 10mm;
            left: 20mm;
            right: 20mm;
            font-size: 10pt;
            color: #000;
            text-align: center;
            border-top: 1px solid #ddd;
            padding-top: 6pt;
          }
        </style>
        <div class="header">
          <h1>プレス機詳細情報</h1>
          <div class="subtitle">機械番号: ${machine.machine_number || 'N/A'} | ${machine.manufacturer || 'N/A'} ${machine.model_type || 'N/A'}</div>
        </div>

        <div class="print-date">印刷日時: ${currentDate}</div>

        <div class="section">
          <div class="section-title">基本情報</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">機械番号</span>
              <span class="info-value">${machine.machine_number || '-'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">設備番号</span>
              <span class="info-value">${machine.equipment_number || '-'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">メーカー</span>
              <span class="info-value">${machine.manufacturer || '-'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">型式</span>
              <span class="info-value">${machine.model_type || '-'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">製造番号</span>
              <span class="info-value">${machine.serial_number || '-'}</span>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">能力・性能仕様</div>
          <div class="specs-grid">
            <div class="info-item">
              <span class="info-label">圧力能力 (kN)</span>
              <span class="info-value">${machine.capacity_kn ? `${machine.capacity_kn} kN` : '-'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">圧力能力 (ton)</span>
              <span class="info-value">${machine.capacity_ton ? `${machine.capacity_ton} ton` : '-'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">ストローク最小 (spm)</span>
              <span class="info-value">${machine.stroke_spm_min ? `${machine.stroke_spm_min} spm` : '-'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">ストローク最大 (spm)</span>
              <span class="info-value">${machine.stroke_spm_max ? `${machine.stroke_spm_max} spm` : '-'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">ストローク長</span>
              <span class="info-value">${machine.stroke_length_mm ? `${machine.stroke_length_mm} mm` : '-'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">最大下降速度</span>
              <span class="info-value">${machine.max_down_speed_mm_s ? `${machine.max_down_speed_mm_s} mm/s` : '-'}</span>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">寸法仕様</div>
          <div class="specs-grid">
            <div class="info-item">
              <span class="info-label">ダイハイト</span>
              <span class="info-value">${machine.die_height_mm ? `${machine.die_height_mm} mm` : '-'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">スライド調整量</span>
              <span class="info-value">${machine.slide_adjust_mm ? `${machine.slide_adjust_mm} mm` : '-'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">スライド寸法 左右</span>
              <span class="info-value">${machine.slide_size_lr_mm ? `${machine.slide_size_lr_mm} mm` : '-'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">スライド寸法 前後</span>
              <span class="info-value">${machine.slide_size_fb_mm ? `${machine.slide_size_fb_mm} mm` : '-'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">ボルスタ寸法 左右</span>
              <span class="info-value">${machine.bolster_size_lr_mm ? `${machine.bolster_size_lr_mm} mm` : '-'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">ボルスタ寸法 前後</span>
              <span class="info-value">${machine.bolster_size_fb_mm ? `${machine.bolster_size_fb_mm} mm` : '-'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">ボルスタ厚み</span>
              <span class="info-value">${machine.bolster_thickness_mm ? `${machine.bolster_thickness_mm} mm` : '-'}</span>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">安全装置</div>
          <div class="specs-grid">
            <div class="info-item">
              <span class="info-label">急停止時間</span>
              <span class="info-value">${machine.stop_time_emergency_ms ? `${machine.stop_time_emergency_ms} ms` : '-'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">両手操作停止時間</span>
              <span class="info-value">${machine.stop_time_twohand_ms ? `${machine.stop_time_twohand_ms} ms` : '-'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">光線式停止時間</span>
              <span class="info-value">${machine.stop_time_light_ms ? `${machine.stop_time_light_ms} ms` : '-'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">慣性下降</span>
              <span class="info-value">${machine.inertia_drop_mm ? `${machine.inertia_drop_mm} mm` : '-'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">オーバーラン監視角度 最小</span>
              <span class="info-value">${machine.overrun_angle_min_deg ? `${machine.overrun_angle_min_deg}°` : '-'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">オーバーラン監視角度 最大</span>
              <span class="info-value">${machine.overrun_angle_max_deg ? `${machine.overrun_angle_max_deg}°` : '-'}</span>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">環境・電気仕様</div>
          <div class="specs-grid">
            <div class="info-item">
              <span class="info-label">使用環境温度 最小</span>
              <span class="info-value">${machine.ambient_temp_min_c ? `${machine.ambient_temp_min_c}°C` : '-'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">使用環境温度 最大</span>
              <span class="info-value">${machine.ambient_temp_max_c ? `${machine.ambient_temp_max_c}°C` : '-'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">モーター出力</span>
              <span class="info-value">${machine.motor_power_kw ? `${machine.motor_power_kw} kW` : '-'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">電源仕様</span>
              <span class="info-value">${machine.power_spec_text || '-'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">エア圧力 (MPa)</span>
              <span class="info-value">${machine.air_pressure_mpa ? `${machine.air_pressure_mpa} MPa` : '-'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">エア圧力 (kgf/cm²)</span>
              <span class="info-value">${machine.air_pressure_kgf_cm2 ? `${machine.air_pressure_kgf_cm2} kgf/cm²` : '-'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">上型最大重量</span>
              <span class="info-value">${machine.max_upper_die_weight_kg ? `${machine.max_upper_die_weight_kg} kg` : '-'}</span>
            </div>
          </div>
        </div>

        ${machine.notes ? `
        <div class="section">
          <div class="section-title">備考・メモ</div>
          <div style="padding: 10pt; border: 1px solid #ddd; font-size: 10pt; line-height: 1.4;">
            ${machine.notes.replace(/\n/g, '<br>')}
          </div>
        </div>
        ` : ''}

        <div class="section">
          <div class="section-title">システム情報</div>
          <div class="specs-grid">
            <div class="info-item">
              <span class="info-label">機械種別</span>
              <span class="info-value">${machine.machine_type || '-'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">生産グループ</span>
              <span class="info-value">${machine.production_group ? `グループ${machine.production_group}` : '-'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">トン数</span>
              <span class="info-value">${machine.tonnage ? `${machine.tonnage}t` : '-'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">登録日時</span>
              <span class="info-value">${machine.created_at ? new Date(machine.created_at).toLocaleString('ja-JP') : '-'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">最終更新</span>
              <span class="info-value">${machine.updated_at ? new Date(machine.updated_at).toLocaleString('ja-JP') : '-'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">機械ID</span>
              <span class="info-value">#${machine.id || '-'}</span>
            </div>
          </div>
        </div>

        ${maintenanceRecords && maintenanceRecords.length > 0 ? `
        <div class="section">
          <div class="section-title">最近のメンテナンス記録（直近5件）</div>
          <table class="maintenance-table">
            <thead>
              <tr>
                <th>実施日</th>
                <th>総合判定</th>
                <th>クラッチバルブ</th>
                <th>ブレーキバルブ</th>
                <th>備考</th>
              </tr>
            </thead>
            <tbody>
              ${maintenanceRecords.slice(0, 5).map(record => {
                // 日付フィールドを適切に処理
                let dateStr = '-';
                if (record.maintenance_datetime) {
                  dateStr = new Date(record.maintenance_datetime).toLocaleDateString('ja-JP');
                } else if (record.maintenance_date) {
                  dateStr = new Date(record.maintenance_date).toLocaleDateString('ja-JP');
                } else if (record.created_at) {
                  dateStr = new Date(record.created_at).toLocaleDateString('ja-JP');
                }

                return `
                <tr>
                  <td>${dateStr}</td>
                  <td class="${record.overall_judgment === '良好' ? 'status-good' : record.overall_judgment === '要注意' ? 'status-partial' : 'status-poor'}">${record.overall_judgment || '-'}</td>
                  <td>${record.clutch_valve_replacement || '-'}</td>
                  <td>${record.brake_valve_replacement || '-'}</td>
                  <td>${record.remarks ? record.remarks.substring(0, 20) + (record.remarks.length > 20 ? '...' : '') : '-'}</td>
                </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
        ` : `
        <div class="section">
          <div class="section-title">最近のメンテナンス記録</div>
          <p style="text-align: center; color: #666; padding: 20px;">メンテナンス記録がありません</p>
        </div>
        `}

        ${maintenanceSchedules && maintenanceSchedules.length > 0 ? `
        <div class="section">
          <div class="section-title">メンテナンス予定</div>
          <table class="maintenance-table">
            <thead>
              <tr>
                <th>予定日</th>
                <th>種類</th>
                <th>優先度</th>
                <th>予定時間</th>
                <th>担当者</th>
              </tr>
            </thead>
            <tbody>
              ${maintenanceSchedules.slice(0, 5).map(schedule => {
                const typeLabels = {
                  'routine': '定期メンテナンス',
                  'inspection': '定期点検',
                  'repair': '修理',
                  'overhaul': 'オーバーホール',
                  'emergency': '緊急対応',
                  'preventive': '予防保全'
                };
                const priorityLabels = { 'high': '高', 'normal': '中', 'low': '低' };

                return `
                <tr>
                  <td>${new Date(schedule.scheduled_date).toLocaleDateString('ja-JP')}</td>
                  <td>${typeLabels[schedule.maintenance_type] || schedule.maintenance_type}</td>
                  <td>${priorityLabels[schedule.priority] || schedule.priority}</td>
                  <td>${schedule.estimated_duration ? schedule.estimated_duration + '分' : '-'}</td>
                  <td>${schedule.assigned_technician || '-'}</td>
                </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
        ` : `
        <div class="section">
          <div class="section-title">メンテナンス予定</div>
          <p style="text-align: center; color: #666; padding: 20px;">メンテナンス予定がありません</p>
        </div>
        `}

        <div class="footer">
          Smart Press Monitor v2.0 - プレス機管理システム
        </div>
    `
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto py-6 px-4">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-gray-600">機械情報を読み込んでいます...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoginForm />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto py-6 px-4">
          <div className="mb-6">
            <Link href="/machines">
              <Button variant="outline" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                プレス機一覧に戻る
              </Button>
            </Link>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <h2 className="text-lg font-semibold text-red-800">データ読み込みエラー</h2>
            </div>
            <p className="text-red-700 mt-2">プレス機情報の読み込み中にエラーが発生しました。ページを更新してもう一度お試しください。</p>
          </div>
        </div>
      </div>
    )
  }

  if (!machine) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto py-6 px-4">
          <div className="mb-6">
            <Link href="/machines">
              <Button variant="outline" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                プレス機一覧に戻る
              </Button>
            </Link>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-center">
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">機械が見つかりません</h2>
            <p className="text-yellow-700">指定された機械ID ({machineId}) は存在しないか、アクセス権限がありません。</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* ヘッダーセクション */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/machines" className="no-print">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  戻る
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  プレス機 #{machine.machine_number}
                </h1>
                <p className="text-gray-600">
                  {machine.maker || machine.manufacturer} {machine.model || machine.model_type}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 no-print">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                印刷
              </Button>
              <Link href={`/machines/${machineId}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  編集
                </Button>
              </Link>
              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                削除
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 詳細情報 - メインコンテンツ */}
          <div className="lg:col-span-2">
            <MachineDetail machine={machine} />
          </div>

          {/* サイドバー - メンテナンス関連 */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>最近のメンテナンス記録</CardTitle>
              </CardHeader>
              <CardContent>
                {maintenanceRecords.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-gray-500">
                      メンテナンス記録がありません
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {maintenanceRecords.map((record) => (
                      <div key={record.id} className="border rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">
                            {new Date(record.maintenance_date).toLocaleDateString('ja-JP')}
                          </span>
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant={record.overall_judgment === 'A:良好' ? 'default' : 
                                     record.overall_judgment === 'B:一部修理' ? 'outline' : 'destructive'}
                            >
                              {record.overall_judgment}
                            </Badge>
                            <Link href={`/maintenance/${record.id}/edit`}>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <Wrench className="w-3 h-3" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 space-y-1">
                          <p>クラッチバルブ: {record.clutch_valve_replacement}</p>
                          <p>ブレーキバルブ: {record.brake_valve_replacement}</p>
                          {record.remarks && <p>備考: {record.remarks}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* メンテナンス予定 */}
            <Card>
              <CardHeader>
                <CardTitle>メンテナンス予定</CardTitle>
              </CardHeader>
              <CardContent>
                {maintenanceSchedules.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-gray-500">
                      予定されたメンテナンスがありません
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      「新規メンテナンス予定」ボタンから予定を作成できます
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {maintenanceSchedules.map((schedule) => {
                      const isUpcoming = () => {
                        const today = new Date()
                        const scheduleDate = new Date(schedule.scheduled_date)
                        const diffTime = scheduleDate.getTime() - today.getTime()
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                        return diffDays <= 7 && diffDays >= 0
                      }

                      const isOverdue = () => {
                        if (schedule.status === 'completed' || schedule.status === 'cancelled') return false
                        const today = new Date()
                        const scheduleDate = new Date(schedule.scheduled_date)
                        return scheduleDate < today
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
                          case 'high': return 'bg-red-100 text-red-800'
                          case 'normal': return 'bg-secondary text-secondary-foreground'
                          case 'low': return 'bg-gray-100 text-gray-800'
                          default: return 'bg-gray-100 text-gray-800'
                        }
                      }

                      const getPriorityLabel = (priority: string) => {
                        const priorities: Record<string, string> = {
                          'high': '高', 'normal': '中', 'low': '低'
                        }
                        return priorities[priority] || priority
                      }

                      return (
                        <div 
                          key={schedule.id} 
                          className={`border rounded p-3 ${
                            isOverdue() ? 'bg-red-50 border-red-200' :
                            isUpcoming() ? 'bg-yellow-50 border-yellow-200' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <span className="text-sm font-medium">
                                {new Date(schedule.scheduled_date).toLocaleDateString('ja-JP')}
                              </span>
                              {isOverdue() && (
                                <Badge variant="destructive" className="text-xs">期限切れ</Badge>
                              )}
                              {isUpcoming() && (
                                <Badge variant="outline" className="text-xs">間もなく</Badge>
                              )}
                            </div>
                            <Link href={`/maintenance/schedules/${schedule.id}/edit`}>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <Wrench className="w-3 h-3" />
                              </Button>
                            </Link>
                          </div>
                          <div className="text-xs text-gray-500 space-y-1">
                            <div className="flex items-center justify-between">
                              <p>{getMaintenanceTypeLabel(schedule.maintenance_type)}</p>
                              <Badge className={`text-xs ${getPriorityColor(schedule.priority)}`}>
                                {getPriorityLabel(schedule.priority)}
                              </Badge>
                            </div>
                            {schedule.estimated_duration && (
                              <div className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <p>{schedule.estimated_duration}分</p>
                              </div>
                            )}
                            {schedule.assigned_technician && (
                              <p>担当: {schedule.assigned_technician}</p>
                            )}
                            {schedule.planned_work && (
                              <p className="truncate" title={schedule.planned_work}>
                                {schedule.planned_work}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* メンテナンス関連のアクションボタン */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col space-y-2">
                  <Link href={`/maintenance/schedules/new?machineId=${machineId}`}>
                    <Button variant="outline" className="w-full">
                      <Calendar className="w-4 h-4 mr-2" />
                      新規メンテナンス予定
                    </Button>
                  </Link>
                  <Link href={`/maintenance/new?machineId=${machineId}`}>
                    <Button variant="outline" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      新規メンテナンス記録
                    </Button>
                  </Link>
                  <Link href="/maintenance">
                    <Button variant="outline" className="w-full">
                      メンテナンス記録一覧
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}