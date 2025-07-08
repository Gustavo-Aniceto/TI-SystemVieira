import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { 
  Monitor, 
  Package, 
  Layers, 
  Calendar as CalendarIcon,
  AlertTriangle,
  Ticket,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  Users,
  Building2
} from 'lucide-react';

const Dashboard = () => {
  const { products, categories, events, tickets, users, companies, getLowStockProducts } = useData();
  const { user } = useAuth();
  const [lowStockProducts, setLowStockProducts] = useState<typeof products>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<typeof events>([]);
  const [ticketStats, setTicketStats] = useState({
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0
  });
  
  useEffect(() => {
    // Get low stock products
    setLowStockProducts(getLowStockProducts());
    
    // Get upcoming events (next 7 days)
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);
    
    const upcoming = events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate >= now && eventDate <= nextWeek;
    });
    
    setUpcomingEvents(upcoming);

    // Calculate ticket statistics
    const stats = tickets.reduce((acc, ticket) => {
      acc[ticket.status.replace('-', '') as keyof typeof acc]++;
      return acc;
    }, { open: 0, inProgress: 0, resolved: 0, closed: 0 });
    
    setTicketStats(stats);
  }, [products, events, tickets, getLowStockProducts]);

  const MetricCard = ({ 
    title, 
    value, 
    icon, 
    bgColor, 
    textColor = 'text-white',
    link 
  }: { 
    title: string;
    value: string | number;
    icon: React.ReactNode;
    bgColor: string;
    textColor?: string;
    link?: string;
  }) => {
    const CardContent = () => (
      <div className={`${bgColor} rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`${textColor} text-sm font-medium opacity-90`}>{title}</p>
            <p className={`${textColor} text-3xl font-bold mt-1`}>{value}</p>
          </div>
          <div className={`${textColor} opacity-80`}>
            {icon}
          </div>
        </div>
      </div>
    );

    if (link) {
      return (
        <Link to={link} className="block">
          <CardContent />
        </Link>
      );
    }

    return <CardContent />;
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Bem-vindo, {user?.name}! Aqui está um resumo do seu sistema.
        </p>
      </header>
      
      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <MetricCard
          title="Computadores"
          value={products.filter(p => {
            const category = categories.find(c => c.id === p.categoryId);
            return category?.name.toLowerCase().includes('hardware') || category?.name.toLowerCase().includes('computador');
          }).length}
          icon={<Monitor className="h-8 w-8" />}
          bgColor="bg-gradient-to-br from-red-400 to-red-500"
          link="/products"
        />
        
        <MetricCard
          title="Software"
          value={products.filter(p => {
            const category = categories.find(c => c.id === p.categoryId);
            return category?.name.toLowerCase().includes('software');
          }).length}
          icon={<Package className="h-8 w-8" />}
          bgColor="bg-gradient-to-br from-green-400 to-green-500"
          link="/products"
        />
        
        <MetricCard
          title="Dispositivos de Rede"
          value={products.filter(p => {
            const category = categories.find(c => c.id === p.categoryId);
            return category?.name.toLowerCase().includes('rede');
          }).length}
          icon={<Layers className="h-8 w-8" />}
          bgColor="bg-gradient-to-br from-blue-400 to-blue-500"
          link="/products"
        />
        
        <MetricCard
          title="Estoque Baixo"
          value={lowStockProducts.length}
          icon={<AlertTriangle className="h-8 w-8" />}
          bgColor="bg-gradient-to-br from-yellow-400 to-orange-500"
          link="/products?filter=lowstock"
        />
        
        <MetricCard
          title="Eventos Próximos"
          value={upcomingEvents.length}
          icon={<CalendarIcon className="h-8 w-8" />}
          bgColor="bg-gradient-to-br from-teal-400 to-teal-500"
          link="/calendar"
        />
      </div>

      {/* Secondary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <MetricCard
          title="Chamados Abertos"
          value={ticketStats.open}
          icon={<Ticket className="h-8 w-8" />}
          bgColor="bg-gradient-to-br from-red-500 to-red-600"
          link="/tickets?status=open"
        />
        
        <MetricCard
          title="Em Andamento"
          value={ticketStats.inProgress}
          icon={<Clock className="h-8 w-8" />}
          bgColor="bg-gradient-to-br from-yellow-500 to-yellow-600"
          link="/tickets?status=in-progress"
        />
        
        <MetricCard
          title="Resolvidos"
          value={ticketStats.resolved}
          icon={<CheckCircle className="h-8 w-8" />}
          bgColor="bg-gradient-to-br from-blue-500 to-blue-600"
          link="/tickets?status=resolved"
        />
        
        <MetricCard
          title="Total de Usuários"
          value={users.length}
          icon={<Users className="h-8 w-8" />}
          bgColor="bg-gradient-to-br from-purple-500 to-purple-600"
          link={isAdmin ? "/users" : undefined}
        />
        
        <MetricCard
          title="Empresas"
          value={companies.length}
          icon={<Building2 className="h-8 w-8" />}
          bgColor="bg-gradient-to-br from-indigo-500 to-indigo-600"
          link={isAdmin ? "/companies" : undefined}
        />
      </div>
      
      {/* Quick Actions and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Low Stock Products */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <AlertTriangle className="w-5 h-5 text-amber-500 mr-2" />
                Produtos com Estoque Baixo
              </h2>
              {lowStockProducts.length > 0 && (
                <Link to="/products?filter=lowstock" className="text-sm text-blue-600 hover:text-blue-800">
                  Ver todos
                </Link>
              )}
            </div>
          </div>
          <div className="p-6">
            {lowStockProducts.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-3" />
                <p className="text-gray-500">Todos os produtos estão com estoque adequado.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {lowStockProducts.slice(0, 5).map((product) => {
                  const category = categories.find(c => c.id === product.categoryId);
                  
                  return (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{product.name}</h4>
                        <p className="text-xs text-gray-500">{category?.name || 'Sem categoria'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-amber-700">
                          {product.quantity} / {product.minQuantity}
                        </p>
                        <p className="text-xs text-amber-600">Estoque baixo</p>
                      </div>
                    </div>
                  );
                })}
                {lowStockProducts.length > 5 && (
                  <div className="text-center pt-4">
                    <Link to="/products?filter=lowstock" className="text-sm text-blue-600 hover:text-blue-800">
                      Ver mais {lowStockProducts.length - 5} produtos
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Upcoming Events */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <CalendarIcon className="w-5 h-5 text-blue-500 mr-2" />
                Próximos Eventos
              </h2>
              {upcomingEvents.length > 0 && (
                <Link to="/calendar" className="text-sm text-blue-600 hover:text-blue-800">
                  Ver calendário
                </Link>
              )}
            </div>
          </div>
          <div className="p-6">
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500">Não há eventos agendados para os próximos 7 dias.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingEvents.slice(0, 5).map((event) => (
                  <div key={event.id} className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{event.title}</h4>
                      <p className="text-xs text-gray-500">{event.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-blue-700">
                        {new Date(event.startDate).toLocaleDateString('pt-BR')}
                      </p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        event.type === 'subscription'
                          ? 'bg-blue-100 text-blue-800'
                          : event.type === 'task'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {event.type === 'subscription'
                          ? 'Assinatura'
                          : event.type === 'task'
                          ? 'Tarefa'
                          : 'Lembrete'}
                      </span>
                    </div>
                  </div>
                ))}
                {upcomingEvents.length > 5 && (
                  <div className="text-center pt-4">
                    <Link to="/calendar" className="text-sm text-blue-600 hover:text-blue-800">
                      Ver mais {upcomingEvents.length - 5} eventos
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Tickets Summary */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
              Resumo de Chamados
            </h2>
            <Link to="/tickets" className="text-sm text-blue-600 hover:text-blue-800">
              Ver todos os chamados
            </Link>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{ticketStats.open}</div>
              <div className="text-sm text-red-700">Abertos</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{ticketStats.inProgress}</div>
              <div className="text-sm text-yellow-700">Em Andamento</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{ticketStats.resolved}</div>
              <div className="text-sm text-blue-700">Resolvidos</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{ticketStats.closed}</div>
              <div className="text-sm text-green-700">Fechados</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;