import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Ticket, MessageSquare, Plus, Edit, Trash2, X, Filter, Send, FileText, Clock, CheckCircle } from 'lucide-react';

interface TicketFormData {
  problem: string;
  supervisor: string;
  operator: string;
  company: string;
  anydeskAccess: string;
}

const Tickets = () => {
  const { tickets, addTicket, updateTicket, deleteTicket, addTicketComment, users } = useData();
  const { user, isSupervisor } = useAuth();
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
  const [activeTab, setActiveTab] = useState<'create' | 'my-tickets' | 'all-tickets'>(
    isSupervisor ? 'create' : 'all-tickets'
  );

  const filteredTickets = tickets.filter(ticket => {
    if (filterStatus && ticket.status !== filterStatus) return false;
    if (activeTab === 'my-tickets' && ticket.createdBy !== user?.id) return false;
    return true;
  });

  const myTicketsCount = tickets.filter(ticket => ticket.createdBy === user?.id).length;
  const openTicketsCount = tickets.filter(ticket => ticket.status === 'open').length;

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
    
    resetForm();
    setActiveTab('my-tickets');
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

  const handleStatusChange = (ticketId: string, newStatus: string) => {
    updateTicket(ticketId, { status: newStatus });
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
          <h1 className="text-2xl font-bold text-gray-900">
            {isSupervisor ? 'Central de Chamados' : 'Chamados'}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {isSupervisor 
              ? 'Gerencie seus chamados de suporte'
              : 'Visualize e gerencie todos os chamados do sistema'
            }
          </p>
        </div>
        
        {/* Stats Cards for Supervisor */}
        {isSupervisor && (
          <div className="flex space-x-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-blue-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Meus Chamados</p>
                  <p className="text-lg font-bold text-blue-600">{myTicketsCount}</p>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-yellow-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-yellow-900">Em Aberto</p>
                  <p className="text-lg font-bold text-yellow-600">{openTicketsCount}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-8" aria-label="Tabs">
          {isSupervisor && (
            <button
              onClick={() => setActiveTab('create')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'create'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Plus className="w-4 h-4 inline mr-1" />
              Criar Chamado
            </button>
          )}
          
          {isSupervisor && (
            <button
              onClick={() => setActiveTab('my-tickets')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'my-tickets'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-1" />
              Meus Chamados ({myTicketsCount})
            </button>
          )}
          
          <button
            onClick={() => setActiveTab('all-tickets')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'all-tickets'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Ticket className="w-4 h-4 inline mr-1" />
            {isSupervisor ? 'Todos os Chamados' : 'Chamados'} ({tickets.length})
          </button>
        </nav>
      </div>

      {/* Create Ticket Form */}
      {activeTab === 'create' && isSupervisor && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Criar Novo Chamado</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ⚙️ PROBLEMA *
                </label>
                <textarea
                  required
                  value={formData.problem}
                  onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                  className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  rows={3}
                  placeholder="Descreva detalhadamente o problema encontrado..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    👩🏽‍💼 SUPERVISORA *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.supervisor}
                    onChange={(e) => setFormData({ ...formData, supervisor: e.target.value })}
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Nome da supervisora responsável"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    👩🏽‍💻 OPERADOR *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.operator}
                    onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Nome do operador"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    🏢 EMPRESA *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Nome da empresa"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    🔑 ACESSO ANYDESK *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.anydeskAccess}
                    onChange={(e) => setFormData({ ...formData, anydeskAccess: e.target.value })}
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="ID e senha do AnyDesk"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Chamado
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Tickets List */}
      {(activeTab === 'my-tickets' || activeTab === 'all-tickets') && (
        <>
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

          {/* Tickets */}
          <div className="space-y-4">
            {filteredTickets.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <Ticket className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {activeTab === 'my-tickets' ? 'Nenhum chamado criado' : 'Nenhum chamado encontrado'}
                </h3>
                <p className="text-gray-500">
                  {activeTab === 'my-tickets' 
                    ? 'Você ainda não criou nenhum chamado.'
                    : 'Não há chamados que correspondam aos filtros selecionados.'
                  }
                </p>
              </div>
            ) : (
              filteredTickets.map(ticket => {
                const creator = users.find(u => u.id === ticket.createdBy);
                
                return (
                  <div
                    key={ticket.id}
                    className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                          {getStatusText(ticket.status)}
                        </span>
                        <span className="text-sm text-gray-500">
                          Criado por {creator?.name || 'Usuário Removido'}
                        </span>
                        <span className="text-sm text-gray-500">
                          em {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {!isSupervisor && (
                          <select
                            value={ticket.status}
                            onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="open">Aberto</option>
                            <option value="in-progress">Em Andamento</option>
                            <option value="resolved">Resolvido</option>
                            <option value="closed">Fechado</option>
                          </select>
                        )}
                        
                        <button
                          onClick={() => {
                            setSelectedTicket(ticket.id);
                            setIsCommentModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 p-1"
                        >
                          <MessageSquare className="w-5 h-5" />
                        </button>
                        
                        {user?.role === 'admin' && (
                          <button
                            onClick={() => handleDelete(ticket.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">⚙️ PROBLEMA:</h3>
                        <p className="text-gray-600 bg-gray-50 p-3 rounded-md">{ticket.problem}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-3 rounded-md">
                          <h4 className="text-sm font-medium text-blue-900 mb-1">👩🏽‍💼 SUPERVISORA:</h4>
                          <p className="text-sm text-blue-800">{ticket.supervisor}</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-md">
                          <h4 className="text-sm font-medium text-green-900 mb-1">👩🏽‍💻 OPERADOR:</h4>
                          <p className="text-sm text-green-800">{ticket.operator}</p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-md">
                          <h4 className="text-sm font-medium text-purple-900 mb-1">🏢 EMPRESA:</h4>
                          <p className="text-sm text-purple-800">{ticket.company}</p>
                        </div>
                        <div className="bg-orange-50 p-3 rounded-md">
                          <h4 className="text-sm font-medium text-orange-900 mb-1">🔑 ACESSO ANYDESK:</h4>
                          <p className="text-sm text-orange-800 font-mono">{ticket.anydeskAccess}</p>
                        </div>
                      </div>
                    </div>

                    {/* Comments */}
                    {ticket.comments.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Comentários ({ticket.comments.length})
                        </h4>
                        <div className="space-y-3">
                          {ticket.comments.map(comment => {
                            const commentUser = users.find(u => u.id === comment.userId);
                            return (
                              <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-gray-900">
                                    {commentUser?.name || 'Usuário Removido'}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(comment.createdAt).toLocaleString('pt-BR')}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600">{comment.content}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </>
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
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Send className="w-4 h-4 mr-2" />
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