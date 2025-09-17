import { createClient } from '@supabase/supabase-js'

// Supabase設定
const supabaseUrl = 'https://qlsntrswoaxdwrtobunw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsc250cnN3b2F4ZHdydG9idW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3OTA5MzQsImV4cCI6MjA3MjM2NjkzNH0.xPyzHzyrlrnB9lG5WdkrjPFnOxdQ_n5nI3fOqnD32Iw'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDatabase() {
  console.log('=== Supabase データベース確認 ===\n')
  
  try {
    // 1. press_machines テーブルの全データを取得
    console.log('1. プレス機データの確認...')
    const { data: machines, error: machinesError } = await supabase
      .from('press_machines')
      .select('*')
      .order('id', { ascending: true })

    if (machinesError) {
      console.error('❌ プレス機データ取得エラー:', machinesError)
      return
    }

    console.log(`✅ プレス機データ: ${machines.length}件`)
    
    // 各機械の詳細情報を確認
    machines.forEach((machine, index) => {
      console.log(`\n--- プレス機 ${index + 1} ---`)
      console.log(`ID: ${machine.id}`)
      console.log(`機械番号: ${machine.machine_number}`)
      console.log(`メーカー: ${machine.manufacturer}`)
      console.log(`型式: ${machine.model_type}`)
      
      // 新しい詳細仕様カラムの確認
      console.log(`\n【詳細仕様の確認】`)
      console.log(`maker: ${machine.maker || '未設定'}`)
      console.log(`model: ${machine.model || '未設定'}`)
      console.log(`serial_no: ${machine.serial_no || '未設定'}`)
      console.log(`製造年月: ${machine.manufacture_year || '未設定'}年${machine.manufacture_month || '未設定'}月`)
      console.log(`capacity_kn: ${machine.capacity_kn || '未設定'}`)
      console.log(`capacity_ton: ${machine.capacity_ton || '未設定'}`)
      console.log(`die_height_mm: ${machine.die_height_mm || '未設定'}`)
      console.log(`stroke_spm_min: ${machine.stroke_spm_min || '未設定'}`)
      console.log(`stroke_spm_max: ${machine.stroke_spm_max || '未設定'}`)
      console.log(`slide_size_lr_mm: ${machine.slide_size_lr_mm || '未設定'}`)
      console.log(`notes: ${machine.notes || '未設定'}`)
    })

    // 2. 特定のプレス機の詳細情報確認（機械番号010）
    console.log('\n\n2. 機械番号010の詳細確認...')
    const { data: machine010, error: machine010Error } = await supabase
      .from('press_machines')
      .select('*')
      .eq('machine_number', '010')
      .single()

    if (machine010Error) {
      console.error('❌ 機械番号010取得エラー:', machine010Error)
    } else {
      console.log('✅ 機械番号010のデータ:')
      console.log(JSON.stringify(machine010, null, 2))
    }

  } catch (err) {
    console.error('❌ データベース確認中にエラー:', err)
  }
}

// メイン実行
checkDatabase().catch(console.error)