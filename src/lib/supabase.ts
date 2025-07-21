import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variáveis de ambiente do Supabase não encontradas. Clique em "Connect to Supabase" no canto superior direito.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para o banco de dados
export interface Database {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: number
          nome: string
          nome_usuario: string
          email: string
          senha: string
          funcao: 'usuario' | 'administrador' | 'supervisor' | 'estagiario'
          empresa_id: number
          setor_id: number | null
          criado_em: string
        }
        Insert: {
          nome: string
          nome_usuario: string
          email: string
          senha: string
          funcao?: 'usuario' | 'administrador' | 'supervisor' | 'estagiario'
          empresa_id: number
          setor_id?: number | null
        }
        Update: {
          nome?: string
          nome_usuario?: string
          email?: string
          senha?: string
          funcao?: 'usuario' | 'administrador' | 'supervisor' | 'estagiario'
          empresa_id?: number
          setor_id?: number | null
        }
      }
      empresas: {
        Row: {
          id: number
          nome: string
          descricao: string | null
          criado_em: string
        }
        Insert: {
          nome: string
          descricao?: string | null
        }
        Update: {
          nome?: string
          descricao?: string | null
        }
      }
      setores: {
        Row: {
          id: number
          nome: string
          empresa_id: number
          criado_em: string
        }
        Insert: {
          nome: string
          empresa_id: number
        }
        Update: {
          nome?: string
          empresa_id?: number
        }
      }
      categorias: {
        Row: {
          id: number
          nome: string
          descricao: string | null
          criado_em: string
        }
        Insert: {
          nome: string
          descricao?: string | null
        }
        Update: {
          nome?: string
          descricao?: string | null
        }
      }
      produtos: {
        Row: {
          id: number
          nome: string
          descricao: string | null
          categoria_id: number
          status: 'ativo' | 'inativo' | 'em_manutencao'
          quantidade: number
          quantidade_minima: number
          numero_serie: string | null
          localizacao: string | null
          data_compra: string | null
          fim_garantia: string | null
          notas: string | null
          criado_em: string
        }
        Insert: {
          nome: string
          descricao?: string | null
          categoria_id: number
          status?: 'ativo' | 'inativo' | 'em_manutencao'
          quantidade?: number
          quantidade_minima?: number
          numero_serie?: string | null
          localizacao?: string | null
          data_compra?: string | null
          fim_garantia?: string | null
          notas?: string | null
        }
        Update: {
          nome?: string
          descricao?: string | null
          categoria_id?: number
          status?: 'ativo' | 'inativo' | 'em_manutencao'
          quantidade?: number
          quantidade_minima?: number
          numero_serie?: string | null
          localizacao?: string | null
          data_compra?: string | null
          fim_garantia?: string | null
          notas?: string | null
        }
      }
      chamados: {
        Row: {
          id: number
          problema: string
          supervisor_id: number
          posicao_operador: string | null
          empresa_id: number
          setor_id: number
          id_acesso: string | null
          anexo: string | null
          status: 'aberto' | 'em_andamento' | 'resolvido'
          criado_em: string
          tipo_id: number | null
          subtipo_id: number | null
        }
        Insert: {
          problema: string
          supervisor_id: number
          posicao_operador?: string | null
          empresa_id: number
          setor_id: number
          id_acesso?: string | null
          anexo?: string | null
          status?: 'aberto' | 'em_andamento' | 'resolvido'
          tipo_id?: number | null
          subtipo_id?: number | null
        }
        Update: {
          problema?: string
          supervisor_id?: number
          posicao_operador?: string | null
          empresa_id?: number
          setor_id?: number
          id_acesso?: string | null
          anexo?: string | null
          status?: 'aberto' | 'em_andamento' | 'resolvido'
          tipo_id?: number | null
          subtipo_id?: number | null
        }
      }
      eventos_calendario: {
        Row: {
          id: number
          titulo: string
          descricao: string | null
          tipo: 'assinatura' | 'tarefa' | 'lembrete'
          data_inicio: string
          data_termino: string
          cor: string | null
          criado_em: string
        }
        Insert: {
          titulo: string
          descricao?: string | null
          tipo: 'assinatura' | 'tarefa' | 'lembrete'
          data_inicio: string
          data_termino: string
          cor?: string | null
        }
        Update: {
          titulo?: string
          descricao?: string | null
          tipo?: 'assinatura' | 'tarefa' | 'lembrete'
          data_inicio?: string
          data_termino?: string
          cor?: string | null
        }
      }
      anotacoes: {
        Row: {
          id: number
          titulo: string
          conteudo: string
          cor_fundo: string | null
          tornar_publico: boolean
          criado_por: number | null
          criado_em: string
        }
        Insert: {
          titulo: string
          conteudo: string
          cor_fundo?: string | null
          tornar_publico?: boolean
          criado_por?: number | null
        }
        Update: {
          titulo?: string
          conteudo?: string
          cor_fundo?: string | null
          tornar_publico?: boolean
          criado_por?: number | null
        }
      }
      senhas: {
        Row: {
          id: number
          sistema: string
          usuario_acesso: string
          senha_criptografada: string
          categoria: string | null
          observacoes: string | null
          criado_por: number | null
          criado_em: string
        }
        Insert: {
          sistema: string
          usuario_acesso: string
          senha_criptografada: string
          categoria?: string | null
          observacoes?: string | null
          criado_por?: number | null
        }
        Update: {
          sistema?: string
          usuario_acesso?: string
          senha_criptografada?: string
          categoria?: string | null
          observacoes?: string | null
          criado_por?: number | null
        }
      }
    }
  }
}