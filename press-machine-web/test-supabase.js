const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://qlsntrswoaxdwrtobunw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsc250cnN3b2F4ZHdydG9idW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3OTA5MzQsImV4cCI6MjA3MjM2NjkzNH0.xPyzHzyrlrnB9lG5WdkrjPFnOxdQ_n5nI3fOqnD32Iw'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  console.log('Testing Supabase connection...')
  
  try {
    // Test basic connection
    const { data: healthCheck, error: healthError } = await supabase
      .from('orgs')
      .select('count')
      .limit(1)
    
    console.log('Health check:', { healthCheck, healthError })
    
    // Test orgs table
    const { data: orgs, error: orgsError } = await supabase
      .from('orgs')
      .select('*')
      .limit(5)
    
    console.log('Orgs:', { orgs, orgsError })
    
    // Test press_machines table
    const { data: machines, error: machinesError } = await supabase
      .from('press_machines')
      .select('*')
      .limit(5)
    
    console.log('Machines:', { machines, machinesError })
    
  } catch (error) {
    console.error('Test failed:', error)
  }
}

testConnection()