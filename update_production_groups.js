import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qlsntrswoaxdwrtobunw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsc250cnN3b2F4ZHdydG9idW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3OTA5MzQsImV4cCI6MjA3MjM2NjkzNH0.xPyzHzyrlrnB9lG5WdkrjPFnOxdQ_n5nI3fOqnD32Iw'

const supabase = createClient(supabaseUrl, supabaseKey)

// 生産グループの名称マッピング
const productionGroupNames = {
  1: '生産1',
  2: '生産2', 
  3: '生産3',
  30: '東大阪',
  32: '本社'
}

async function updateProductionGroups() {
  console.log('=== 生産グループ名称更新 ===\n')
  
  try {
    // 現在のデータを確認
    const { data: currentData, error: fetchError } = await supabase
      .from('press_machines')
      .select('id, machine_number, production_group, org_id')
      .order('id')

    if (fetchError) {
      console.error('❌ データ取得エラー:', fetchError.message)
      return
    }

    console.log('📋 更新対象:')
    const groupCounts = {}
    currentData.forEach(machine => {
      const group = machine.production_group
      groupCounts[group] = (groupCounts[group] || 0) + 1
    })

    Object.entries(groupCounts).forEach(([group, count]) => {
      const oldName = `グループ${group}`
      const newName = productionGroupNames[group] || `未定義グループ${group}`
      console.log(`  ${oldName} → ${newName} (${count}台)`)
    })

    // ID:30 と ID:32 の機械に新しいグループを割り当て
    const updates = []
    
    // ID:30 を東大阪グループに
    if (currentData.find(m => m.id === 30)) {
      updates.push({
        id: 30,
        production_group: 30,
        newGroupName: '東大阪'
      })
    }
    
    // ID:32 を本社グループに
    if (currentData.find(m => m.id === 32)) {
      updates.push({
        id: 32,
        production_group: 32,
        newGroupName: '本社'
      })
    }

    // 更新を実行
    for (const update of updates) {
      console.log(`\n🔄 ID:${update.id} を ${update.newGroupName} に更新中...`)
      
      const { error: updateError } = await supabase
        .from('press_machines')
        .update({ production_group: update.production_group })
        .eq('id', update.id)

      if (updateError) {
        console.error(`❌ ID:${update.id} 更新エラー:`, updateError.message)
      } else {
        console.log(`✅ ID:${update.id} を ${update.newGroupName} に更新完了`)
      }
    }

    // 更新後の状況を確認
    console.log('\n📊 更新後のグループ分布:')
    const { data: updatedData, error: finalError } = await supabase
      .from('press_machines')
      .select('production_group')
      .order('production_group')

    if (finalError) {
      console.error('❌ 最終確認エラー:', finalError.message)
      return
    }

    const finalCounts = {}
    updatedData.forEach(machine => {
      const group = machine.production_group
      finalCounts[group] = (finalCounts[group] || 0) + 1
    })

    Object.entries(finalCounts).forEach(([group, count]) => {
      const groupName = productionGroupNames[group] || `未定義グループ${group}`
      console.log(`  ${groupName}: ${count}台`)
    })

    console.log('\n✅ 生産グループ更新完了！')

  } catch (err) {
    console.error('❌ 処理エラー:', err.message)
  }
}

updateProductionGroups().catch(console.error)