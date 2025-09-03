import { createClient } from '@supabase/supabase-js'

// Supabase設定
const supabaseUrl = 'https://qlsntrswoaxdwrtobunw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsc250cnN3b2F4ZHdydG9idW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3OTA5MzQsImV4cCI6MjA3MjM2NjkzNH0.xPyzHzyrlrnB9lG5WdkrjPFnOxdQ_n5nI3fOqnD32Iw'

const supabase = createClient(supabaseUrl, supabaseKey)

async function updateSchema() {
  console.log('データベーススキーマを更新しています...')
  
  // 詳細仕様カラムを追加するSQL
  const schemaUpdateSQL = `
    -- プレス機テーブルに詳細仕様カラムを追加
    ALTER TABLE public.press_machines 
    ADD COLUMN IF NOT EXISTS maker text,
    ADD COLUMN IF NOT EXISTS model text,
    ADD COLUMN IF NOT EXISTS serial_no text,
    ADD COLUMN IF NOT EXISTS manufacture_year int,
    ADD COLUMN IF NOT EXISTS manufacture_month int,
    ADD COLUMN IF NOT EXISTS capacity_kn numeric,
    ADD COLUMN IF NOT EXISTS capacity_ton numeric,
    ADD COLUMN IF NOT EXISTS stroke_spm_min numeric,
    ADD COLUMN IF NOT EXISTS stroke_spm_max numeric,
    ADD COLUMN IF NOT EXISTS stroke_length_mm numeric,
    ADD COLUMN IF NOT EXISTS die_height_mm numeric,
    ADD COLUMN IF NOT EXISTS slide_adjust_mm numeric,
    ADD COLUMN IF NOT EXISTS slide_size_lr_mm numeric,
    ADD COLUMN IF NOT EXISTS slide_size_fb_mm numeric,
    ADD COLUMN IF NOT EXISTS bolster_size_lr_mm numeric,
    ADD COLUMN IF NOT EXISTS bolster_size_fb_mm numeric,
    ADD COLUMN IF NOT EXISTS bolster_thickness_mm numeric,
    ADD COLUMN IF NOT EXISTS max_down_speed_mm_s numeric,
    ADD COLUMN IF NOT EXISTS stop_time_emergency_ms numeric,
    ADD COLUMN IF NOT EXISTS stop_time_twohand_ms numeric,
    ADD COLUMN IF NOT EXISTS stop_time_light_ms numeric,
    ADD COLUMN IF NOT EXISTS inertia_drop_mm numeric,
    ADD COLUMN IF NOT EXISTS max_upper_die_weight_kg numeric,
    ADD COLUMN IF NOT EXISTS ambient_temp_min_c numeric,
    ADD COLUMN IF NOT EXISTS ambient_temp_max_c numeric,
    ADD COLUMN IF NOT EXISTS motor_power_kw numeric,
    ADD COLUMN IF NOT EXISTS power_spec_text text,
    ADD COLUMN IF NOT EXISTS air_pressure_mpa numeric,
    ADD COLUMN IF NOT EXISTS air_pressure_kgf_cm2 numeric,
    ADD COLUMN IF NOT EXISTS overrun_angle_min_deg numeric,
    ADD COLUMN IF NOT EXISTS overrun_angle_max_deg numeric,
    ADD COLUMN IF NOT EXISTS notes text;
  `

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: schemaUpdateSQL })
    
    if (error) {
      console.error('スキーマ更新エラー:', error)
      console.log('注意: このエラーは、anon keyではDDL操作ができないためです。')
      console.log('Service roleキーまたはSupabase SQL Editorが必要です。')
      return false
    }
    
    console.log('スキーマ更新完了:', data)
    return true
  } catch (err) {
    console.error('実行エラー:', err)
    return false
  }
}

async function insertSampleData() {
  console.log('サンプルデータを挿入しています...')
  
  // KOMATSU H1F200-11のサンプルデータ
  const komatuData = {
    org_id: '550e8400-e29b-41d4-a716-446655440000',
    machine_number: '010',
    equipment_number: '25',
    manufacturer: 'KOMATSU',
    model_type: 'H1F200-11',
    machine_type: '圧造',
    production_group: 1,
    maker: 'KOMATSU',
    model: 'H1F200-11',
    serial_no: '10125',
    manufacture_year: 2007,
    manufacture_month: 8,
    capacity_kn: 2000,
    stroke_spm_min: 35,
    stroke_spm_max: 35,
    stroke_length_mm: 250,
    die_height_mm: 520,
    slide_adjust_mm: 120,
    slide_size_lr_mm: 850,
    slide_size_fb_mm: 720,
    bolster_size_lr_mm: 1200,
    bolster_size_fb_mm: 840,
    bolster_thickness_mm: 190,
    max_down_speed_mm_s: 382,
    stop_time_emergency_ms: 200,
    inertia_drop_mm: 35,
    max_upper_die_weight_kg: 650,
    ambient_temp_min_c: 5,
    ambient_temp_max_c: 40,
    notes: 'スライド寸法/ボルスタ寸法は銘板表記。'
  }

  try {
    const { data, error } = await supabase
      .from('press_machines')
      .upsert(komatuData, { 
        onConflict: 'org_id,machine_number',
        ignoreDuplicates: false 
      })
      
    if (error) {
      console.error('データ挿入エラー:', error)
      return false
    }
    
    console.log('KOMATSUサンプルデータ挿入完了:', data)
    return true
  } catch (err) {
    console.error('実行エラー:', err)
    return false
  }
}

// メイン実行
async function main() {
  console.log('=== Smart Press Monitor データベース更新 ===')
  
  // スキーマ更新を試行
  const schemaUpdated = await updateSchema()
  
  // サンプルデータ挿入
  const dataInserted = await insertSampleData()
  
  if (dataInserted) {
    console.log('✅ 処理完了！詳細ページを確認してください。')
  } else {
    console.log('❌ 処理に失敗しました。')
  }
}

main().catch(console.error)