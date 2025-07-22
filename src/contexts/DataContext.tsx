import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { generateExcel } from '../utils/excelUtils';
import toast from 'react-hot-toast';

// Interfaces baseadas no schema do banco
interface Category {
  id: number;
  nome: string;
  descricao?: string;
  criado_em: string;
}

interface Product {
  id: number;
  nome: string;
  descricao?: string;
  categoria_id: number;
  status: 'ativo' | 'inativo' | 'em_manutencao';
  quantidade: number;
  quantidade_minima: number;
  numero_serie?: string;
  localizacao?: string;
  data_compra?: string;
  fim_garantia?: string;
  notas?: string;
  criado_em: string;
}

interface CalendarEvent {
  id: number;
  titulo: string;
  descricao?: string;
  tipo: 'assinatura' | 'tarefa' | 'lembrete';
  data_inicio: string;
  data_termino: string;
  cor?: string;
  criado_em: string;
}

interface User {
  id: number;
  nome: string;
  nome_usuario: string;
  email: string;
  senha: string;
  funcao: 'usuario' | 'administrador' | 'supervisor' | 'estagiario';
  empresa_id: number;
  setor_id?: number;
  criado_em: string;
}

interface Company {
  id: number;
  nome: string;
  descricao?: string;
  criado_em: string;
}

interface Sector {
  id: number;
  nome: string;
  empresa_id: number;
  criado_em: string;
}

interface TicketType {
  id: number;
  nome: string;
}

interface TicketSubtype {
  id: number;
  tipo_id: number;
  nome: string;
}

interface Ticket {
  id: number;
  problema: string;
  supervisor_id: number;
  posicao_operador?: string;
  empresa_id: number;
  setor_id: number;
  id_acesso?: string;
  anexo?: string;
  status: 'aberto' | 'em_andamento' | 'resolvido';
  criado_em: string;
  tipo_id?: number;
  subtipo_id?: number;
}

interface Note {
  id: number;
  titulo: string;
  conteudo: string;
  cor_fundo?: string;
  tornar_publico: boolean;
  criado_por?: number;
  criado_em: string;
}

interface PasswordEntry {
  id: number;
  sistema: string;
  usuario_acesso: string;
  senha_criptografada: string;
  categoria?: string;
  observacoes?: string;
  criado_por?: number;
  criado_em: string;
}

interface DataContextType {
  // Loading states
  loading: boolean;
  
  // Categories
  categories: Category[];
  addCategory: (category: Omit<Category, 'id' | 'criado_em'>) => Promise<void>;
  updateCategory: (id: number, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  
  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'criado_em'>) => Promise<void>;
  updateProduct: (id: number, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  getLowStockProducts: () => Product[];
  adjustProductQuantity: (id: number, adjustment: number, reason?: string) => Promise<void>;
  
  // Calendar
  events: CalendarEvent[];
  addEvent: (event: Omit<CalendarEvent, 'id' | 'criado_em'>) => Promise<void>;
  updateEvent: (id: number, event: Partial<CalendarEvent>) => Promise<void>;
  deleteEvent: (id: number) => Promise<void>;
  
  // Users
  users: User[];
  addUser: (user: Omit<User, 'id' | 'criado_em'>) => Promise<void>;
  updateUser: (id: number, user: Partial<User>) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
  
  // Companies
  companies: Company[];
  addCompany: (company: Omit<Company, 'id' | 'criado_em'>) => Promise<void>;
  updateCompany: (id: number, company: Partial<Company>) => Promise<void>;
  deleteCompany: (id: number) => Promise<void>;
  
  // Sectors
  sectors: Sector[];
  addSector: (sector: Omit<Sector, 'id' | 'criado_em'>) => Promise<void>;
  updateSector: (id: number, sector: Partial<Sector>) => Promise<void>;
  deleteSector: (id: number) => Promise<void>;
  
  // Notes
  notes: Note[];
  addNote: (note: Omit<Note, 'id' | 'criado_em'>) => Promise<void>;
  updateNote: (id: number, note: Partial<Note>) => Promise<void>;
  deleteNote: (id: number) => Promise<void>;
  
  // Password Manager
  passwords: PasswordEntry[];
  addPassword: (password: Omit<PasswordEntry, 'id' | 'criado_em'>) => Promise<void>;
  updatePassword: (id: number, password: Partial<PasswordEntry>) => Promise<void>;
  deletePassword: (id: number) => Promise<void>;

  // Tickets
  tickets: Ticket[];
  addTicket: (ticket: Omit<Ticket, 'id' | 'criado_em'>) => Promise<void>;
  updateTicket: (id: number, ticket: Partial<Ticket>) => Promise<void>;
  deleteTicket: (id: number) => Promise<void>;
  
  // Ticket Types
  ticketTypes: TicketType[];
  addTicketType: (type: Omit<TicketType, 'id'>) => Promise<void>;
  updateTicketType: (id: number, type: Partial<TicketType>) => Promise<void>;
  deleteTicketType: (id: number) => Promise<void>;
  
  // Ticket Subtypes
  ticketSubtypes: TicketSubtype[];
  addTicketSubtype: (subtype: Omit<TicketSubtype, 'id'>) => Promise<void>;
  updateTicketSubtype: (id: number, subtype: Partial<TicketSubtype>) => Promise<void>;
  deleteTicketSubtype: (id: number) => Promise<void>;
  
  // Reports
  generateReport: (type: string, filters: any) => void;
  
  // Refresh data
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType>({} as DataContextType);

export const useData = () => useContext(DataContext);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [ticketSubtypes, setTicketSubtypes] = useState<TicketSubtype[]>([]);

  // Função para carregar todos os dados
  const loadData = async () => {
    if (!session) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const [
        categoriesData,
        productsData,
        eventsData,
        usersData,
        companiesData,
        sectorsData,
        ticketsData,
        notesData,
        passwordsData,
        ticketTypesData,
        ticketSubtypesData
      ] = await Promise.all([
        supabase.from('categorias').select('*').order('nome'),
        supabase.from('produtos').select('*').order('nome'),
        supabase.from('eventos_calendario').select('*').order('data_inicio'),
        supabase.from('usuarios').select('*').order('nome'),
        supabase.from('empresas').select('*').order('nome'),
        supabase.from('setores').select('*').order('nome'),
        supabase.from('chamados').select('*').order('criado_em', { ascending: false }),
        supabase.from('anotacoes').select('*').order('criado_em', { ascending: false }),
        supabase.from('senhas').select('*').order('sistema'),
        supabase.from('chamados_tipos').select('*').order('nome'),
        supabase.from('chamados_subtipos').select('*').order('nome')
      ]);

      setCategories(categoriesData.data || []);
      setProducts(productsData.data || []);
      setEvents(eventsData.data || []);
      setUsers(usersData.data || []);
      setCompanies(companiesData.data || []);
      setSectors(sectorsData.data || []);
      setTickets(ticketsData.data || []);
      setNotes(notesData.data || []);
      setPasswords(passwordsData.data || []);
      setTicketTypes(ticketTypesData.data || []);
      setTicketSubtypes(ticketSubtypesData.data || []);
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do sistema');
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados quando a sessão mudar
  useEffect(() => {
    loadData();
  }, [session]);

  // Função para refresh manual dos dados
  const refreshData = async () => {
    await loadData();
  };

  // Category operations
  const addCategory = async (categoryData: Omit<Category, 'id' | 'criado_em'>) => {
    try {
      const { data, error } = await supabase
        .from('categorias')
        .insert(categoryData)
        .select()
        .single();

      if (error) throw error;

      setCategories(prev => [...prev, data]);
      toast.success('Categoria adicionada com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar categoria:', error);
      toast.error('Erro ao adicionar categoria');
    }
  };

  const updateCategory = async (id: number, categoryData: Partial<Category>) => {
    try {
      const { data, error } = await supabase
        .from('categorias')
        .update(categoryData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setCategories(prev => 
        prev.map(cat => cat.id === id ? { ...cat, ...data } : cat)
      );
      toast.success('Categoria atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      toast.error('Erro ao atualizar categoria');
    }
  };

  const deleteCategory = async (id: number) => {
    try {
      // Verificar se categoria está em uso
      const { data: productsUsingCategory } = await supabase
        .from('produtos')
        .select('id')
        .eq('categoria_id', id)
        .limit(1);

      if (productsUsingCategory && productsUsingCategory.length > 0) {
        toast.error('Esta categoria não pode ser excluída porque está sendo usada por produtos.');
        return;
      }

      const { error } = await supabase
        .from('categorias')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCategories(prev => prev.filter(cat => cat.id !== id));
      toast.success('Categoria excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      toast.error('Erro ao excluir categoria');
    }
  };

  // Product operations
  const addProduct = async (productData: Omit<Product, 'id' | 'criado_em'>) => {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .insert(productData)
        .select()
        .single();

      if (error) throw error;

      setProducts(prev => [...prev, data]);
      toast.success('Produto adicionado com sucesso!');
      
      // Verificar estoque baixo
      if (data.quantidade <= data.quantidade_minima) {
        toast.error(`ALERTA: ${data.nome} está com estoque baixo!`);
      }
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      toast.error('Erro ao adicionar produto');
    }
  };

  const updateProduct = async (id: number, productData: Partial<Product>) => {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .update(productData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setProducts(prev => 
        prev.map(prod => prod.id === id ? { ...prod, ...data } : prod)
      );
      toast.success('Produto atualizado com sucesso!');
      
      // Verificar estoque baixo
      if (data.quantidade <= data.quantidade_minima) {
        toast.error(`ALERTA: ${data.nome} está com estoque baixo!`);
      }
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      toast.error('Erro ao atualizar produto');
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      const { error } = await supabase
        .from('produtos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProducts(prev => prev.filter(prod => prod.id !== id));
      toast.success('Produto excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      toast.error('Erro ao excluir produto');
    }
  };

  const adjustProductQuantity = async (id: number, adjustment: number, reason?: string) => {
    try {
      const product = products.find(p => p.id === id);
      if (!product) {
        toast.error('Produto não encontrado');
        return;
      }

      const newQuantity = Math.max(0, product.quantidade + adjustment);
      
      const { data, error } = await supabase
        .from('produtos')
        .update({ quantidade: newQuantity })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setProducts(prev => 
        prev.map(prod => prod.id === id ? { ...prod, quantidade: newQuantity } : prod)
      );

      // Registrar movimentação de estoque
      await supabase.from('movimentacoes_estoque').insert({
        produto_id: id,
        tipo: adjustment > 0 ? 'entrada' : 'saida',
        quantidade: Math.abs(adjustment),
        observacao: reason || (adjustment > 0 ? 'Entrada manual' : 'Saída manual')
      });

      toast.success(`Quantidade ${adjustment > 0 ? 'adicionada' : 'removida'} com sucesso!`);
      
      // Verificar estoque baixo
      if (newQuantity <= product.quantidade_minima) {
        toast.error(`ALERTA: ${product.nome} está com estoque baixo!`);
      }
    } catch (error) {
      console.error('Erro ao ajustar quantidade:', error);
      toast.error('Erro ao ajustar quantidade');
    }
  };

  const getLowStockProducts = () => {
    return products.filter(product => product.quantidade <= product.quantidade_minima);
  };

  // Company operations
  const addCompany = async (companyData: Omit<Company, 'id' | 'criado_em'>) => {
    try {
      const { data, error } = await supabase
        .from('empresas')
        .insert(companyData)
        .select()
        .single();

      if (error) throw error;

      setCompanies(prev => [...prev, data]);
      toast.success('Empresa adicionada com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar empresa:', error);
      toast.error('Erro ao adicionar empresa');
    }
  };

  const updateCompany = async (id: number, companyData: Partial<Company>) => {
    try {
      const { data, error } = await supabase
        .from('empresas')
        .update(companyData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setCompanies(prev => 
        prev.map(comp => comp.id === id ? { ...comp, ...data } : comp)
      );
      toast.success('Empresa atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar empresa:', error);
      toast.error('Erro ao atualizar empresa');
    }
  };

  const deleteCompany = async (id: number) => {
    try {
      // Verificar se empresa está em uso
      const { data: usersUsingCompany } = await supabase
        .from('usuarios')
        .select('id')
        .eq('empresa_id', id)
        .limit(1);

      if (usersUsingCompany && usersUsingCompany.length > 0) {
        toast.error('Esta empresa não pode ser excluída porque está sendo usada por usuários.');
        return;
      }

      const { error } = await supabase
        .from('empresas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCompanies(prev => prev.filter(comp => comp.id !== id));
      toast.success('Empresa excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir empresa:', error);
      toast.error('Erro ao excluir empresa');
    }
  };

  // Sector operations
  const addSector = async (sectorData: Omit<Sector, 'id' | 'criado_em'>) => {
    try {
      const { data, error } = await supabase
        .from('setores')
        .insert(sectorData)
        .select()
        .single();

      if (error) throw error;

      setSectors(prev => [...prev, data]);
      toast.success('Setor adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar setor:', error);
      toast.error('Erro ao adicionar setor');
    }
  };

  const updateSector = async (id: number, sectorData: Partial<Sector>) => {
    try {
      const { data, error } = await supabase
        .from('setores')
        .update(sectorData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setSectors(prev => 
        prev.map(sect => sect.id === id ? { ...sect, ...data } : sect)
      );
      toast.success('Setor atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar setor:', error);
      toast.error('Erro ao atualizar setor');
    }
  };

  const deleteSector = async (id: number) => {
    try {
      const { error } = await supabase
        .from('setores')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSectors(prev => prev.filter(sect => sect.id !== id));
      toast.success('Setor excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir setor:', error);
      toast.error('Erro ao excluir setor');
    }
  };

  // User operations
  const addUser = async (userData: Omit<User, 'id' | 'criado_em'>) => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .insert(userData)
        .select()
        .single();

      if (error) throw error;

      setUsers(prev => [...prev, data]);
      toast.success('Usuário adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar usuário:', error);
      toast.error('Erro ao adicionar usuário');
    }
  };

  const updateUser = async (id: number, userData: Partial<User>) => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .update(userData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setUsers(prev => 
        prev.map(user => user.id === id ? { ...user, ...data } : user)
      );
      toast.success('Usuário atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      toast.error('Erro ao atualizar usuário');
    }
  };

  const deleteUser = async (id: number) => {
    try {
      // Verificar se é o último admin
      const { data: adminUsers } = await supabase
        .from('usuarios')
        .select('id')
        .eq('funcao', 'administrador');

      const targetUser = users.find(user => user.id === id);
      
      if (adminUsers && adminUsers.length === 1 && targetUser?.funcao === 'administrador') {
        toast.error('Não é possível excluir o último usuário administrador.');
        return;
      }

      const { error } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setUsers(prev => prev.filter(user => user.id !== id));
      toast.success('Usuário excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      toast.error('Erro ao excluir usuário');
    }
  };

  // Calendar operations
  const addEvent = async (eventData: Omit<CalendarEvent, 'id' | 'criado_em'>) => {
    try {
      const { data, error } = await supabase
        .from('eventos_calendario')
        .insert(eventData)
        .select()
        .single();

      if (error) throw error;

      setEvents(prev => [...prev, data]);
      toast.success('Evento adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar evento:', error);
      toast.error('Erro ao adicionar evento');
    }
  };

  const updateEvent = async (id: number, eventData: Partial<CalendarEvent>) => {
    try {
      const { data, error } = await supabase
        .from('eventos_calendario')
        .update(eventData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setEvents(prev => 
        prev.map(event => event.id === id ? { ...event, ...data } : event)
      );
      toast.success('Evento atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      toast.error('Erro ao atualizar evento');
    }
  };

  const deleteEvent = async (id: number) => {
    try {
      const { error } = await supabase
        .from('eventos_calendario')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setEvents(prev => prev.filter(event => event.id !== id));
      toast.success('Evento excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
      toast.error('Erro ao excluir evento');
    }
  };

  // Note operations
  const addNote = async (noteData: Omit<Note, 'id' | 'criado_em'>) => {
    try {
      const { data, error } = await supabase
        .from('anotacoes')
        .insert(noteData)
        .select()
        .single();

      if (error) throw error;

      setNotes(prev => [...prev, data]);
      toast.success('Anotação criada com sucesso!');
    } catch (error) {
      console.error('Erro ao criar anotação:', error);
      toast.error('Erro ao criar anotação');
    }
  };

  const updateNote = async (id: number, noteData: Partial<Note>) => {
    try {
      const { data, error } = await supabase
        .from('anotacoes')
        .update(noteData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setNotes(prev => 
        prev.map(note => note.id === id ? { ...note, ...data } : note)
      );
      toast.success('Anotação atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar anotação:', error);
      toast.error('Erro ao atualizar anotação');
    }
  };

  const deleteNote = async (id: number) => {
    try {
      const { error } = await supabase
        .from('anotacoes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setNotes(prev => prev.filter(note => note.id !== id));
      toast.success('Anotação excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir anotação:', error);
      toast.error('Erro ao excluir anotação');
    }
  };

  // Password operations
  const addPassword = async (passwordData: Omit<PasswordEntry, 'id' | 'criado_em'>) => {
    try {
      const { data, error } = await supabase
        .from('senhas')
        .insert(passwordData)
        .select()
        .single();

      if (error) throw error;

      setPasswords(prev => [...prev, data]);
      toast.success('Senha adicionada com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar senha:', error);
      toast.error('Erro ao adicionar senha');
    }
  };

  const updatePassword = async (id: number, passwordData: Partial<PasswordEntry>) => {
    try {
      const { data, error } = await supabase
        .from('senhas')
        .update(passwordData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setPasswords(prev => 
        prev.map(pass => pass.id === id ? { ...pass, ...data } : pass)
      );
      toast.success('Senha atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      toast.error('Erro ao atualizar senha');
    }
  };

  const deletePassword = async (id: number) => {
    try {
      const { error } = await supabase
        .from('senhas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPasswords(prev => prev.filter(pass => pass.id !== id));
      toast.success('Senha excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir senha:', error);
      toast.error('Erro ao excluir senha');
    }
  };

  // Ticket operations
  const addTicket = async (ticketData: Omit<Ticket, 'id' | 'criado_em'>) => {
    try {
      const { data, error } = await supabase
        .from('chamados')
        .insert(ticketData)
        .select()
        .single();

      if (error) throw error;

      setTickets(prev => [...prev, data]);
      toast.success('Chamado criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar chamado:', error);
      toast.error('Erro ao criar chamado');
    }
  };

  const updateTicket = async (id: number, ticketData: Partial<Ticket>) => {
    try {
      const { data, error } = await supabase
        .from('chamados')
        .update(ticketData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setTickets(prev => 
        prev.map(ticket => ticket.id === id ? { ...ticket, ...data } : ticket)
      );
      toast.success('Chamado atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar chamado:', error);
      toast.error('Erro ao atualizar chamado');
    }
  };

  const deleteTicket = async (id: number) => {
    try {
      const { error } = await supabase
        .from('chamados')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTickets(prev => prev.filter(ticket => ticket.id !== id));
      toast.success('Chamado excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir chamado:', error);
      toast.error('Erro ao excluir chamado');
    }
  };

  // Ticket Type operations
  const addTicketType = async (typeData: Omit<TicketType, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('chamados_tipos')
        .insert(typeData)
        .select()
        .single();

      if (error) throw error;

      setTicketTypes(prev => [...prev, data]);
      toast.success('Tipo de chamado adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar tipo de chamado:', error);
      toast.error('Erro ao adicionar tipo de chamado');
    }
  };

  const updateTicketType = async (id: number, typeData: Partial<TicketType>) => {
    try {
      const { data, error } = await supabase
        .from('chamados_tipos')
        .update(typeData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setTicketTypes(prev => 
        prev.map(type => type.id === id ? { ...type, ...data } : type)
      );
      toast.success('Tipo de chamado atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar tipo de chamado:', error);
      toast.error('Erro ao atualizar tipo de chamado');
    }
  };

  const deleteTicketType = async (id: number) => {
    try {
      const { error } = await supabase
        .from('chamados_tipos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTicketTypes(prev => prev.filter(type => type.id !== id));
      toast.success('Tipo de chamado excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir tipo de chamado:', error);
      toast.error('Erro ao excluir tipo de chamado');
    }
  };

  // Ticket Subtype operations
  const addTicketSubtype = async (subtypeData: Omit<TicketSubtype, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('chamados_subtipos')
        .insert(subtypeData)
        .select()
        .single();

      if (error) throw error;

      setTicketSubtypes(prev => [...prev, data]);
      toast.success('Subtipo de chamado adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar subtipo de chamado:', error);
      toast.error('Erro ao adicionar subtipo de chamado');
    }
  };

  const updateTicketSubtype = async (id: number, subtypeData: Partial<TicketSubtype>) => {
    try {
      const { data, error } = await supabase
        .from('chamados_subtipos')
        .update(subtypeData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setTicketSubtypes(prev => 
        prev.map(subtype => subtype.id === id ? { ...subtype, ...data } : subtype)
      );
      toast.success('Subtipo de chamado atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar subtipo de chamado:', error);
      toast.error('Erro ao atualizar subtipo de chamado');
    }
  };

  const deleteTicketSubtype = async (id: number) => {
    try {
      const { error } = await supabase
        .from('chamados_subtipos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTicketSubtypes(prev => prev.filter(subtype => subtype.id !== id));
      toast.success('Subtipo de chamado excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir subtipo de chamado:', error);
      toast.error('Erro ao excluir subtipo de chamado');
    }
  };

  // Reports
  const generateReport = (type: string, filters: any) => {
    let data: any[] = [];
    let columns: string[] = [];

    switch (type) {
      case 'products':
        data = products;
        if (filters.categoryId) {
          data = data.filter(product => product.categoria_id === filters.categoryId);
        }
        if (filters.status) {
          data = data.filter(product => product.status === filters.status);
        }
        if (filters.lowStock) {
          data = data.filter(product => product.quantidade <= product.quantidade_minima);
        }
        
        // Enriquecer dados com nomes das categorias
        data = data.map(product => {
          const category = categories.find(c => c.id === product.categoria_id);
          return {
            ...product,
            categoryName: category ? category.nome : 'Sem categoria'
          };
        });
        
        columns = ['ID', 'Nome', 'Categoria', 'Quantidade', 'Quantidade Mínima', 'Status', 'Data de Criação'];
        break;
        
      case 'categories':
        data = categories;
        columns = ['ID', 'Nome', 'Descrição', 'Data de Criação'];
        break;
        
      case 'events':
        data = events;
        if (filters.startDate) {
          data = data.filter(event => new Date(event.data_inicio) >= new Date(filters.startDate));
        }
        if (filters.endDate) {
          data = data.filter(event => new Date(event.data_inicio) <= new Date(filters.endDate));
        }
        if (filters.type) {
          data = data.filter(event => event.tipo === filters.type);
        }
        columns = ['ID', 'Título', 'Tipo', 'Data de Início', 'Data de Término', 'Descrição'];
        break;

      case 'tickets':
        data = tickets;
        if (filters.status) {
          data = data.filter(ticket => ticket.status === filters.status);
        }
        if (filters.startDate) {
          data = data.filter(ticket => new Date(ticket.criado_em) >= new Date(filters.startDate));
        }
        if (filters.endDate) {
          data = data.filter(ticket => new Date(ticket.criado_em) <= new Date(filters.endDate));
        }
        columns = ['ID', 'Problema', 'Status', 'Data de Criação'];
        break;
        
      default:
        toast.error('Tipo de relatório inválido');
        return;
    }

    generateExcel(type, data, columns);
    toast.success('Relatório gerado com sucesso!');
  };

  return (
    <DataContext.Provider
      value={{
        loading,
        
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        getLowStockProducts,
        adjustProductQuantity,
        
        events,
        addEvent,
        updateEvent,
        deleteEvent,
        
        users,
        addUser,
        updateUser,
        deleteUser,
        
        companies,
        addCompany,
        updateCompany,
        deleteCompany,
        
        sectors,
        addSector,
        updateSector,
        deleteSector,
        
        notes,
        addNote,
        updateNote,
        deleteNote,
        
        passwords,
        addPassword,
        updatePassword,
        deletePassword,

        tickets,
        addTicket,
        updateTicket,
        deleteTicket,
        
        ticketTypes,
        addTicketType,
        updateTicketType,
        deleteTicketType,
        
        ticketSubtypes,
        addTicketSubtype,
        updateTicketSubtype,
        deleteTicketSubtype,
        
        generateReport,
        refreshData
      }}
    >
      {children}
    </DataContext.Provider>
  );
};