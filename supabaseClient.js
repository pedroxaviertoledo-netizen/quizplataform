import { createClient } from '@supabase/supabase-js'

// Seus dados reais e oficiais do projeto Supabase
const supabaseUrl = 'https://supabase.co'
const supabaseAnonKey = 'sb_publishable__dqFtO5TMNDKjAiMOJYIMA_P__sHyqQ'

// Esta linha ativa a conexão direta entre o GitHub Pages e seu banco de dados
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
