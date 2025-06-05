import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Ticket, MessageSquare, Plus, Edit, Trash2, X, Filter, Send } from 'lucide-react';

interface TicketFormData {
  problem: string;
  supervisor: string;
  operator: string;
  company: string;
  anydeskAccess: string;
}

const Tickets = () => {
  const { tickets, addTicket, updateTicket, deleteTicket, addTicketComment, users } = useData();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [formData, setFormData] = useState<TicketFormData>({
    problem: '',
    supervisor: '',
    operator: '',
    company: '',
    anydeskAccess: ''
  });
  const [filterStatus, setFilterStatus] = useState<string>('');

  const filteredTickets = tickets.filter(ticket => {
    if (filterStatus && ticket.status !== filterStatus) return false;
    return true;
  });

  const resetForm = () => {
    setFormData({
      problem: '',
      supervisor: '',
      operator: '',
      company: '',
      anydeskAccess: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addTicket({
      ...formData,
      createdBy: user!.id
    });
    
    setIsModalOpen(false);
    resetForm();
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedTicket && comment.trim()) {
      addTicketComment(selectedTicket, {
        ticketId: selectedTicket,
        userId: user!.id,
        content: comment
      });
      
      setComment('');
      setIsCommentModalOpen(false);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este chamado?')) {
      deleteTicket(id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open':
        return 'Aberto';
      case 'in-progress':
        return 'Em Andamento';
      case 'resolved':
        return 'Resolvido';
      case 'closed':
        return 'Fechado';
      default:
        return status;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chamados</h1>
          <p className="mt-1 text-sm text-gray-600">
            Gerencie os chamados de suporte
          </p>
        </div>
        {user?.role === 'supervisor' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Novo Chamado
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Filter className="w-5 h-5 text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-700">Status:</span>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-md border border-gray-300 py-2 px-3 text-sm"
          >
            <option value="">Todos</option>
            <option value="open">Aberto</option>
            <option value="in-progress">Em Andamento</option>
            <option value="resolved">Resolvido</option>
            <option value="closed">Fechado</option>
          </select>
          <button
            onClick={() => setFilterStatus('')}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Limpar filtros
          </button>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.map(ticket => {
          const creator = users.find(u => u.id === ticket.createdBy);
          
          return (
            <div
              key={ticket.id}
              className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                      {getStatusText(ticket.status)}
                    </span>
                    <span className="text-sm text-gray-500">
                      Criado em {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-medium text-gray-900">⚙️ PROBLEMA:</h3>
                    <p className="text-gray-600">{ticket.problem}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">👩🏽‍💼 SUPERVISORA:</h4>
                      <p className="text-sm text-gray-600">{ticket.supervisor}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">👩🏽‍💻 OPERADOR:</h4>
                      <p className="text-sm text-gray-600">{ticket.operator}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">🏢 EMPRESA:</h4>
                      <p className="text-sm text-gray-600">{ticket.company}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">🔑 ACESSO ANYDESK:</h4>
                      <p className="text-sm text-gray-600">{ticket.anydeskAccess}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedTicket(ticket.id);
                      setIsCommentModalOpen(true);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <MessageSquare className="w-5 h-5" />
                  </button>
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => handleDelete(ticket.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Comments */}
              {ticket.comments.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Comentários:</h4>
                  <div className="space-y-4">
                    {ticket.comments.map(comment => {
                      const commentUser = users.find(u => u.id === comment.userId);
                      return (
                        <div key={comment.id} className="flex space-x-3">
                          <div className="flex-1 bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900">
                                {commentUser?.name || 'Usuário Removido'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(comment.createdAt).toLocaleString('pt-BR')}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-gray-600">{comment.content}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* New Ticket Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Novo Chamado</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    ⚙️ PROBLEMA *
                  </label>
                  <textarea
                    required
                    value={formData.problem}
                    onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    👩🏽‍💼 SUPERVISORA *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.supervisor}
                    onChange={(e) => setFormData({ ...formData, supervisor: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    👩🏽‍💻 OPERADOR *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.operator}
                    onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    🏢 EMPRESA *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    🔑 ACESSO ANYDESK *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.anydeskAccess}
                    onChange={(e) => setFormData({ ...formData, anydeskAccess: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Criar Chamado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Comment Modal */}
      {isCommentModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Adicionar Comentário</h2>
              <button
                onClick={() => {
                  setIsCommentModalOpen(false);
                  setSelectedTicket(null);
                  setComment('');
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCommentSubmit}>
              <div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Digite seu comentário..."
                  className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  rows={4}
                />
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsCommentModalOpen(false);
                    setSelectedTicket(null);
                    setComment('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Enviar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tickets;