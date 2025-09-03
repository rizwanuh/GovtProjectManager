import { createClient } from '@supabase/supabase-js'
import { projectId, publicAnonKey } from './info'

const supabaseUrl = `https://${projectId}.supabase.co`

export const supabase = createClient(supabaseUrl, publicAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'project-manager-auth',
  },
})

export default supabase