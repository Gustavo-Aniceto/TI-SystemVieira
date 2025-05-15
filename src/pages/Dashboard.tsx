import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { AlertTriangle, Package, Layers, Calendar as CalendarIcon } from 'lucide-react';

const Dashboard = () => {
  const { products, categories, events, getLowStockProducts } = useData();
  const { user } = useAuth();
  const [lowStockProducts, setLowStockProducts] = useState<typeof products>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<typeof events>([]);
  
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
  }, [products, events, getLowStockProducts]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Bem-vindo, {user?.name}! Aqui está um resumo do seu sistema.
        </p>
      </header>
      
      {/* Stats overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Total de Produtos</p>
              <p className="text-xl font-semibold text-gray-900">{products.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
              <Layers className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Categorias</p>
              <p className="text-xl font-semibold text-gray-900">{categories.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-amber-100 rounded-md p-3">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Estoque Baixo</p>
              <p className="text-xl font-semibold text-gray-900">{lowStockProducts.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
              <CalendarIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Eventos Próximos</p>
              <p className="text-xl font-semibold text-gray-900">{upcomingEvents.length}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Low stock products */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200 px-5 py-3">
          <h2 className="text-lg font-medium text-gray-900">Produtos com Estoque Baixo</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {lowStockProducts.length === 0 ? (
            <div className="px-5 py-4 text-sm text-gray-500">
              Todos os produtos estão com estoque adequado.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Qtd Atual
                    </th>
                    <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Qtd Mínima
                    </th>
                    <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {lowStockProducts.slice(0, 5).map((product) => {
                    const category = categories.find(c => c.id === product.categoryId);
                    
                    return (
                      <tr key={product.id}>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{category?.name || 'Sem categoria'}</div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{product.quantity}</div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{product.minQuantity}</div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            product.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : product.status === 'maintenance'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.status === 'active'
                              ? 'Ativo'
                              : product.status === 'maintenance'
                              ? 'Em Manutenção'
                              : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link to={`/products`} className="text-blue-600 hover:text-blue-900">
                            Ver detalhes
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {lowStockProducts.length > 5 && (
                <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 text-right">
                  <Link to="/products?filter=lowstock" className="text-sm text-blue-600 hover:text-blue-900">
                    Ver todos os {lowStockProducts.length} produtos
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Upcoming events */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200 px-5 py-3">
          <h2 className="text-lg font-medium text-gray-900">Próximos Eventos</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {upcomingEvents.length === 0 ? (
            <div className="px-5 py-4 text-sm text-gray-500">
              Não há eventos agendados para os próximos 7 dias.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Título
                    </th>
                    <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data de Início
                    </th>
                    <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data de Término
                    </th>
                    <th scope="col" className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {upcomingEvents.slice(0, 5).map((event) => (
                    <tr key={event.id}>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{event.title}</div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(event.startDate).toLocaleDateString('pt-BR')}
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(event.endDate).toLocaleDateString('pt-BR')}
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link to="/calendar" className="text-blue-600 hover:text-blue-900">
                          Ver detalhes
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {upcomingEvents.length > 5 && (
                <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 text-right">
                  <Link to="/calendar" className="text-sm text-blue-600 hover:text-blue-900">
                    Ver todos os {upcomingEvents.length} eventos
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;