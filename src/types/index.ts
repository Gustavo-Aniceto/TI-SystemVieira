// Tipos de domínio alinhados ao schema do Supabase (ver supabase/migrations)

export type UserRole = 'usuario' | 'administrador' | 'supervisor' | 'estagiario';

export interface User {
  id: number;
  nome: string;
  nome_usuario: string;
  email: string;
  senha: string;
  funcao: UserRole;
  empresa_id: number | null;
  setor_id: number | null;
  criado_em: string;
}

export interface Company {
  id: number;
  nome: string;
  descricao: string | null;
  criado_em: string;
}

export interface Sector {
  id: number;
  nome: string;
  empresa_id: number;
  criado_em: string;
}

export interface Category {
  id: number;
  nome: string;
  descricao: string | null;
  criado_em: string;
}

export type ProductStatus = 'ativo' | 'inativo' | 'em_manutencao';

export interface Product {
  id: number;
  nome: string;
  descricao: string | null;
  categoria_id: number;
  status: ProductStatus;
  quantidade: number;
  quantidade_minima: number;
  numero_serie: string | null;
  localizacao: string | null;
  data_compra: string | null;
  fim_garantia: string | null;
  notas: string | null;
  criado_em: string;
}

export type EventType = 'assinatura' | 'tarefa' | 'lembrete';

export interface CalendarEvent {
  id: number;
  titulo: string;
  descricao: string | null;
  tipo: EventType;
  data_inicio: string;
  data_termino: string;
  cor: string | null;
  criado_em: string;
}

export interface Note {
  id: number;
  titulo: string;
  conteudo: string;
  cor_fundo: string | null;
  tornar_publico: boolean;
  criado_por: number | null;
  criado_em: string;
}

export interface PasswordEntry {
  id: number;
  sistema: string;
  usuario_acesso: string;
  senha_criptografada: string;
  categoria: string | null;
  observacoes: string | null;
  criado_por: number | null;
  criado_em: string;
}

export type TicketStatus = 'aberto' | 'em_andamento' | 'resolvido';

export interface Ticket {
  id: number;
  problema: string;
  supervisor_id: number;
  posicao_operador: string | null;
  empresa_id: number;
  setor_id: number;
  id_acesso: string | null;
  anexo: string | null;
  status: TicketStatus;
  criado_em: string;
  tipo_id: number | null;
  subtipo_id: number | null;
}

export interface TicketType {
  id: number;
  nome: string;
}

export interface TicketSubtype {
  id: number;
  tipo_id: number;
  nome: string;
}

/** Campos gerados pelo banco que não são enviados em inserts. */
export type NewRecord<T> = Omit<T, 'id' | 'criado_em'>;

export interface ReportFilters {
  categoryId?: number;
  status?: string;
  lowStock?: boolean;
  startDate?: string;
  endDate?: string;
  type?: string;
  supervisorId?: number;
}

// Rótulos de exibição
export const ROLE_LABELS: Record<UserRole, string> = {
  administrador: 'Administrador',
  usuario: 'Usuário',
  supervisor: 'Supervisor',
  estagiario: 'Estagiário',
};

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  ativo: 'Ativo',
  inativo: 'Inativo',
  em_manutencao: 'Em manutenção',
};

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  assinatura: 'Assinatura',
  tarefa: 'Tarefa',
  lembrete: 'Lembrete',
};

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  aberto: 'Aberto',
  em_andamento: 'Em andamento',
  resolvido: 'Resolvido',
};
