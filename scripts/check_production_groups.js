import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qlsntrswoaxdwrtobunw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsc250cnN3b2F4ZHdydG9idW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3OTA5MzQsImV4cCI6MjA3MjM2NjkzNH0.xPyzHzyrlrnB9lG5WdkrjPFnOxdQ_n5nI3fOqnD32Iw'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkProductionGroups() {
  console.log('=== 生産グループ確認 ===\n')
  
  try {
    const { data, error } = await supabase
      .from('press_machines')
      .select('id, org_id, machine_number, production_group')
      .order('id')

    if (error) {
      console.error('❌ 取得エラー:', error.message)
      return
    }
    
    console.log('📋 現在の機械と生産グループ:')
    data.forEach(machine => {
      console.log(`  ID: ${machine.id}, 機械番号: ${machine.machine_number}, 生産グループ: ${machine.production_group}, org_id: ${machine.org_id}`)
    })
    
    // ユニークな生産グループを表示
    const uniqueGroups = [...new Set(data.map(m => m.production_group))].filter(g => g)
    console.log('\n🔍 現在の生産グループ種別:')
    uniqueGroups.forEach(group => {
      console.log(`  - ${group}`)
    })
    
    // org_id の確認
    const uniqueOrgIds = [...new Set(data.map(m => m.org_id))].filter(id => id)
    console.log('\n🏢 現在のorg_id:')
    uniqueOrgIds.forEach(orgId => {
      console.log(`  - ${orgId}`)
    })
    
  } catch (err) {
    console.error('❌ 処理エラー:', err.message)
  }
}

checkProductionGroups().catch(console.error)