import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { 
  LayoutGrid, 
  Layers, 
  Package, 
  Calendar as CalendarIcon, 
  FileText, 
  Users, 
  LogOut,
  AlertTriangle,
  ClipboardList,
  UserCheck,
  StickyNote,
  Ticket,
  Building2,
  ChevronDown,
  ChevronRight,
  Settings,
  Wrench,
  Archive,
  Key
} from 'lucide-react';
import toast from 'react-hot-toast';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, signOut, isAdmin, isIntern, isSupervisor } = useAuth();
  const { getLowStockProducts } = useData();
  const location = useLocation();
  const navigate = useNavigate();
  
  // State for dropdown menus
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({
    estoque: false,
    configuracoes: false,
    tools: false
  });
  
  // Check for low stock products on initial load
  useEffect(() => {
    if (isAdmin) {
      const lowStockProducts = getLowStockProducts();
      if (lowStockProducts.length > 0) {
        toast.error(
          <div>
            <strong>Alerta de Estoque Baixo!</strong>
            <p>{lowStockProducts.length} produto(s) com estoque baixo</p>
            <button 
              className="text-blue-500 underline"
              onClick={() => navigate('/products?filter=lowstock')}
            >
              Ver detalhes
            </button>
          </div>,
          { duration: 5000 }
        );
      }
    }
  }, [getLowStockProducts, navigate, isAdmin]);

  const handleLogout = () => {
    signOut();
    // Navigation will be handled by auth state change
  };

  const toggleDropdown = (section: string) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const NavItem = ({ to, icon, label, onClick }: { 
    to?: string, 
    icon: React.ReactNode, 
    label: string,
    onClick?: () => void 
  }) => {
    const isActive = to ? location.pathname === to : false;
    
    if (onClick) {
      return (
        <button
          onClick={onClick}
          className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors text-left ${
            isActive 
              ? 'bg-blue-100 text-blue-700' 
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <span className="mr-3">{icon}</span>
          <span className="flex-1">{label}</span>
        </button>
      );
    }
    
    return (
      <Link
        to={to!}
        className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
          isActive 
            ? 'bg-blue-100 text-blue-700' 
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        <span className="mr-3">{icon}</span>
        <span>{label}</span>
      </Link>
    );
  };

  const DropdownSection = ({ 
    title, 
    icon, 
    sectionKey, 
    children 
  }: { 
    title: string, 
    icon: React.ReactNode, 
    sectionKey: string, 
    children: React.ReactNode 
  }) => {
    const isOpen = openDropdowns[sectionKey];
    
    return (
      <div className="space-y-1">
        <button
          onClick={() => toggleDropdown(sectionKey)}
          className="flex items-center w-full px-4 py-3 rounded-lg transition-colors text-gray-700 hover:bg-gray-100"
        >
          <span className="mr-3">{icon}</span>
          <span className="flex-1 text-left">{title}</span>
          {isOpen ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
        
        {isOpen && (
          <div className="ml-6 space-y-1">
            {children}
          </div>
        )}
      </div>
    );
  };

  const SubNavItem = ({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) => {
    const isActive = location.pathname === to;
    
    return (
      <Link
        to={to}
        className={`flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${
          isActive 
            ? 'bg-blue-100 text-blue-700' 
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        <span className="mr-2">{icon}</span>
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <aside className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col shadow-lg">
        <div className="py-4 border-b border-gray-200 mb-6">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            VieiraStock
          </h1>
          <p className="text-sm text-gray-500 font-medium">Sistema de Estoque TI</p>
        </div>
        
        <nav className="flex-1 space-y-2">
          {/* Dashboard */}
          {!isSupervisor && <NavItem to="/" icon={<LayoutGrid size={20} />} label="Dashboard" />}
          
          {/* Chamados */}
          <NavItem to="/tickets" icon={<Ticket size={20} />} label="Chamados" />
          
          {/* Estoque */}
          {!isSupervisor && (
            <DropdownSection 
              title="Estoque" 
              icon={<Archive size={20} />} 
              sectionKey="estoque"
            >
              {!isIntern && (
                <>
                  <SubNavItem to="/categories" icon={<Layers size={16} />} label="Categorias" />
                  <SubNavItem to="/products" icon={<Package size={16} />} label="Produtos" />
                </>
              )}
              {(isAdmin || (!isIntern && !isSupervisor)) && (
                <SubNavItem to="/intern-review" icon={<UserCheck size={16} />} label="Revisão de Estagiários" />
              )}
            </DropdownSection>
          )}
          
          {/* Configurações */}
          <DropdownSection 
            title="Configurações" 
            icon={<Settings size={20} />} 
            sectionKey="configuracoes"
          >
            {!isIntern && !isSupervisor && (
              isAdmin && (
                <SubNavItem to="/reports" icon={<FileText size={16} />} label="Relatórios" />
              )
            )}
            {isAdmin && (
              <>
                <SubNavItem to="/users" icon={<Users size={16} />} label="Usuários" />
                <SubNavItem to="/companies" icon={<Building2 size={16} />} label="Empresas" />
              </>
            )}
          </DropdownSection>
          
          {/* Tools */}
          <DropdownSection 
            title="Ferramentas" 
            icon={<Wrench size={20} />} 
            sectionKey="tools"
          >
            <SubNavItem to="/calendar" icon={<CalendarIcon size={16} />} label="Calendário" />
            <SubNavItem to="/notes" icon={<StickyNote size={16} />} label="Anotações" />
            <SubNavItem to="/password-manager" icon={<Key size={16} />} label="Gerenciador de Senhas" />
          </DropdownSection>
          
          {/* Intern Activities */}
          {isIntern && (
            <NavItem to="/intern-activities" icon={<ClipboardList size={20} />} label="Minhas Atividades" />
          )}
        </nav>
        
        <div className="pt-4 mt-auto border-t border-gray-200">
          <div className="px-4 py-2">
            <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500">
              {user?.role === 'admin' ? 'Administrador' : 
               user?.role === 'intern' ? 'Estagiário' :
               user?.role === 'supervisor' ? 'Supervisor' : 'Usuário'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 rounded-lg hover:bg-red-50 hover:text-red-700 transition-all duration-200"
          >
            <LogOut size={18} className="mr-2" />
            <span>Sair</span>
          </button>
        </div>
      </aside>
      
      <main className="flex-1 overflow-auto p-8 bg-gradient-to-br from-white to-gray-50">
        {children}
      </main>
    </div>
  );
};

export default Layout;