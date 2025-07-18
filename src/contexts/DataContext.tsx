import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
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

interface TaskList {
  id: number;
  titulo: string;
  cor_fundo?: string;
  tornar_publico: boolean;
  criado_por?: number;
  criado_em: string;
}

interface TaskListItem {
  id: number;
  id_lista: number;
  nome_item: string;
  concluido: boolean;
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
  
  // Task Lists
  taskLists: TaskList[];
  addTaskList: (taskList: Omit<TaskList, 'id' | 'criado_em'>) => Promise<void>;
  updateTaskList: (id: number, taskList: Partial<TaskList>) => Promise<void>;
  deleteTaskList: (id: number) => Promise<void>;
  
  // Task List Items
  taskListItems: TaskListItem[];
  addTaskListItem: (item: Omit<TaskListItem, 'id'>) => Promise<void>;
  updateTaskListItem: (id: number, item: Partial<TaskListItem>) => Promise<void>;
  deleteTaskListItem: (id: number) => Promise<void>;
  
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
  
  // Reports
  generateReport: (type: string, filters: any) => void;
  
  // Refresh data
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType>({} as DataContextType);

export const useData = () => useContext(DataContext);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [taskLists, setTaskLists] = useState<TaskList[]>([]);
  const [taskListItems, setTaskListItems] = useState<TaskListItem[]>([]);
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);

  // Função para carregar todos os dados
  const loadData = async () => {
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
        taskListsData,
        taskListItemsData,
        passwordsData
      ] = await Promise.all([
        supabase.getCategories(),
        supabase.getProducts(),
        supabase.getCalendarEvents(),
        supabase.getUsers(),
        supabase.getCompanies(),
        supabase.getSectors(),
        supabase.getTickets(),
        supabase.getNotes(),
        supabase.getTaskLists(),
        supabase.getTaskListItems(),
        supabase.getPasswords()
      ]);

      setCategories(categoriesData || []);
      setProducts(productsData || []);
      setEvents(eventsData || []);
      setUsers(usersData || []);
      setCompanies(companiesData || []);
      setSectors(sectorsData || []);
      setTickets(ticketsData || []);
      setNotes(notesData || []);
      setTaskLists(taskListsData || []);
      setTaskListItems(taskListItemsData || []);
      setPasswords(passwordsData || []);
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do sistema');
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados na inicialização
  useEffect(() => {
    loadData();
  }, []);

  // Função para refresh manual dos dados
  const refreshData = async () => {
    await loadData();
  };

  // Category operations
  const addCategory = async (categoryData: Omit<Category, 'id' | 'criado_em'>) => {
    try {
      const newCategory = await supabase.createCategory(categoryData);
      if (newCategory && newCategory.length > 0) {
        setCategories(prev => [...prev, newCategory[0]]);
        toast.success('Categoria adicionada com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao adicionar categoria:', error);
      toast.error('Erro ao adicionar categoria');
    }
  };

  const updateCategory = async (id: number, categoryData: Partial<Category>) => {
    try {
      const updatedCategory = await supabase.updateCategory(id, categoryData);
      if (updatedCategory && updatedCategory.length > 0) {
        setCategories(prev => 
          prev.map(cat => cat.id === id ? { ...cat, ...updatedCategory[0] } : cat)
        );
        toast.success('Categoria atualizada com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      toast.error('Erro ao atualizar categoria');
    }
  };

  const deleteCategory = async (id: number) => {
    try {
      // Verificar se categoria está em uso
      const isInUse = products.some(product => product.categoria_id === id);
      if (isInUse) {
        toast.error('Esta categoria não pode ser excluída porque está sendo usada por produtos.');
        return;
      }

      await supabase.deleteCategory(id);
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
      const newProduct = await supabase.createProduct(productData);
      if (newProduct && newProduct.length > 0) {
        setProducts(prev => [...prev, newProduct[0]]);
        toast.success('Produto adicionado com sucesso!');
        
        // Verificar estoque baixo
        if (newProduct[0].quantidade <= newProduct[0].quantidade_minima) {
          toast.error(`ALERTA: ${newProduct[0].nome} está com estoque baixo!`);
        }
      }
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      toast.error('Erro ao adicionar produto');
    }
  };

  const updateProduct = async (id: number, productData: Partial<Product>) => {
    try {
      const updatedProduct = await supabase.updateProduct(id, productData);
      if (updatedProduct && updatedProduct.length > 0) {
        setProducts(prev => 
          prev.map(prod => prod.id === id ? { ...prod, ...updatedProduct[0] } : prod)
        );
        toast.success('Produto atualizado com sucesso!');
        
        // Verificar estoque baixo
        const product = updatedProduct[0];
        if (product.quantidade <= product.quantidade_minima) {
          toast.error(`ALERTA: ${product.nome} está com estoque baixo!`);
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      toast.error('Erro ao atualizar produto');
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      await supabase.deleteProduct(id);
      setProducts(prev => prev.filter(prod => prod.id !== id));
      toast.success('Produto excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      toast.error('Erro ao excluir produto');
    }
  };

  const getLowStockProducts = () => {
    return products.filter(product => product.quantidade <= product.quantidade_minima);
  };

  // Company operations
  const addCompany = async (companyData: Omit<Company, 'id' | 'criado_em'>) => {
    try {
      const newCompany = await supabase.createCompany(companyData);
      if (newCompany && newCompany.length > 0) {
        setCompanies(prev => [...prev, newCompany[0]]);
        toast.success('Empresa adicionada com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao adicionar empresa:', error);
      toast.error('Erro ao adicionar empresa');
    }
  };

  const updateCompany = async (id: number, companyData: Partial<Company>) => {
    try {
      const updatedCompany = await supabase.updateCompany(id, companyData);
      if (updatedCompany && updatedCompany.length > 0) {
        setCompanies(prev => 
          prev.map(comp => comp.id === id ? { ...comp, ...updatedCompany[0] } : comp)
        );
        toast.success('Empresa atualizada com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao atualizar empresa:', error);
      toast.error('Erro ao atualizar empresa');
    }
  };

  const deleteCompany = async (id: number) => {
    try {
      // Verificar se empresa está em uso
      const isInUse = users.some(user => user.empresa_id === id);
      if (isInUse) {
        toast.error('Esta empresa não pode ser excluída porque está sendo usada por usuários.');
        return;
      }

      await supabase.deleteCompany(id);
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
      const newSector = await supabase.createSector(sectorData);
      if (newSector && newSector.length > 0) {
        setSectors(prev => [...prev, newSector[0]]);
        toast.success('Setor adicionado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao adicionar setor:', error);
      toast.error('Erro ao adicionar setor');
    }
  };

  const updateSector = async (id: number, sectorData: Partial<Sector>) => {
    try {
      const updatedSector = await supabase.updateSector(id, sectorData);
      if (updatedSector && updatedSector.length > 0) {
        setSectors(prev => 
          prev.map(sect => sect.id === id ? { ...sect, ...updatedSector[0] } : sect)
        );
        toast.success('Setor atualizado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao atualizar setor:', error);
      toast.error('Erro ao atualizar setor');
    }
  };

  const deleteSector = async (id: number) => {
    try {
      await supabase.deleteSector(id);
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
      const newUser = await supabase.createUser(userData);
      if (newUser && newUser.length > 0) {
        setUsers(prev => [...prev, newUser[0]]);
        toast.success('Usuário adicionado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao adicionar usuário:', error);
      toast.error('Erro ao adicionar usuário');
    }
  };

  const updateUser = async (id: number, userData: Partial<User>) => {
    try {
      const updatedUser = await supabase.updateUser(id, userData);
      if (updatedUser && updatedUser.length > 0) {
        setUsers(prev => 
          prev.map(user => user.id === id ? { ...user, ...updatedUser[0] } : user)
        );
        toast.success('Usuário atualizado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      toast.error('Erro ao atualizar usuário');
    }
  };

  const deleteUser = async (id: number) => {
    try {
      // Verificar se é o último admin
      const adminUsers = users.filter(user => user.funcao === 'administrador');
      const targetUser = users.find(user => user.id === id);
      
      if (adminUsers.length === 1 && targetUser?.funcao === 'administrador') {
        toast.error('Não é possível excluir o último usuário administrador.');
        return;
      }

      await supabase.deleteUser(id);
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
      const newEvent = await supabase.createCalendarEvent(eventData);
      if (newEvent && newEvent.length > 0) {
        setEvents(prev => [...prev, newEvent[0]]);
        toast.success('Evento adicionado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao adicionar evento:', error);
      toast.error('Erro ao adicionar evento');
    }
  };

  const updateEvent = async (id: number, eventData: Partial<CalendarEvent>) => {
    try {
      const updatedEvent = await supabase.updateCalendarEvent(id, eventData);
      if (updatedEvent && updatedEvent.length > 0) {
        setEvents(prev => 
          prev.map(event => event.id === id ? { ...event, ...updatedEvent[0] } : event)
        );
        toast.success('Evento atualizado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      toast.error('Erro ao atualizar evento');
    }
  };

  const deleteEvent = async (id: number) => {
    try {
      await supabase.deleteCalendarEvent(id);
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
      const newNote = await supabase.createNote(noteData);
      if (newNote && newNote.length > 0) {
        setNotes(prev => [...prev, newNote[0]]);
        toast.success('Anotação criada com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao criar anotação:', error);
      toast.error('Erro ao criar anotação');
    }
  };

  const updateNote = async (id: number, noteData: Partial<Note>) => {
    try {
      const updatedNote = await supabase.updateNote(id, noteData);
      if (updatedNote && updatedNote.length > 0) {
        setNotes(prev => 
          prev.map(note => note.id === id ? { ...note, ...updatedNote[0] } : note)
        );
        toast.success('Anotação atualizada com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao atualizar anotação:', error);
      toast.error('Erro ao atualizar anotação');
    }
  };

  const deleteNote = async (id: number) => {
    try {
      await supabase.deleteNote(id);
      setNotes(prev => prev.filter(note => note.id !== id));
      toast.success('Anotação excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir anotação:', error);
      toast.error('Erro ao excluir anotação');
    }
  };

  // Task List operations
  const addTaskList = async (taskListData: Omit<TaskList, 'id' | 'criado_em'>) => {
    try {
      const newTaskList = await supabase.createTaskList(taskListData);
      if (newTaskList && newTaskList.length > 0) {
        setTaskLists(prev => [...prev, newTaskList[0]]);
        toast.success('Lista de tarefas criada com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao criar lista de tarefas:', error);
      toast.error('Erro ao criar lista de tarefas');
    }
  };

  const updateTaskList = async (id: number, taskListData: Partial<TaskList>) => {
    try {
      const updatedTaskList = await supabase.updateTaskList(id, taskListData);
      if (updatedTaskList && updatedTaskList.length > 0) {
        setTaskLists(prev => 
          prev.map(list => list.id === id ? { ...list, ...updatedTaskList[0] } : list)
        );
        toast.success('Lista de tarefas atualizada com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao atualizar lista de tarefas:', error);
      toast.error('Erro ao atualizar lista de tarefas');
    }
  };

  const deleteTaskList = async (id: number) => {
    try {
      await supabase.deleteTaskList(id);
      setTaskLists(prev => prev.filter(list => list.id !== id));
      // Remover itens da lista também
      setTaskListItems(prev => prev.filter(item => item.id_lista !== id));
      toast.success('Lista de tarefas excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir lista de tarefas:', error);
      toast.error('Erro ao excluir lista de tarefas');
    }
  };

  // Task List Item operations
  const addTaskListItem = async (itemData: Omit<TaskListItem, 'id'>) => {
    try {
      const newItem = await supabase.createTaskListItem(itemData);
      if (newItem && newItem.length > 0) {
        setTaskListItems(prev => [...prev, newItem[0]]);
        toast.success('Item adicionado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      toast.error('Erro ao adicionar item');
    }
  };

  const updateTaskListItem = async (id: number, itemData: Partial<TaskListItem>) => {
    try {
      const updatedItem = await supabase.updateTaskListItem(id, itemData);
      if (updatedItem && updatedItem.length > 0) {
        setTaskListItems(prev => 
          prev.map(item => item.id === id ? { ...item, ...updatedItem[0] } : item)
        );
      }
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      toast.error('Erro ao atualizar item');
    }
  };

  const deleteTaskListItem = async (id: number) => {
    try {
      await supabase.deleteTaskListItem(id);
      setTaskListItems(prev => prev.filter(item => item.id !== id));
      toast.success('Item excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir item:', error);
      toast.error('Erro ao excluir item');
    }
  };

  // Password operations
  const addPassword = async (passwordData: Omit<PasswordEntry, 'id' | 'criado_em'>) => {
    try {
      const newPassword = await supabase.createPassword(passwordData);
      if (newPassword && newPassword.length > 0) {
        setPasswords(prev => [...prev, newPassword[0]]);
        toast.success('Senha adicionada com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao adicionar senha:', error);
      toast.error('Erro ao adicionar senha');
    }
  };

  const updatePassword = async (id: number, passwordData: Partial<PasswordEntry>) => {
    try {
      const updatedPassword = await supabase.updatePassword(id, passwordData);
      if (updatedPassword && updatedPassword.length > 0) {
        setPasswords(prev => 
          prev.map(pass => pass.id === id ? { ...pass, ...updatedPassword[0] } : pass)
        );
        toast.success('Senha atualizada com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      toast.error('Erro ao atualizar senha');
    }
  };

  const deletePassword = async (id: number) => {
    try {
      await supabase.deletePassword(id);
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
      const newTicket = await supabase.createTicket(ticketData);
      if (newTicket && newTicket.length > 0) {
        setTickets(prev => [...prev, newTicket[0]]);
        toast.success('Chamado criado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao criar chamado:', error);
      toast.error('Erro ao criar chamado');
    }
  };

  const updateTicket = async (id: number, ticketData: Partial<Ticket>) => {
    try {
      const updatedTicket = await supabase.updateTicket(id, ticketData);
      if (updatedTicket && updatedTicket.length > 0) {
        setTickets(prev => 
          prev.map(ticket => ticket.id === id ? { ...ticket, ...updatedTicket[0] } : ticket)
        );
        toast.success('Chamado atualizado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao atualizar chamado:', error);
      toast.error('Erro ao atualizar chamado');
    }
  };

  const deleteTicket = async (id: number) => {
    try {
      await supabase.deleteTicket(id);
      setTickets(prev => prev.filter(ticket => ticket.id !== id));
      toast.success('Chamado excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir chamado:', error);
      toast.error('Erro ao excluir chamado');
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
        
        taskLists,
        addTaskList,
        updateTaskList,
        deleteTaskList,
        
        taskListItems,
        addTaskListItem,
        updateTaskListItem,
        deleteTaskListItem,
        
        passwords,
        addPassword,
        updatePassword,
        deletePassword,

        tickets,
        addTicket,
        updateTicket,
        deleteTicket,
        
        generateReport,
        refreshData
      }}
    >
      {children}
    </DataContext.Provider>
  );
};