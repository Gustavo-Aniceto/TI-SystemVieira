import React, { createContext, useContext, useEffect, useState } from 'react';
import { Category, Product, CalendarEvent, User } from '../types';
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
  
  // Reports
  generateReport: (type: string, filters: any) => void;
}

const DataContext = createContext<DataContextType>({} as DataContextType);

export const useData = () => useContext(DataContext);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [users, setUsers] = useState<User[]>([]);

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

    // Load users
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    } else {
      // Initialize with default admin user
      const defaultUser = {
        id: '1',
        username: 'Gustavo',
        password: '1234',
        name: 'Gustavo',
        role: 'admin',
        email: 'admin@anicetoevieira.com',
        createdAt: new Date().toISOString()
      };
      setUsers([defaultUser]);
      localStorage.setItem('users', JSON.stringify([defaultUser]));
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

  // Product operations
  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct = {
      ...product,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
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
        
      case 'categories':
        data = categories;
        columns = ['ID', 'Nome', 'Descrição', 'Data de Criação'];
        break;
        
      case 'events':
        data = events;
        if (filters.startDate) {
          data = data.filter(event => new Date(event.startDate) >= new Date(filters.startDate));
        }
        if (filters.endDate) {
          data = data.filter(event => new Date(event.endDate) <= new Date(filters.endDate));
        }
        if (filters.type) {
          data = data.filter(event => event.type === filters.type);
        }
        
        columns = ['ID', 'Título', 'Tipo', 'Data de Início', 'Data de Término', 'Descrição', 'Data de Criação'];
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
        
        events,
        addEvent,
        updateEvent,
        deleteEvent,
        
        users,
        addUser,
        updateUser,
        deleteUser,
        
        generateReport
      }}
    >
      {children}
    </DataContext.Provider>
  );
};