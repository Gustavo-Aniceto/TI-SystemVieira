import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { FileText, Download } from 'lucide-react';

interface ReportFormData {
  type: string;
  categoryId?: string;
  status?: string;
  lowStock?: boolean;
  startDate?: string;
  endDate?: string;
  eventType?: string;
}

const Reports = () => {
  const { categories, generateReport } = useData();
  const [formData, setFormData] = useState<ReportFormData>({
    type: 'products'
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkboxInput = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checkboxInput.checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const filters: any = {};
    
    switch (formData.type) {
      case 'products':
        if (formData.categoryId) filters.categoryId = formData.categoryId;
        if (formData.status) filters.status = formData.status;
        if (formData.lowStock) filters.lowStock = true;
        break;
        
      case 'events':
        if (formData.startDate) filters.startDate = formData.startDate;
        if (formData.endDate) filters.endDate = formData.endDate;
        if (formData.eventType) filters.type = formData.eventType;
        break;
    }
    
    generateReport(formData.type, filters);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
        <p className="mt-1 text-sm text-gray-600">
          Gere relatórios para exportar seus dados.
        </p>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-medium text-gray-900">Gerar Relatório</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Relatório *
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="products">Produtos</option>
                <option value="categories">Categorias</option>
                <option value="events">Eventos</option>
              </select>
            </div>
            
            {formData.type === 'products' && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria
                  </label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={formData.categoryId || ''}
                    onChange={handleChange}
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Todas as categorias</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status || ''}
                    onChange={handleChange}
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Todos os status</option>
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                    <option value="maintenance">Em Manutenção</option>
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="lowStock"
                    name="lowStock"
                    checked={formData.lowStock || false}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="lowStock" className="ml-2 block text-sm text-gray-700">
                    Apenas estoque baixo
                  </label>
                </div>
              </div>
            )}
            
            {formData.type === 'events' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Início
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={formData.startDate || ''}
                      onChange={handleChange}
                      className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Término
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={formData.endDate || ''}
                      onChange={handleChange}
                      min={formData.startDate}
                      className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Evento
                  </label>
                  <select
                    id="eventType"
                    name="eventType"
                    value={formData.eventType || ''}
                    onChange={handleChange}
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Todos os tipos</option>
                    <option value="subscription">Assinatura</option>
                    <option value="task">Tarefa</option>
                    <option value="reminder">Lembrete</option>
                  </select>
                </div>
              </div>
            )}
            
            <div className="pt-4">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Download className="w-5 h-5 mr-2" />
                Gerar Relatório Excel
              </button>
            </div>
          </div>
        </form>
      </div>
      
      <div className="mt-8 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-medium text-gray-900">Sobre os Relatórios</h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className="bg-blue-100 rounded-full p-2 mr-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Produtos</h3>
              </div>
              <p className="text-sm text-gray-600">
                Relatórios de produtos incluem informações sobre quantidade, categoria, status e outros detalhes dos itens em seu inventário.
              </p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className="bg-green-100 rounded-full p-2 mr-2">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Categorias</h3>
              </div>
              <p className="text-sm text-gray-600">
                Visualize todas as suas categorias de produtos com suas descrições e datas de criação.
              </p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className="bg-purple-100 rounded-full p-2 mr-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Eventos</h3>
              </div>
              <p className="text-sm text-gray-600">
                Exporte seus eventos de calendário, incluindo assinaturas, tarefas e lembretes com datas e descrições.
              </p>
            </div>
          </div>
          
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-md font-medium text-blue-800 mb-2">Dica:</h3>
            <p className="text-sm text-blue-700">
              Os relatórios são gerados no formato Excel (.xlsx) e podem ser abertos no Microsoft Excel, Google Sheets, LibreOffice Calc ou qualquer outro software compatível.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;