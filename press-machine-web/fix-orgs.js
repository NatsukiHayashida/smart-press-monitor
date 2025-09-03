const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://qlsntrswoaxdwrtobunw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsc250cnN3b2F4ZHdydG9idW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3OTA5MzQsImV4cCI6MjA3MjM2NjkzNH0.xPyzHzyrlrnB9lG5WdkrjPFnOxdQ_n5nI3fOqnD32Iw'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function fixOrgsAndProfiles() {
  console.log('Fixing orgs table and profiles...')
  
  // The org_id used in the press_machines data
  const orgId = 'c897453e-14c7-4335-bdb4-91978778d95b'
  
  try {
    // 1. Create organization
    const { data: org, error: orgError } = await supabase
      .from('orgs')
      .insert({
        id: orgId,
        name: 'プレス工場'
      })
      .select()
    
    console.log('Created org:', { org, orgError })
    
    // 2. Check existing profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
    
    console.log('Existing profiles:', { profiles, profilesError })
    
    // 3. Update profiles to have org_id (if any exist)
    if (profiles && profiles.length > 0) {
      for (const profile of profiles) {
        const { data: updated, error: updateError } = await supabase
          .from('profiles')
          .update({ org_id: orgId })
          .eq('user_id', profile.user_id)
          .select()
        
        console.log(`Updated profile ${profile.user_id}:`, { updated, updateError })
      }
    }
    
    // 4. Verify the fix
    const { data: finalOrgs, error: finalOrgsError } = await supabase
      .from('orgs')
      .select('*')
    
    console.log('Final orgs:', { finalOrgs, finalOrgsError })
    
    const { data: finalProfiles, error: finalProfilesError } = await supabase
      .from('profiles')
      .select('*')
    
    console.log('Final profiles:', { finalProfiles, finalProfilesError })
    
  } catch (error) {
    console.error('Fix failed:', error)
  }
}

fixOrgsAndProfiles()