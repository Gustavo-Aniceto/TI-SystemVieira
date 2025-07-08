import React, { createContext, useContext, useEffect, useState } from 'react';
import { Category, Product, CalendarEvent, User, InternActivity, MovementRecord, Note, ChecklistItem, Ticket, TicketComment, TicketTransfer, Company, PasswordEntry } from '../types';
import { generateExcel } from '../utils/excelUtils';
import toast from 'react-hot-toast';

interface DataContextType {
  // Categories
  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  
  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getLowStockProducts: () => Product[];
  
  // Product Movements
  addMovement: (productId: string, movement: Omit<MovementRecord, 'id' | 'createdAt'>) => void;
  
  // Calendar
  events: CalendarEvent[];
  addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  updateEvent: (id: string, event: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  
  // Users
  users: User[];
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
  
  // Companies
  companies: Company[];
  addCompany: (company: Omit<Company, 'id' | 'createdAt'>) => void;
  updateCompany: (id: string, company: Partial<Company>) => void;
  deleteCompany: (id: string) => void;
  
  // Intern Activities
  activities: InternActivity[];
  addActivity: (activity: Omit<InternActivity, 'id' | 'createdAt'>) => void;
  updateActivity: (id: string, activity: Partial<InternActivity>) => void;
  deleteActivity: (id: string) => void;
  
  // Notes
  notes: Note[];
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, note: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  
  // Password Manager
  passwords: PasswordEntry[];
  addPassword: (password: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePassword: (id: string, password: Partial<PasswordEntry>) => void;
  deletePassword: (id: string) => void;
  
  // Reports
  generateReport: (type: string, filters: any) => void;

  // Tickets
  tickets: Ticket[];
  addTicket: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'comments' | 'status' | 'attachments' | 'transfers'>) => void;
  updateTicket: (id: string, ticket: Partial<Ticket>) => void;
  deleteTicket: (id: string) => void;
  addTicketComment: (ticketId: string, comment: Omit<TicketComment, 'id' | 'createdAt'>) => void;
  transferTicket: (ticketId: string, transfer: Omit<TicketTransfer, 'id' | 'transferredAt'>) => void;
  respondToTransfer: (ticketId: string, transferId: string, response: 'accepted' | 'rejected') => void;
}

const DataContext = createContext<DataContextType>({} as DataContextType);

export const useData = () => useContext(DataContext);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [activities, setActivities] = useState<InternActivity[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);

  // Load initial data
  useEffect(() => {
    // Load categories
    const storedCategories = localStorage.getItem('categories');
    if (storedCategories) {
      setCategories(JSON.parse(storedCategories));
    } else {
      // Initialize with default categories
      const defaultCategories = [
        { id: '1', name: 'Hardware', description: 'Equipamentos físicos', createdAt: new Date().toISOString() },
        { id: '2', name: 'Software', description: 'Programas e licenças', createdAt: new Date().toISOString() },
        { id: '3', name: 'Rede', description: 'Equipamentos de rede', createdAt: new Date().toISOString() }
      ];
      setCategories(defaultCategories);
      localStorage.setItem('categories', JSON.stringify(defaultCategories));
    }

    // Load products
    const storedProducts = localStorage.getItem('products');
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    }

    // Load events
    const storedEvents = localStorage.getItem('events');
    if (storedEvents) {
      setEvents(JSON.parse(storedEvents));
    }

    // Load companies
    const storedCompanies = localStorage.getItem('companies');
    if (storedCompanies) {
      setCompanies(JSON.parse(storedCompanies));
    } else {
      // Initialize with default companies
      const defaultCompanies = [
        { 
          id: '1', 
          name: 'Aniceto&Vieira', 
          description: 'Empresa principal',
          departments: ['TI', 'Administrativo', 'Operacional'],
          createdAt: new Date().toISOString() 
        }
      ];
      setCompanies(defaultCompanies);
      localStorage.setItem('companies', JSON.stringify(defaultCompanies));
    }

    // Load users
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    } else {
      // Initialize with default admin user
      const defaultUser = {
        id: '1',
        username: 'admin',
        password: 'admin',
        name: 'Administrador',
        role: 'admin',
        email: 'admin@example.com',
        companyId: '1',
        createdAt: new Date().toISOString()
      };
      setUsers([defaultUser]);
      localStorage.setItem('users', JSON.stringify([defaultUser]));
    }

    // Load activities
    const storedActivities = localStorage.getItem('activities');
    if (storedActivities) {
      setActivities(JSON.parse(storedActivities));
    }

    // Load notes
    const storedNotes = localStorage.getItem('notes');
    if (storedNotes) {
      setNotes(JSON.parse(storedNotes));
    }

    // Load tickets
    const storedTickets = localStorage.getItem('tickets');
    if (storedTickets) {
      setTickets(JSON.parse(storedTickets));
    }

    // Load passwords
    const storedPasswords = localStorage.getItem('passwords');
    if (storedPasswords) {
      setPasswords(JSON.parse(storedPasswords));
    }
  }, []);

  // Save data whenever it changes
  useEffect(() => {
    if (categories.length > 0) {
      localStorage.setItem('categories', JSON.stringify(categories));
    }
  }, [categories]);

  useEffect(() => {
    if (products.length > 0) {
      localStorage.setItem('products', JSON.stringify(products));
    }
  }, [products]);

  useEffect(() => {
    if (events.length > 0) {
      localStorage.setItem('events', JSON.stringify(events));
    }
  }, [events]);

  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem('users', JSON.stringify(users));
    }
  }, [users]);

  useEffect(() => {
    if (companies.length > 0) {
      localStorage.setItem('companies', JSON.stringify(companies));
    }
  }, [companies]);

  useEffect(() => {
    if (activities.length > 0) {
      localStorage.setItem('activities', JSON.stringify(activities));
    }
  }, [activities]);

  useEffect(() => {
    if (notes.length > 0) {
      localStorage.setItem('notes', JSON.stringify(notes));
    }
  }, [notes]);

  useEffect(() => {
    if (tickets.length > 0) {
      localStorage.setItem('tickets', JSON.stringify(tickets));
    }
  }, [tickets]);

  useEffect(() => {
    if (passwords.length > 0) {
      localStorage.setItem('passwords', JSON.stringify(passwords));
    }
  }, [passwords]);

  // Category operations
  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory = {
      ...category,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setCategories([...categories, newCategory]);
    toast.success('Categoria adicionada com sucesso!');
  };

  const updateCategory = (id: string, categoryUpdate: Partial<Category>) => {
    setCategories(
      categories.map(category => 
        category.id === id ? { ...category, ...categoryUpdate } : category
      )
    );
    toast.success('Categoria atualizada com sucesso!');
  };

  const deleteCategory = (id: string) => {
    // Check if category is in use by any products
    const isInUse = products.some(product => product.categoryId === id);
    
    if (isInUse) {
      toast.error('Esta categoria não pode ser excluída porque está sendo usada por produtos.');
      return;
    }
    
    setCategories(categories.filter(category => category.id !== id));
    toast.success('Categoria excluída com sucesso!');
  };

  // Company operations
  const addCompany = (company: Omit<Company, 'id' | 'createdAt'>) => {
    const newCompany = {
      ...company,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setCompanies([...companies, newCompany]);
    toast.success('Empresa adicionada com sucesso!');
  };

  const updateCompany = (id: string, companyUpdate: Partial<Company>) => {
    setCompanies(
      companies.map(company => 
        company.id === id ? { ...company, ...companyUpdate } : company
      )
    );
    toast.success('Empresa atualizada com sucesso!');
  };

  const deleteCompany = (id: string) => {
    // Check if company is in use by any users
    const isInUse = users.some(user => user.companyId === id);
    
    if (isInUse) {
      toast.error('Esta empresa não pode ser excluída porque está sendo usada por usuários.');
      return;
    }
    
    setCompanies(companies.filter(company => company.id !== id));
    toast.success('Empresa excluída com sucesso!');
  };

  // Product operations
  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct = {
      ...product,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      maintenanceHistory: [],
      movementHistory: []
    };
    setProducts([...products, newProduct]);
    toast.success('Produto adicionado com sucesso!');
    
    // Check for low stock
    if (newProduct.quantity <= newProduct.minQuantity) {
      toast.error(`ALERTA: ${newProduct.name} está com estoque baixo!`);
    }
  };

  const updateProduct = (id: string, productUpdate: Partial<Product>) => {
    const updatedProducts = products.map(product => {
      if (product.id === id) {
        const updatedProduct = { ...product, ...productUpdate };
        
        // Check for low stock after update
        if (updatedProduct.quantity <= updatedProduct.minQuantity) {
          toast.error(`ALERTA: ${updatedProduct.name} está com estoque baixo!`);
        }
        
        return updatedProduct;
      }
      return product;
    });
    
    setProducts(updatedProducts);
    toast.success('Produto atualizado com sucesso!');
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter(product => product.id !== id));
    toast.success('Produto excluído com sucesso!');
  };

  const getLowStockProducts = () => {
    return products.filter(product => product.quantity <= product.minQuantity);
  };

  // Product Movement operations
  const addMovement = (productId: string, movement: Omit<MovementRecord, 'id' | 'createdAt'>) => {
    const newMovement = {
      ...movement,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };

    setProducts(products.map(product => {
      if (product.id === productId) {
        const updatedProduct = {
          ...product,
          movementHistory: [...product.movementHistory, newMovement]
        };

        // Update quantity based on movement type
        if (movement.type === 'check-out') {
          updatedProduct.quantity -= 1;
        } else if (movement.type === 'check-in') {
          updatedProduct.quantity += 1;
        }

        return updatedProduct;
      }
      return product;
    }));

    toast.success('Movimentação registrada com sucesso!');
  };

  // Calendar operations
  const addEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent = {
      ...event,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setEvents([...events, newEvent]);
    toast.success('Evento adicionado com sucesso!');
  };

  const updateEvent = (id: string, eventUpdate: Partial<CalendarEvent>) => {
    setEvents(
      events.map(event => 
        event.id === id ? { ...event, ...eventUpdate } : event
      )
    );
    toast.success('Evento atualizado com sucesso!');
  };

  const deleteEvent = (id: string) => {
    setEvents(events.filter(event => event.id !== id));
    toast.success('Evento excluído com sucesso!');
  };

  // User operations
  const addUser = (user: Omit<User, 'id' | 'createdAt'>) => {
    const newUser = {
      ...user,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setUsers([...users, newUser]);
    toast.success('Usuário adicionado com sucesso!');
  };

  const updateUser = (id: string, userUpdate: Partial<User>) => {
    setUsers(
      users.map(user => 
        user.id === id ? { ...user, ...userUpdate } : user
      )
    );
    toast.success('Usuário atualizado com sucesso!');
  };

  const deleteUser = (id: string) => {
    // Prevent deleting the last admin user
    const adminUsers = users.filter(user => user.role === 'admin');
    const targetUser = users.find(user => user.id === id);
    
    if (adminUsers.length === 1 && targetUser?.role === 'admin') {
      toast.error('Não é possível excluir o último usuário administrador.');
      return;
    }
    
    setUsers(users.filter(user => user.id !== id));
    toast.success('Usuário excluído com sucesso!');
  };

  // Intern Activity operations
  const addActivity = (activity: Omit<InternActivity, 'id' | 'createdAt' | 'startDate'>) => {
    const newActivity = {
      ...activity,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      startDate: new Date().toISOString(),
      status: 'in-progress' as const
    };
    setActivities([...activities, newActivity]);
    toast.success('Atividade iniciada com sucesso!');
  };

  const updateActivity = (id: string, activityUpdate: Partial<InternActivity>) => {
    const now = new Date().toISOString();
    let updatedActivity = { ...activityUpdate };
    
    // Calculate duration when completing activity
    if (activityUpdate.status === 'completed') {
      const activity = activities.find(a => a.id === id);
      if (activity && activity.startDate) {
        const startTime = new Date(activity.startDate).getTime();
        const endTime = new Date(now).getTime();
        const durationMinutes = Math.round((endTime - startTime) / (1000 * 60));
        updatedActivity = {
          ...updatedActivity,
          endDate: now,
          completedAt: now,
          duration: durationMinutes
        };
      }
    }
    
    // Set submission time when submitting for review
    if (activityUpdate.status === 'pending-review') {
      updatedActivity = {
        ...updatedActivity,
        submittedAt: now
      };
    }
    
    // Set review time when approving/rejecting
    if (activityUpdate.status === 'approved' || activityUpdate.status === 'rejected') {
      updatedActivity = {
        ...updatedActivity,
        reviewedAt: now
      };
    }
    
    setActivities(
      activities.map(activity => 
        activity.id === id ? { ...activity, ...updatedActivity } : activity
      )
    );
    
    if (activityUpdate.status === 'completed') {
      toast.success('Atividade finalizada com sucesso!');
    } else if (activityUpdate.status === 'pending-review') {
      toast.success('Atividade enviada para revisão!');
    } else if (activityUpdate.status === 'approved') {
      toast.success('Atividade aprovada!');
    } else if (activityUpdate.status === 'rejected') {
      toast.success('Atividade rejeitada!');
    } else {
      toast.success('Atividade atualizada com sucesso!');
    }
  };

  const deleteActivity = (id: string) => {
    setActivities(activities.filter(activity => activity.id !== id));
    toast.success('Atividade excluída com sucesso!');
  };

  // Notes operations
  const addNote = (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newNote = {
      ...note,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now
    };
    setNotes([...notes, newNote]);
    toast.success('Anotação criada com sucesso!');
  };

  const updateNote = (id: string, noteUpdate: Partial<Note>) => {
    setNotes(
      notes.map(note => 
        note.id === id 
          ? { 
              ...note, 
              ...noteUpdate, 
              updatedAt: new Date().toISOString() 
            } 
          : note
      )
    );
    toast.success('Anotação atualizada com sucesso!');
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
    toast.success('Anotação excluída com sucesso!');
  };

  // Password operations
  const addPassword = (password: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newPassword = {
      ...password,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now
    };
    setPasswords([...passwords, newPassword]);
    toast.success('Senha adicionada com sucesso!');
  };

  const updatePassword = (id: string, passwordUpdate: Partial<PasswordEntry>) => {
    setPasswords(
      passwords.map(password => 
        password.id === id 
          ? { 
              ...password, 
              ...passwordUpdate, 
              updatedAt: new Date().toISOString() 
            } 
          : password
      )
    );
    toast.success('Senha atualizada com sucesso!');
  };

  const deletePassword = (id: string) => {
    setPasswords(passwords.filter(password => password.id !== id));
    toast.success('Senha excluída com sucesso!');
  };

  // Ticket operations
  const addTicket = (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'comments' | 'status' | 'attachments' | 'transfers'>) => {
    const now = new Date().toISOString();
    const newTicket = {
      ...ticket,
      id: Date.now().toString(),
      status: 'open' as const,
      comments: [],
      attachments: [],
      transfers: [],
      createdAt: now,
      updatedAt: now
    };
    setTickets([...tickets, newTicket]);
    toast.success('Chamado criado com sucesso!');
  };

  const updateTicket = (id: string, ticketUpdate: Partial<Ticket>) => {
    const now = new Date().toISOString();
    let updatedTicket = { ...ticketUpdate };
    
    // Calculate response time when ticket is first attended
    if (ticketUpdate.attendedBy && !tickets.find(t => t.id === id)?.attendedBy) {
      const ticket = tickets.find(t => t.id === id);
      if (ticket) {
        const createdTime = new Date(ticket.createdAt).getTime();
        const attendedTime = new Date(now).getTime();
        const responseTimeMinutes = Math.round((attendedTime - createdTime) / (1000 * 60));
        updatedTicket = {
          ...updatedTicket,
          responseTime: responseTimeMinutes,
          attendedAt: now
        };
      }
    }
    
    setTickets(
      tickets.map(ticket =>
        ticket.id === id
          ? {
              ...ticket,
              ...updatedTicket,
              updatedAt: new Date().toISOString()
            }
          : ticket
      )
    );
    toast.success('Chamado atualizado com sucesso!');
  };

  const deleteTicket = (id: string) => {
    setTickets(tickets.filter(ticket => ticket.id !== id));
    toast.success('Chamado excluído com sucesso!');
  };

  const addTicketComment = (ticketId: string, comment: Omit<TicketComment, 'id' | 'createdAt'>) => {
    const newComment = {
      ...comment,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };

    setTickets(
      tickets.map(ticket =>
        ticket.id === ticketId
          ? {
              ...ticket,
              comments: [...ticket.comments, newComment],
              updatedAt: new Date().toISOString()
            }
          : ticket
      )
    );
    toast.success('Comentário adicionado com sucesso!');
  };

  const transferTicket = (ticketId: string, transfer: Omit<TicketTransfer, 'id' | 'transferredAt'>) => {
    const newTransfer = {
      ...transfer,
      id: Date.now().toString(),
      transferredAt: new Date().toISOString()
    };

    setTickets(
      tickets.map(ticket =>
        ticket.id === ticketId
          ? {
              ...ticket,
              transfers: [...ticket.transfers, newTransfer],
              updatedAt: new Date().toISOString()
            }
          : ticket
      )
    );
    toast.success('Solicitação de transferência enviada!');
  };

  const respondToTransfer = (ticketId: string, transferId: string, response: 'accepted' | 'rejected') => {
    setTickets(
      tickets.map(ticket => {
        if (ticket.id === ticketId) {
          const updatedTransfers = ticket.transfers.map(transfer =>
            transfer.id === transferId
              ? {
                  ...transfer,
                  status: response,
                  respondedAt: new Date().toISOString()
                }
              : transfer
          );

          // If accepted, update the ticket's attendedBy
          let updatedTicket = {
            ...ticket,
            transfers: updatedTransfers,
            updatedAt: new Date().toISOString()
          };

          if (response === 'accepted') {
            const acceptedTransfer = updatedTransfers.find(t => t.id === transferId);
            if (acceptedTransfer) {
              updatedTicket = {
                ...updatedTicket,
                attendedBy: acceptedTransfer.toUserId,
                attendedAt: new Date().toISOString(),
                status: 'in-progress'
              };
            }
          }

          return updatedTicket;
        }
        return ticket;
      })
    );

    toast.success(response === 'accepted' ? 'Transferência aceita!' : 'Transferência rejeitada!');
  };

  // Reports
  const generateReport = (type: string, filters: any) => {
    let data: any[] = [];
    let columns: string[] = [];

    switch (type) {
      case 'products':
        data = products;
        if (filters.categoryId) {
          data = data.filter(product => product.categoryId === filters.categoryId);
        }
        if (filters.status) {
          data = data.filter(product => product.status === filters.status);
        }
        if (filters.lowStock) {
          data = data.filter(product => product.quantity <= product.minQuantity);
        }
        
        // Enrich data with category names
        data = data.map(product => {
          const category = categories.find(c => c.id === product.categoryId);
          return {
            ...product,
            categoryName: category ? category.name : 'Sem categoria'
          };
        });
        
        columns = ['ID', 'Nome', 'Categoria', 'Quantidade', 'Quantidade Mínima', 'Status', 'Data de Criação'];
        break;
        
      case 'movements':
        data = products.flatMap(product => 
          product.movementHistory.map(movement => ({
            ...movement,
            productName: product.name,
            userName: users.find(u => u.id === movement.userId)?.name || 'Usuário Removido'
          }))
        );
        
        if (filters.startDate) {
          data = data.filter(movement => new Date(movement.date) >= new Date(filters.startDate));
        }
        if (filters.endDate) {
          data = data.filter(movement => new Date(movement.date) <= new Date(filters.endDate));
        }
        if (filters.type) {
          data = data.filter(movement => movement.type === filters.type);
        }
        
        columns = ['ID', 'Produto', 'Tipo', 'Usuário', 'De', 'Para', 'Data', 'Motivo', 'Retorno Previsto'];
        break;
        
      case 'internActivities':
        data = activities;
        if (filters.internId) {
          data = data.filter(activity => activity.internId === filters.internId);
        }
        if (filters.category) {
          data = data.filter(activity => activity.category === filters.category);
        }
        if (filters.status) {
          data = data.filter(activity => activity.status === filters.status);
        }
        if (filters.startDate) {
          data = data.filter(activity => new Date(activity.date) >= new Date(filters.startDate));
        }
        if (filters.endDate) {
          data = data.filter(activity => new Date(activity.date) <= new Date(filters.endDate));
        }
        
        // Enrich data with intern names
        data = data.map(activity => {
          const intern = users.find(u => u.id === activity.internId);
          return {
            ...activity,
            internName: intern ? intern.name : 'Usuário Removido'
          };
        });
        
        columns = ['ID', 'Estagiário', 'Data', 'Categoria', 'Descrição', 'Horas', 'Status', 'Feedback'];
        break;

      case 'notes':
        data = notes;
        if (filters.userId) {
          data = data.filter(note => note.userId === filters.userId || note.isPublic);
        }
        if (filters.type) {
          data = data.filter(note => note.type === filters.type);
        }
        if (filters.startDate) {
          data = data.filter(note => new Date(note.createdAt) >= new Date(filters.startDate));
        }
        if (filters.endDate) {
          data = data.filter(note => new Date(note.createdAt) <= new Date(filters.endDate));
        }

        // Enrich data with user names
        data = data.map(note => {
          const noteUser = users.find(u => u.id === note.userId);
          return {
            ...note,
            userName: noteUser ? noteUser.name : 'Usuário Removido',
            visibility: note.isPublic ? 'Pública' : 'Privada'
          };
        });

        columns = ['ID', 'Título', 'Conteúdo', 'Tipo', 'Usuário', 'Visibilidade', 'Criado em', 'Atualizado em'];
        break;

      case 'tickets':
        data = tickets;
        if (filters.status) {
          data = data.filter(ticket => ticket.status === filters.status);
        }
        if (filters.createdBy) {
          data = data.filter(ticket => ticket.createdBy === filters.createdBy);
        }
        if (filters.attendedBy) {
          data = data.filter(ticket => ticket.attendedBy === filters.attendedBy);
        }
        if (filters.startDate) {
          data = data.filter(ticket => new Date(ticket.createdAt) >= new Date(filters.startDate));
        }
        if (filters.endDate) {
          data = data.filter(ticket => new Date(ticket.createdAt) <= new Date(filters.endDate));
        }

        // Enrich data with user names
        data = data.map(ticket => {
          const creator = users.find(u => u.id === ticket.createdBy);
          const attendant = ticket.attendedBy ? users.find(u => u.id === ticket.attendedBy) : null;
          return {
            ...ticket,
            creatorName: creator ? creator.name : 'Usuário Removido',
            attendantName: attendant ? attendant.name : 'Não atendido'
          };
        });

        columns = ['ID', 'Problema', 'Supervisor', 'Operador', 'Empresa', 'Acesso AnyDesk', 'Status', 'Criado por', 'Atendido por', 'Data de Criação', 'Data de Atendimento', 'Data de Fechamento', 'Feedback'];
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
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        getLowStockProducts,
        
        addMovement,
        
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
        
        activities,
        addActivity,
        updateActivity,
        deleteActivity,
        
        notes,
        addNote,
        updateNote,
        deleteNote,
        
        passwords,
        addPassword,
        updatePassword,
        deletePassword,
        
        generateReport,

        tickets,
        addTicket,
        updateTicket,
        deleteTicket,
        addTicketComment,
        transferTicket,
        respondToTransfer
      }}
    >
      {children}
    </DataContext.Provider>
  );
};