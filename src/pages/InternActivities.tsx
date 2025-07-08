import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { FileText, Plus, Edit, Trash2, X, Filter, Clock, Play, Square, Send, RotateCcw } from 'lucide-react';

interface ActivityFormData {
  description: string;
  category: 'maintenance' | 'support' | 'inventory' | 'other';
}

const InternActivities = () => {
  const { user } = useAuth();
  const { activities, addActivity, updateActivity, deleteActivity, generateReport } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentActivity, setCurrentActivity] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');
  const [formData, setFormData] = useState<ActivityFormData>({
    description: '',
    category: 'support'
  });

  const userActivities = activities.filter(activity => 
    activity.internId === user?.id
  );

  const filteredActivities = userActivities.filter(activity => {
    if (filterCategory && activity.category !== filterCategory) return false;
    if (filterStatus && activity.status !== filterStatus) return false;
    if (filterStartDate && new Date(activity.startDate) < new Date(filterStartDate)) return false;
    if (filterEndDate && new Date(activity.startDate) > new Date(filterEndDate)) return false;
    return true;
  });

  const resetForm = () => {
    setFormData({
      description: '',
      category: 'support'
    });
    setCurrentActivity(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalMode('add');
    setIsModalOpen(true);
  };

  const openEditModal = (activity: any) => {
    setFormData({
      description: activity.description,
      category: activity.category
    });
    setCurrentActivity(activity.id);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (modalMode === 'add') {
      addActivity({
        ...formData,
        internId: user!.id
      });
    } else if (modalMode === 'edit' && currentActivity) {
      updateActivity(currentActivity, formData);
    }
    
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta atividade?')) {
      deleteActivity(id);
    }
  };

  const handleCompleteActivity = (id: string) => {
    updateActivity(id, { status: 'completed' });
  };

  const handleSubmitForReview = (id: string) => {
    updateActivity(id, { status: 'pending-review' });
  };

  const handleResubmit = (id: string) => {
    updateActivity(id, { status: 'pending-review', rejectionReason: undefined });
  };

  const formatDuration = (minutes: number | undefined): string => {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getElapsedTime = (startDate: string): string => {
    const start = new Date(startDate).getTime();
    const now = new Date().getTime();
    const elapsed = Math.round((now - start) / (1000 * 60));
    return formatDuration(elapsed);
  };

  const generateActivityReport = () => {
    const filters = {
      internId: user?.id,
      category: filterCategory,
      status: filterStatus,
      startDate: filterStartDate,
      endDate: filterEndDate
    };
    
    generateReport('internActivities', filters);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Minhas Atividades</h1>
          <p className="mt-1 text-sm text-gray-600">
            Registre e acompanhe suas atividades com controle de tempo automático
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          <Plus className="w-5 h-5 mr-1" />
          Iniciar Nova Atividade
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoria
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="block w-full rounded-md border border-gray-300 py-2 px-3 text-sm"
            >
              <option value="">Todas</option>
              <option value="maintenance">Manutenção</option>
              <option value="support">Suporte</option>
              <option value="inventory">Inventário</option>
              <option value="other">Outros</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="block w-full rounded-md border border-gray-300 py-2 px-3 text-sm"
            >
              <option value="">Todos</option>
              <option value="in-progress">Em Andamento</option>
              <option value="completed">Finalizada</option>
              <option value="pending-review">Aguardando Revisão</option>
              <option value="approved">Aprovada</option>
              <option value="rejected">Rejeitada</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Inicial
            </label>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="block w-full rounded-md border border-gray-300 py-2 px-3 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Final
            </label>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              min={filterStartDate}
              className="block w-full rounded-md border border-gray-300 py-2 px-3 text-sm"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end space-x-3">
          <button
            onClick={() => {
              setFilterCategory('');
              setFilterStatus('');
              setFilterStartDate('');
              setFilterEndDate('');
            }}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Limpar Filtros
          </button>
          <button
            onClick={generateActivityReport}
            className="flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
          >
            <FileText className="w-4 h-4 mr-1" />
            Gerar Relatório
          </button>
        </div>
      </div>

      {/* Activities List */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data/Hora Início
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descrição
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duração
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredActivities.map((activity) => (
                <tr key={activity.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(activity.startDate).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      activity.category === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                      activity.category === 'support' ? 'bg-blue-100 text-blue-800' :
                      activity.category === 'inventory' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {activity.category === 'maintenance' ? 'Manutenção' :
                       activity.category === 'support' ? 'Suporte' :
                       activity.category === 'inventory' ? 'Inventário' : 'Outros'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div>{activity.description}</div>
                    {activity.feedback && (
                      <div className="mt-1 text-xs text-green-600">
                        <strong>Feedback:</strong> {activity.feedback}
                      </div>
                    )}
                    {activity.rejectionReason && (
                      <div className="mt-1 text-xs text-red-600">
                        <strong>Motivo da rejeição:</strong> {activity.rejectionReason}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1 text-gray-400" />
                      {activity.status === 'in-progress' ? (
                        <span className="text-blue-600 font-medium">
                          {getElapsedTime(activity.startDate)}
                        </span>
                      ) : (
                        formatDuration(activity.duration)
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      activity.status === 'approved' ? 'bg-green-100 text-green-800' :
                      activity.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      activity.status === 'pending-review' ? 'bg-yellow-100 text-yellow-800' :
                      activity.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {activity.status === 'approved' ? 'Aprovada' :
                       activity.status === 'rejected' ? 'Rejeitada' :
                       activity.status === 'pending-review' ? 'Aguardando Revisão' :
                       activity.status === 'completed' ? 'Finalizada' :
                       'Em Andamento'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      {activity.status === 'in-progress' && (
                        <>
                          <button
                            onClick={() => openEditModal(activity)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Editar descrição"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleCompleteActivity(activity.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Finalizar atividade"
                          >
                            <Square className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(activity.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Excluir atividade"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      
                      {activity.status === 'completed' && (
                        <button
                          onClick={() => handleSubmitForReview(activity.id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Enviar para revisão"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      )}
                      
                      {activity.status === 'rejected' && (
                        <>
                          <button
                            onClick={() => openEditModal(activity)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Editar e corrigir"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleResubmit(activity.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Reenviar para revisão"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {modalMode === 'add' ? 'Iniciar Nova Atividade' : 'Editar Atividade'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="maintenance">Manutenção</option>
                    <option value="support">Suporte</option>
                    <option value="inventory">Inventário</option>
                    <option value="other">Outros</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição da Atividade *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={3}
                    placeholder="Descreva detalhadamente a atividade que você irá realizar..."
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  ></textarea>
                </div>

                {modalMode === 'add' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <strong>Importante:</strong> O cronômetro será iniciado automaticamente quando você criar a atividade. 
                      Lembre-se de finalizar quando terminar para registrar o tempo correto.
                    </p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  {modalMode === 'add' ? 'Iniciar Atividade' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternActivities;