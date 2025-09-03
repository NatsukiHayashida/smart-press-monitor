import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qlsntrswoaxdwrtobunw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsc250cnN3b2F4ZHdydG9idW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3OTA5MzQsImV4cCI6MjA3MjM2NjkzNH0.xPyzHzyrlrnB9lG5WdkrjPFnOxdQ_n5nI3fOqnD32Iw'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSpecificMachines() {
  console.log('=== 特定機械の詳細仕様確認 ===\n')
  
  const targetIds = [2, 10, 18]
  
  for (const id of targetIds) {
    console.log(`--- ID=${id}の確認 ---`)
    
    try {
      const { data, error } = await supabase
        .from('press_machines')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error(`❌ ID=${id} 取得エラー:`, error.message)
        continue
      }
      
      console.log(`✅ ID=${id} 基本情報:`)
      console.log(`  機械番号: ${data.machine_number}`)
      console.log(`  メーカー: ${data.manufacturer}`)
      console.log(`  型式: ${data.model_type}`)
      
      console.log(`📋 詳細仕様フィールド:`)
      console.log(`  maker: ${data.maker || '未設定'}`)
      console.log(`  model: ${data.model || '未設定'}`)
      console.log(`  serial_no: ${data.serial_no || '未設定'}`)
      console.log(`  manufacture_year: ${data.manufacture_year || '未設定'}`)
      console.log(`  capacity_kn: ${data.capacity_kn || '未設定'}`)
      console.log(`  capacity_ton: ${data.capacity_ton || '未設定'}`)
      console.log(`  die_height_mm: ${data.die_height_mm || '未設定'}`)
      console.log(`  stroke_spm_min: ${data.stroke_spm_min || '未設定'}`)
      console.log(`  stroke_spm_max: ${data.stroke_spm_max || '未設定'}`)
      console.log(`  slide_size_lr_mm: ${data.slide_size_lr_mm || '未設定'}`)
      console.log(`  motor_power_kw: ${data.motor_power_kw || '未設定'}`)
      console.log(`  notes: ${data.notes || '未設定'}`)
      
      // データ更新の判定
      const hasDetailedData = data.maker || data.die_height_mm || data.capacity_kn || data.notes
      console.log(`🔍 詳細データ更新状況: ${hasDetailedData ? '✅ 更新済み' : '❌ 未更新'}`)
      
    } catch (err) {
      console.error(`❌ ID=${id} 処理エラー:`, err.message)
    }
    
    console.log('')
  }
}

checkSpecificMachines().catch(console.error)