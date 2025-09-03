import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qlsntrswoaxdwrtobunw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsc250cnN3b2F4ZHdydG9idW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3OTA5MzQsImV4cCI6MjA3MjM2NjkzNH0.xPyzHzyrlrnB9lG5WdkrjPFnOxdQ_n5nI3fOqnD32Iw'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkProductionGroups() {
  console.log('=== 生産グループ確認 ===\n')
  
  try {
    const { data, error } = await supabase
      .from('production_groups')
      .select('*')
      .order('id')

    if (error) {
      console.error('❌ 取得エラー:', error.message)
      return
    }
    
    console.log('📋 現在の生産グループ:')
    data.forEach(group => {
      console.log(`  ID: ${group.id}, 名称: ${group.group_name}`)
    })
    
  } catch (err) {
    console.error('❌ 処理エラー:', err.message)
  }
}

checkProductionGroups().catch(console.error)