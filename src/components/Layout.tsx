import React, { useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
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
  UserCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

const Layout = () => {
  const { user, logout, isAdmin } = useAuth();
  const { getLowStockProducts } = useData();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check for low stock products on initial load
  useEffect(() => {
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
  }, [getLowStockProducts, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const NavItem = ({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) => {
    const isActive = location.pathname === to;
    
    return (
      <Link
        to={to}
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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col">
        <div className="py-4 border-b border-gray-200 mb-6">
          <h1 className="text-xl font-bold text-blue-600">Aniceto&Vieira</h1>
          <p className="text-sm text-gray-500">Sistema de Estoque TI</p>
        </div>
        
        <nav className="flex-1 space-y-1">
          <NavItem to="/" icon={<LayoutGrid size={20} />} label="Dashboard" />
          <NavItem to="/categories" icon={<Layers size={20} />} label="Categorias" />
          <NavItem to="/products" icon={<Package size={20} />} label="Produtos" />
          <NavItem to="/calendar" icon={<CalendarIcon size={20} />} label="Calendário" />
          <NavItem to="/reports" icon={<FileText size={20} />} label="Relatórios" />
          {isAdmin && <NavItem to="/users" icon={<Users size={20} />} label="Usuários" />}
          {user?.role === 'intern' && (
            <NavItem to="/intern-activities" icon={<ClipboardList size={20} />} label="Minhas Atividades" />
          )}
          {isAdmin && (
            <NavItem to="/intern-review" icon={<UserCheck size={20} />} label="Revisão de Estagiários" />
          )}
        </nav>
        
        <div className="pt-4 mt-auto border-t border-gray-200">
          <div className="px-4 py-2">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500">
              {user?.role === 'admin' ? 'Administrador' : 
               user?.role === 'intern' ? 'Estagiário' : 'Usuário'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100"
          >
            <LogOut size={18} className="mr-2" />
            <span>Sair</span>
          </button>
        </div>
      </aside>
      
      {/* Main content */}
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;