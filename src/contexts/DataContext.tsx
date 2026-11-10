import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { supabase, USER_COLUMNS } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { generateExcel, formatDate, formatDateTime, ExcelRow } from '../utils/excelUtils';
import {
  Category,
  Product,
  CalendarEvent,
  User,
  Company,
  Sector,
  Ticket,
  TicketType,
  TicketSubtype,
  Note,
  PasswordEntry,
  NewRecord,
  ReportFilters,
  PRODUCT_STATUS_LABELS,
  EVENT_TYPE_LABELS,
  TICKET_STATUS_LABELS,
  ROLE_LABELS,
} from '../types';

/** Usuário como retornado pela API (sem a coluna senha). */
export type AppUser = Omit<User, 'senha'>;

export type ReportType = 'products' | 'categories' | 'events' | 'tickets' | 'users';

type Add<T> = (data: NewRecord<T>) => Promise<boolean>;
type AddNoMeta<T> = (data: Omit<T, 'id'>) => Promise<boolean>;
type Update<T> = (id: number, data: Partial<T>) => Promise<boolean>;
type Remove = (id: number) => Promise<boolean>;

interface DataContextType {
  loading: boolean;
  refreshData: () => Promise<void>;

  categories: Category[];
  addCategory: Add<Category>;
  updateCategory: Update<Category>;
  deleteCategory: Remove;

  products: Product[];
  addProduct: Add<Product>;
  updateProduct: Update<Product>;
  deleteProduct: Remove;
  getLowStockProducts: () => Product[];
  adjustProductQuantity: (id: number, adjustment: number, reason?: string) => Promise<boolean>;

  events: CalendarEvent[];
  addEvent: Add<CalendarEvent>;
  updateEvent: Update<CalendarEvent>;
  deleteEvent: Remove;

  users: AppUser[];
  addUser: Add<User>;
  updateUser: Update<User>;
  deleteUser: Remove;

  companies: Company[];
  addCompany: Add<Company>;
  updateCompany: Update<Company>;
  deleteCompany: Remove;

  sectors: Sector[];
  addSector: Add<Sector>;
  updateSector: Update<Sector>;
  deleteSector: Remove;

  notes: Note[];
  addNote: Add<Note>;
  updateNote: Update<Note>;
  deleteNote: Remove;

  passwords: PasswordEntry[];
  addPassword: Add<PasswordEntry>;
  updatePassword: Update<PasswordEntry>;
  deletePassword: Remove;

  tickets: Ticket[];
  addTicket: Add<Ticket>;
  updateTicket: Update<Ticket>;
  deleteTicket: Remove;

  ticketTypes: TicketType[];
  addTicketType: AddNoMeta<TicketType>;
  updateTicketType: Update<TicketType>;
  deleteTicketType: Remove;

  ticketSubtypes: TicketSubtype[];
  addTicketSubtype: AddNoMeta<TicketSubtype>;
  updateTicketSubtype: Update<TicketSubtype>;
  deleteTicketSubtype: Remove;

  generateReport: (type: ReportType, filters?: ReportFilters, rows?: ExcelRow[]) => void;
}

const DataContext = createContext<DataContextType>({} as DataContextType);

// eslint-disable-next-line react-refresh/only-export-components
export const useData = () => useContext(DataContext);

type Setter<T> = React.Dispatch<React.SetStateAction<T[]>>;
type WithId = { id: number };

const describeError = (error: unknown): string => {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code?: string }).code;
    if (code === '23505') return 'Já existe um registro com esses dados.';
    if (code === '23503') return 'O registro está em uso por outros dados.';
  }
  return '';
};

/**
 * Cria funções de inserir/atualizar/excluir para uma tabela, mantendo o
 * estado local sincronizado e exibindo notificações.
 */
function crud<T extends WithId, TInsert>(
  table: string,
  setState: Setter<T>,
  label: { singular: string; feminine?: boolean },
  columns = '*'
) {
  const done = label.feminine ? 'a' : 'o';
  const fail = (action: string, error: unknown) => {
    console.error(`Erro ao ${action} ${label.singular}:`, error);
    const detail = describeError(error);
    toast.error(`Erro ao ${action} ${label.singular}.${detail ? ' ' + detail : ''}`);
    return false;
  };

  const add = async (payload: TInsert): Promise<boolean> => {
    const { data, error } = await supabase.from(table).insert(payload).select(columns).single();
    if (error) return fail('adicionar', error);
    setState(prev => [...prev, data as unknown as T]);
    toast.success(`${capitalize(label.singular)} adicionad${done} com sucesso!`);
    return true;
  };

  const update = async (id: number, payload: Partial<T>): Promise<boolean> => {
    const { data, error } = await supabase.from(table).update(payload).eq('id', id).select(columns).single();
    if (error) return fail('atualizar', error);
    setState(prev => prev.map(item => (item.id === id ? { ...item, ...(data as unknown as T) } : item)));
    toast.success(`${capitalize(label.singular)} atualizad${done} com sucesso!`);
    return true;
  };

  const remove = async (id: number): Promise<boolean> => {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) return fail('excluir', error);
    setState(prev => prev.filter(item => item.id !== id));
    toast.success(`${capitalize(label.singular)} excluíd${done} com sucesso!`);
    return true;
  };

  return { add, update, remove };
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Remove a senha vazia de atualizações para não sobrescrevê-la. */
const sanitizeUserUpdate = (data: Partial<User>): Partial<User> => {
  const { senha, ...rest } = data;
  return senha ? { ...rest, senha } : rest;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [ticketSubtypes, setTicketSubtypes] = useState<TicketSubtype[]>([]);

  const userId = user?.id;

  const loadData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const results = await Promise.all([
        supabase.from('categorias').select('*').order('nome'),
        supabase.from('produtos').select('*').order('nome'),
        supabase.from('eventos_calendario').select('*').order('data_inicio'),
        supabase.from('usuarios').select(USER_COLUMNS).order('nome'),
        supabase.from('empresas').select('*').order('nome'),
        supabase.from('setores').select('*').order('nome'),
        supabase.from('chamados').select('*').order('criado_em', { ascending: false }),
        supabase.from('anotacoes').select('*').order('criado_em', { ascending: false }),
        supabase.from('senhas').select('*').eq('criado_por', userId).order('sistema'),
        supabase.from('tipos_chamado').select('*').order('nome'),
        supabase.from('subtipos_chamado').select('*').order('nome'),
      ]);

      const failed = results.filter(r => r.error);
      if (failed.length > 0) {
        failed.forEach(r => console.error('Erro ao carregar dados:', r.error));
        toast.error('Alguns dados não puderam ser carregados.');
      }

      const [cat, prod, ev, usr, comp, sect, tick, nts, pwd, tt, ts] = results;
      setCategories((cat.data as Category[]) || []);
      setProducts((prod.data as Product[]) || []);
      setEvents((ev.data as CalendarEvent[]) || []);
      setUsers((usr.data as unknown as AppUser[]) || []);
      setCompanies((comp.data as Company[]) || []);
      setSectors((sect.data as Sector[]) || []);
      setTickets((tick.data as Ticket[]) || []);
      setNotes((nts.data as Note[]) || []);
      setPasswords((pwd.data as PasswordEntry[]) || []);
      setTicketTypes((tt.data as TicketType[]) || []);
      setTicketSubtypes((ts.data as TicketSubtype[]) || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do sistema');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // CRUD genérico ------------------------------------------------------------
  const categoryOps = crud<Category, NewRecord<Category>>('categorias', setCategories, { singular: 'categoria', feminine: true });
  const productOps = crud<Product, NewRecord<Product>>('produtos', setProducts, { singular: 'produto' });
  const eventOps = crud<CalendarEvent, NewRecord<CalendarEvent>>('eventos_calendario', setEvents, { singular: 'evento' });
  const userOps = crud<AppUser, NewRecord<User>>('usuarios', setUsers, { singular: 'usuário' }, USER_COLUMNS);
  const companyOps = crud<Company, NewRecord<Company>>('empresas', setCompanies, { singular: 'empresa', feminine: true });
  const sectorOps = crud<Sector, NewRecord<Sector>>('setores', setSectors, { singular: 'setor' });
  const noteOps = crud<Note, NewRecord<Note>>('anotacoes', setNotes, { singular: 'anotação', feminine: true });
  const passwordOps = crud<PasswordEntry, NewRecord<PasswordEntry>>('senhas', setPasswords, { singular: 'senha', feminine: true });
  const ticketOps = crud<Ticket, NewRecord<Ticket>>('chamados', setTickets, { singular: 'chamado' });
  const typeOps = crud<TicketType, Omit<TicketType, 'id'>>('tipos_chamado', setTicketTypes, { singular: 'tipo de chamado' });
  const subtypeOps = crud<TicketSubtype, Omit<TicketSubtype, 'id'>>('subtipos_chamado', setTicketSubtypes, { singular: 'subtipo de chamado' });

  const warnLowStock = (product?: Product) => {
    if (product && product.quantidade <= product.quantidade_minima) {
      toast(`Atenção: ${product.nome} está com estoque baixo!`, { icon: '⚠️' });
    }
  };

  // Regras específicas -------------------------------------------------------
  const deleteCategory: Remove = async id => {
    if (products.some(p => p.categoria_id === id)) {
      toast.error('Esta categoria não pode ser excluída porque está sendo usada por produtos.');
      return false;
    }
    return categoryOps.remove(id);
  };

  const addProduct: Add<Product> = async data => {
    const ok = await productOps.add(data);
    if (ok) warnLowStock(data as Product);
    return ok;
  };

  const updateProduct: Update<Product> = async (id, data) => {
    const ok = await productOps.update(id, data);
    if (ok) {
      const current = products.find(p => p.id === id);
      warnLowStock(current ? { ...current, ...data } : undefined);
    }
    return ok;
  };

  const adjustProductQuantity = async (id: number, adjustment: number, reason?: string) => {
    const product = products.find(p => p.id === id);
    if (!product) {
      toast.error('Produto não encontrado');
      return false;
    }

    const newQuantity = Math.max(0, product.quantidade + adjustment);
    const applied = newQuantity - product.quantidade;
    if (applied === 0) {
      toast.error('O estoque já está zerado.');
      return false;
    }

    const { error } = await supabase.from('produtos').update({ quantidade: newQuantity }).eq('id', id);
    if (error) {
      console.error('Erro ao ajustar quantidade:', error);
      toast.error('Erro ao ajustar quantidade');
      return false;
    }

    setProducts(prev => prev.map(p => (p.id === id ? { ...p, quantidade: newQuantity } : p)));

    const { error: movementError } = await supabase.from('movimentacoes_estoque').insert({
      produto_id: id,
      tipo: applied > 0 ? 'entrada' : 'saida',
      quantidade: Math.abs(applied),
      observacao: reason || (applied > 0 ? 'Entrada manual' : 'Saída manual'),
      usuario_id: userId ?? null,
    });
    if (movementError) console.error('Erro ao registrar movimentação:', movementError);

    toast.success(`${Math.abs(applied)} unidade(s) ${applied > 0 ? 'adicionada(s)' : 'removida(s)'}.`);
    warnLowStock({ ...product, quantidade: newQuantity });
    return true;
  };

  const getLowStockProducts = useCallback(
    () => products.filter(p => p.quantidade <= p.quantidade_minima),
    [products]
  );

  const deleteCompany: Remove = async id => {
    if (users.some(u => u.empresa_id === id)) {
      toast.error('Esta empresa não pode ser excluída porque possui usuários vinculados.');
      return false;
    }
    if (tickets.some(t => t.empresa_id === id)) {
      toast.error('Esta empresa não pode ser excluída porque possui chamados vinculados.');
      return false;
    }
    const ok = await companyOps.remove(id);
    if (ok) setSectors(prev => prev.filter(s => s.empresa_id !== id));
    return ok;
  };

  const deleteSector: Remove = async id => {
    if (tickets.some(t => t.setor_id === id)) {
      toast.error('Este setor não pode ser excluído porque possui chamados vinculados.');
      return false;
    }
    return sectorOps.remove(id);
  };

  const updateUser: Update<User> = (id, data) => userOps.update(id, sanitizeUserUpdate(data) as Partial<AppUser>);

  const deleteUser: Remove = async id => {
    if (id === userId) {
      toast.error('Você não pode excluir o próprio usuário.');
      return false;
    }
    const target = users.find(u => u.id === id);
    const admins = users.filter(u => u.funcao === 'administrador');
    if (target?.funcao === 'administrador' && admins.length <= 1) {
      toast.error('Não é possível excluir o último usuário administrador.');
      return false;
    }
    if (tickets.some(t => t.supervisor_id === id)) {
      toast.error('Este usuário possui chamados vinculados e não pode ser excluído.');
      return false;
    }
    return userOps.remove(id);
  };

  const deleteTicketType: Remove = async id => {
    const ok = await typeOps.remove(id);
    if (ok) setTicketSubtypes(prev => prev.filter(s => s.tipo_id !== id));
    return ok;
  };

  // Relatórios ---------------------------------------------------------------
  const generateReport = (type: ReportType, filters: ReportFilters = {}, customRows?: ExcelRow[]) => {
    const inRange = (date: string) => {
      const d = new Date(date);
      if (filters.startDate && d < new Date(`${filters.startDate}T00:00:00`)) return false;
      if (filters.endDate && d > new Date(`${filters.endDate}T23:59:59`)) return false;
      return true;
    };

    let rows: ExcelRow[] = customRows ?? [];

    if (!customRows) {
      switch (type) {
        case 'products':
          rows = products
            .filter(p => !filters.categoryId || p.categoria_id === filters.categoryId)
            .filter(p => !filters.status || p.status === filters.status)
            .filter(p => !filters.lowStock || p.quantidade <= p.quantidade_minima)
            .map(p => ({
              ID: p.id,
              Nome: p.nome,
              Categoria: categories.find(c => c.id === p.categoria_id)?.nome ?? 'Sem categoria',
              Quantidade: p.quantidade,
              'Quantidade Mínima': p.quantidade_minima,
              Status: PRODUCT_STATUS_LABELS[p.status] ?? p.status,
              'Número de Série': p.numero_serie ?? '',
              Localização: p.localizacao ?? '',
              'Data de Compra': formatDate(p.data_compra),
              'Fim da Garantia': formatDate(p.fim_garantia),
              'Data de Criação': formatDate(p.criado_em),
            }));
          break;

        case 'categories':
          rows = categories.map(c => ({
            ID: c.id,
            Nome: c.nome,
            Descrição: c.descricao ?? '',
            Produtos: products.filter(p => p.categoria_id === c.id).length,
            'Data de Criação': formatDate(c.criado_em),
          }));
          break;

        case 'events':
          rows = events
            .filter(e => inRange(e.data_inicio))
            .filter(e => !filters.type || e.tipo === filters.type)
            .map(e => ({
              ID: e.id,
              Título: e.titulo,
              Tipo: EVENT_TYPE_LABELS[e.tipo] ?? e.tipo,
              'Data de Início': formatDateTime(e.data_inicio),
              'Data de Término': formatDateTime(e.data_termino),
              Descrição: e.descricao ?? '',
            }));
          break;

        case 'tickets':
          rows = tickets
            .filter(t => !filters.status || t.status === filters.status)
            .filter(t => !filters.supervisorId || t.supervisor_id === filters.supervisorId)
            .filter(t => inRange(t.criado_em))
            .map(t => ({
              ID: t.id,
              Problema: t.problema,
              Status: TICKET_STATUS_LABELS[t.status] ?? t.status,
              Supervisor: users.find(u => u.id === t.supervisor_id)?.nome ?? '',
              Empresa: companies.find(c => c.id === t.empresa_id)?.nome ?? '',
              Setor: sectors.find(s => s.id === t.setor_id)?.nome ?? '',
              Tipo: ticketTypes.find(tt => tt.id === t.tipo_id)?.nome ?? '',
              Subtipo: ticketSubtypes.find(s => s.id === t.subtipo_id)?.nome ?? '',
              'Posição do Operador': t.posicao_operador ?? '',
              'ID de Acesso': t.id_acesso ?? '',
              'Data de Criação': formatDateTime(t.criado_em),
            }));
          break;

        case 'users':
          rows = users.map(u => ({
            ID: u.id,
            Nome: u.nome,
            Usuário: u.nome_usuario,
            Email: u.email,
            Função: ROLE_LABELS[u.funcao] ?? u.funcao,
            Empresa: companies.find(c => c.id === u.empresa_id)?.nome ?? '',
            Setor: sectors.find(s => s.id === u.setor_id)?.nome ?? '',
            'Data de Criação': formatDate(u.criado_em),
          }));
          break;
      }
    }

    if (rows.length === 0) {
      toast.error('Nenhum registro encontrado para os filtros selecionados.');
      return;
    }

    generateExcel(type, rows)
      .then(() => toast.success(`Relatório gerado com ${rows.length} registro(s)!`))
      .catch(error => {
        console.error('Erro ao gerar relatório:', error);
        toast.error('Erro ao gerar o arquivo do relatório.');
      });
  };

  return (
    <DataContext.Provider
      value={{
        loading,
        refreshData: loadData,

        categories,
        addCategory: categoryOps.add,
        updateCategory: categoryOps.update,
        deleteCategory,

        products,
        addProduct,
        updateProduct,
        deleteProduct: productOps.remove,
        getLowStockProducts,
        adjustProductQuantity,

        events,
        addEvent: eventOps.add,
        updateEvent: eventOps.update,
        deleteEvent: eventOps.remove,

        users,
        addUser: userOps.add,
        updateUser,
        deleteUser,

        companies,
        addCompany: companyOps.add,
        updateCompany: companyOps.update,
        deleteCompany,

        sectors,
        addSector: sectorOps.add,
        updateSector: sectorOps.update,
        deleteSector,

        notes,
        addNote: noteOps.add,
        updateNote: noteOps.update,
        deleteNote: noteOps.remove,

        passwords,
        addPassword: passwordOps.add,
        updatePassword: passwordOps.update,
        deletePassword: passwordOps.remove,

        tickets,
        addTicket: ticketOps.add,
        updateTicket: ticketOps.update,
        deleteTicket: ticketOps.remove,

        ticketTypes,
        addTicketType: typeOps.add,
        updateTicketType: typeOps.update,
        deleteTicketType,

        ticketSubtypes,
        addTicketSubtype: subtypeOps.add,
        updateTicketSubtype: subtypeOps.update,
        deleteTicketSubtype: subtypeOps.remove,

        generateReport,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
