import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qlsntrswoaxdwrtobunw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsc250cnN3b2F4ZHdydG9idW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3OTA5MzQsImV4cCI6MjA3MjM2NjkzNH0.xPyzHzyrlrnB9lG5WdkrjPFnOxdQ_n5nI3fOqnD32Iw'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTables() {
  console.log('=== テーブル確認 ===\n')
  
  // 既知のテーブルをチェック
  const tablesToCheck = ['press_machines', 'groups', 'production_group', 'machine_groups']
  
  for (const tableName of tablesToCheck) {
    try {
      console.log(`📋 ${tableName} テーブル確認中...`)
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(5)

      if (error) {
        console.log(`❌ ${tableName}: ${error.message}`)
      } else {
        console.log(`✅ ${tableName}: ${data.length} 件のデータが存在`)
        if (data.length > 0) {
          console.log('  カラム:', Object.keys(data[0]).join(', '))
        }
      }
    } catch (err) {
      console.log(`❌ ${tableName}: ${err.message}`)
    }
    console.log('')
  }
}

checkTables().catch(console.error)