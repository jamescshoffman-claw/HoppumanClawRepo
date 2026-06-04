import { createClient } from '@supabase/supabase-js'

// Public, client-side values. The "publishable" (anon) key is designed to be
// exposed in the browser, so it is safe to commit and bundle into the static
// site. Security is enforced server-side by Row-Level Security policies (see
// supabase/typeracer.sql), NOT by hiding this key.
//
// These point at the same Supabase project already used by geostudy. Swap them
// for your own project's URL + publishable key if you'd rather keep things
// separate — then run supabase/typeracer.sql against that project.
const SUPABASE_URL = 'https://sofrzvspjrvtovksjdvi.supabase.co'
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_Zh07DXhCr6jAcy1ZDAiviQ_XPFjings'

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
