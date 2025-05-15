import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Check, X as XIcon, MessageSquare, Filter, FileText } from 'lucide-react';

const InternReview = () => {
  const { activities, users, updateActivity, generateReport } = useData();
  const [filterIntern, setFilterIntern] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');
  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    activityId: string;
    feedback: string;
    action: 'approve' | 'reject';
  }>({
    isOpen: false,
    activityId: '',
    feedback: '',
    action: 'approve'
  });

  const interns = users.filter(user => user.role === 'intern');

  const filteredActivities = activities.filter(activity => {
    if (filterIntern && activity.internId !== filterIntern) return false;
    if (filterCategory && activity.category !== filterCategory) return false;
    if (filterStatus && activity.status !== filterStatus) return false;
    if (filterStartDate && new Date(activity.date) < new Date(filterStartDate)) return false;
    if (filterEndDate && new Date(activity.date) > new Date(filterEndDate)) return false;
    return true;
  });

  const handleStatusChange = (activityId: string, action: 'approve' | 'reject') => {
    setFeedbackModal({
      isOpen: true,
      activityId,
      feedback: '',
      action
    });
  };

  const handleFeedbackSubmit = () => {
    const { activityId, feedback, action } = feedbackModal;
    updateActivity(activityId, {
      status: action === 'approve' ? 'approved' : 'rejected',
      feedback
    });
    setFeedbackModal({ isOpen: false, activityId: '', feedback: '', action: 'approve' });
  };

  const generateActivityReport = () => {
    const filters = {
      internId: filterIntern,
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
          <h1 className="text-2xl font-bold text-gray-900">Revisão de Atividades</h1>
          <p className="mt-1 text-sm text-gray-600">
            Gerencie e avalie as atividades dos estagiários
          </p>
        </div>
        <button
          onClick={generateActivityReport}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          <FileText className="w-5 h-5 mr-2" />
          Gerar Relatório
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estagiário
            </label>
            <select
              value={filterIntern}
              onChange={(e) => setFilterIntern(e.target.value)}
              className="block w-full rounded-md border border-gray-300 py-2 px-3 text-sm"
            >
              <option value="">Todos</option>
              {interns.map(intern => (
                <option key={intern.id} value={intern.id}>
                  {intern.name}
                </option>
              ))}
            </select>
          </div>

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
              <option value="pending">Pendente</option>
              <option value="approved">Aprovado</option>
              <option value="rejected">Rejeitado</option>
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

        <div className="mt-4 flex justify-end">
          <button
            onClick={() => {
              setFilterIntern('');
              setFilterCategory('');
              setFilterStatus('');
              setFilterStartDate('');
              setFilterEndDate('');
            }}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Limpar Filtros
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
                  Estagiário
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descrição
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Horas
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
              {filteredActivities.map((activity) => {
                const intern = users.find(u => u.id === activity.internId);
                
                return (
                  <tr key={activity.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {intern?.name || 'Usuário Removido'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(activity.date).toLocaleDateString('pt-BR')}
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
                      {activity.description}
                      {activity.feedback && (
                        <div className="mt-1 text-xs text-gray-500">
                          <strong>Feedback:</strong> {activity.feedback}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {activity.hours}h
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        activity.status === 'approved' ? 'bg-green-100 text-green-800' :
                        activity.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {activity.status === 'approved' ? 'Aprovado' :
                         activity.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {activity.status === 'pending' && (
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleStatusChange(activity.id, 'approve')}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(activity.id, 'reject')}
                            className="text-red-600 hover:text-red-900"
                          >
                            <XIcon className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feedback Modal */}
      {feedbackModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {feedbackModal.action === 'approve' ? 'Aprovar' : 'Rejeitar'} Atividade
              </h2>
              <button
                onClick={() => setFeedbackModal({ isOpen: false, activityId: '', feedback: '', action: 'approve' })}
                className="text-gray-400 hover:text-gray-500"
              >
                <XIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-1">
                  Feedback
                </label>
                <textarea
                  id="feedback"
                  value={feedbackModal.feedback}
                  onChange={(e) => setFeedbackModal(prev => ({ ...prev, feedback: e.target.value }))}
                  rows={4}
                  className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Digite seu feedback..."
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setFeedbackModal({ isOpen: false, activityId: '', feedback: '', action: 'approve' })}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleFeedbackSubmit}
                  className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    feedbackModal.action === 'approve'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {feedbackModal.action === 'approve' ? 'Aprovar' : 'Rejeitar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternReview;