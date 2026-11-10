import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** Indica se as variáveis de ambiente do Supabase foram definidas. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Com valores de fallback o app consegue renderizar a tela de configuração
// em vez de quebrar no import quando o .env está ausente.
export const supabase = createClient(
  supabaseUrl || 'http://localhost:54321',
  supabaseAnonKey || 'public-anon-key'
);

/** Colunas de `usuarios` expostas pela API (a coluna `senha` não é legível). */
export const USER_COLUMNS = 'id, nome, nome_usuario, email, funcao, empresa_id, setor_id, criado_em';
