import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Ticket as TicketIcon, 
  Plus, 
  MessageSquare, 
  Clock, 
  User, 
  Building2, 
  Monitor,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  ArrowRight,
  Timer
} from 'lucide-react';
import toast from 'react-hot-toast';

interface TicketFormData {
  problem: string;
  supervisor: string;
  operator: string;
  company: string;
  anydeskAccess: string;
}

const Tickets = () => {
  const { tickets, addTicket, updateTicket, addTicketComment, transferTicket, respondToTransfer, users, companies } = useData();
  const { user, isAdmin, isSupervisor } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [transferModal, setTransferModal] = useState<{
    isOpen: boolean;
    ticketId: string;
    toUserId: string;
    reason: string;
  }>({
    isOpen: false,
    ticketId: '',
    toUserId: '',
    reason: ''
  });
  const [formData, setFormData] = useState<TicketFormData>({
    problem: '',
    supervisor: '',
    operator: '',
    company: '',
    anydeskAccess: ''
  });

  // Filter tickets based on user role
  const filteredTickets = tickets.filter(ticket => {
    if (isSupervisor) {
      return ticket.createdBy === user?.id;
    }
    return true; // Admins and users can see all tickets
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

  const openModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTicket({
      ...formData,
      createdBy: user!.id
    });
    closeModal();
  };

  const handleStatusChange = (ticketId: string, status: string, feedback?: string) => {
    const updateData: any = { status };
    
    if (status === 'in-progress' && !tickets.find(t => t.id === ticketId)?.attendedBy) {
      updateData.attendedBy = user!.id;
    }
    
    if (status === 'closed' && feedback) {
      updateData.closedAt = new Date().toISOString();
      updateData.closingFeedback = feedback;
    }
    
    updateTicket(ticketId, updateData);
  };

  const handleAddComment = (ticketId: string) => {
    if (!commentText.trim()) return;
    
    addTicketComment(ticketId, {
      userId: user!.id,
      content: commentText
    });
    setCommentText('');
  };

  const handleTransfer = () => {
    const { ticketId, toUserId, reason } = transferModal;
    transferTicket(ticketId, {
      fromUserId: user!.id,
      toUserId,
      reason
    });
    setTransferModal({ isOpen: false, ticketId: '', toUserId: '', reason: '' });
  };

  const handleTransferResponse = (ticketId: string, transferId: string, response: 'accepted' | 'rejected') => {
    respondToTransfer(ticketId, transferId, response);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-blue-100 text-blue-800';
      case 'closed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="w-4 h-4" />;
      case 'in-progress': return <Clock className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'closed': return <XCircle className="w-4 h-4" />;
      default: return <TicketIcon className="w-4 h-4" />;
    }
  };

  const formatResponseTime = (minutes: number | undefined): string => {
    if (!minutes) return '-';
    
    if (minutes < 60) {
      return `${minutes}m`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours < 24) {
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    }
    
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  };

  const getResponseTimeColor = (minutes: number | undefined): string => {
    if (!minutes) return 'text-gray-500';
    
    if (minutes <= 30) return 'text-green-600'; // Excellent
    if (minutes <= 120) return 'text-yellow-600'; // Good
    if (minutes <= 480) return 'text-orange-600'; // Fair
    return 'text-red-600'; // Poor
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chamados</h1>
          <p className="mt-1 text-sm text-gray-600">
            Gerencie chamados de suporte técnico com controle de tempo de resposta
          </p>
        </div>
        <button
          onClick={openModal}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          <Plus className="w-5 h-5 mr-1" />
          Novo Chamado
        </button>
      </div>

      {/* Tickets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTickets.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg border border-gray-200 p-8 text-center">
            <TicketIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum chamado encontrado</h3>
            <p className="text-gray-500 mb-4">
              {isSupervisor 
                ? 'Você ainda não criou nenhum chamado.'
                : 'Não há chamados no sistema.'
              }
            </p>
            <button
              onClick={openModal}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-5 h-5 mr-1" />
              Criar Primeiro Chamado
            </button>
          </div>
        ) : (
          filteredTickets.map(ticket => {
            const creator = users.find(u => u.id === ticket.createdBy);
            const attendant = ticket.attendedBy ? users.find(u => u.id === ticket.attendedBy) : null;
            const pendingTransfers = ticket.transfers.filter(t => t.status === 'pending' && t.toUserId === user?.id);
            
            return (
              <div key={ticket.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg ${getStatusColor(ticket.status)} mr-3`}>
                        {getStatusIcon(ticket.status)}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">#{ticket.id.slice(-6)}</h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                          {ticket.status === 'open' ? 'Aberto' :
                           ticket.status === 'in-progress' ? 'Em Andamento' :
                           ticket.status === 'resolved' ? 'Resolvido' : 'Fechado'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Response Time */}
                    {ticket.responseTime && (
                      <div className="text-right">
                        <div className="flex items-center text-sm">
                          <Timer className="w-4 h-4 mr-1 text-gray-400" />
                          <span className={`font-medium ${getResponseTimeColor(ticket.responseTime)}`}>
                            {formatResponseTime(ticket.responseTime)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">tempo resposta</div>
                      </div>
                    )}
                  </div>

                  {/* Problem Description */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Problema</h4>
                    <p className="text-sm text-gray-600 line-clamp-2">{ticket.problem}</p>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <div className="flex items-center text-gray-500 mb-1">
                        <User className="w-3 h-3 mr-1" />
                        <span>Supervisor</span>
                      </div>
                      <p className="text-gray-900 truncate">{ticket.supervisor}</p>
                    </div>
                    
                    <div>
                      <div className="flex items-center text-gray-500 mb-1">
                        <User className="w-3 h-3 mr-1" />
                        <span>Operador</span>
                      </div>
                      <p className="text-gray-900 truncate">{ticket.operator}</p>
                    </div>
                    
                    <div>
                      <div className="flex items-center text-gray-500 mb-1">
                        <Building2 className="w-3 h-3 mr-1" />
                        <span>Empresa</span>
                      </div>
                      <p className="text-gray-900 truncate">{ticket.company}</p>
                    </div>
                    
                    <div>
                      <div className="flex items-center text-gray-500 mb-1">
                        <Monitor className="w-3 h-3 mr-1" />
                        <span>AnyDesk</span>
                      </div>
                      <p className="text-gray-900 truncate">{ticket.anydeskAccess}</p>
                    </div>
                  </div>

                  {/* Assignment Info */}
                  <div className="mb-4 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Criado por:</span>
                      <span className="text-gray-900">{creator?.name || 'Usuário Removido'}</span>
                    </div>
                    {attendant && (
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-gray-500">Atendido por:</span>
                        <span className="text-gray-900">{attendant.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Pending Transfers */}
                  {pendingTransfers.length > 0 && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h5 className="text-sm font-medium text-yellow-800 mb-2">Transferência Pendente</h5>
                      {pendingTransfers.map(transfer => {
                        const fromUser = users.find(u => u.id === transfer.fromUserId);
                        return (
                          <div key={transfer.id} className="text-sm">
                            <p className="text-yellow-700 mb-2">
                              <strong>{fromUser?.name}</strong> quer transferir este chamado para você.
                            </p>
                            <p className="text-yellow-600 mb-3">Motivo: {transfer.reason}</p>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleTransferResponse(ticket.id, transfer.id, 'accepted')}
                                className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                              >
                                Aceitar
                              </button>
                              <button
                                onClick={() => handleTransferResponse(ticket.id, transfer.id, 'rejected')}
                                className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                              >
                                Rejeitar
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Actions */}
                  {!isSupervisor && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {ticket.status === 'open' && (
                        <button
                          onClick={() => handleStatusChange(ticket.id, 'in-progress')}
                          className="px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700"
                        >
                          Iniciar Atendimento
                        </button>
                      )}
                      
                      {ticket.status === 'in-progress' && ticket.attendedBy === user?.id && (
                        <>
                          <button
                            onClick={() => handleStatusChange(ticket.id, 'resolved')}
                            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                          >
                            Marcar como Resolvido
                          </button>
                          <button
                            onClick={() => setTransferModal({ 
                              isOpen: true, 
                              ticketId: ticket.id, 
                              toUserId: '', 
                              reason: '' 
                            })}
                            className="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700"
                          >
                            Transferir
                          </button>
                        </>
                      )}
                      
                      {ticket.status === 'resolved' && (
                        <button
                          onClick={() => {
                            const feedback = prompt('Feedback de fechamento (opcional):');
                            handleStatusChange(ticket.id, 'closed', feedback || undefined);
                          }}
                          className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                        >
                          Fechar Chamado
                        </button>
                      )}
                    </div>
                  )}

                  {/* Comments Section */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-sm font-medium text-gray-700">
                        Comentários ({ticket.comments.length})
                      </h5>
                      <button
                        onClick={() => setSelectedTicket(selectedTicket === ticket.id ? null : ticket.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        {selectedTicket === ticket.id ? 'Ocultar' : 'Ver todos'}
                      </button>
                    </div>

                    {/* Recent Comments Preview */}
                    {ticket.comments.slice(-2).map(comment => {
                      const commentUser = users.find(u => u.id === comment.userId);
                      return (
                        <div key={comment.id} className="mb-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-700">{commentUser?.name}</span>
                            <span className="text-gray-500 text-xs">
                              {new Date(comment.createdAt).toLocaleString('pt-BR')}
                            </span>
                          </div>
                          <p className="text-gray-600 mt-1">{comment.content}</p>
                        </div>
                      );
                    })}

                    {/* Expanded Comments */}
                    {selectedTicket === ticket.id && ticket.comments.length > 2 && (
                      <div className="mb-3 border-t border-gray-100 pt-3">
                        {ticket.comments.slice(0, -2).map(comment => {
                          const commentUser = users.find(u => u.id === comment.userId);
                          return (
                            <div key={comment.id} className="mb-2 text-sm">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-700">{commentUser?.name}</span>
                                <span className="text-gray-500 text-xs">
                                  {new Date(comment.createdAt).toLocaleString('pt-BR')}
                                </span>
                              </div>
                              <p className="text-gray-600 mt-1">{comment.content}</p>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Add Comment */}
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Adicionar comentário..."
                        className="flex-1 text-sm border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddComment(ticket.id);
                          }
                        }}
                      />
                      <button
                        onClick={() => handleAddComment(ticket.id)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-500">
                    <div>Criado: {new Date(ticket.createdAt).toLocaleString('pt-BR')}</div>
                    {ticket.attendedAt && (
                      <div>Atendido: {new Date(ticket.attendedAt).toLocaleString('pt-BR')}</div>
                    )}
                    {ticket.closedAt && (
                      <div>Fechado: {new Date(ticket.closedAt).toLocaleString('pt-BR')}</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Ticket Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Novo Chamado</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="problem" className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição do Problema *
                  </label>
                  <textarea
                    id="problem"
                    name="problem"
                    value={formData.problem}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Descreva detalhadamente o problema..."
                  ></textarea>
                </div>

                <div>
                  <label htmlFor="supervisor" className="block text-sm font-medium text-gray-700 mb-1">
                    Supervisor *
                  </label>
                  <input
                    type="text"
                    id="supervisor"
                    name="supervisor"
                    value={formData.supervisor}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Nome do supervisor"
                  />
                </div>

                <div>
                  <label htmlFor="operator" className="block text-sm font-medium text-gray-700 mb-1">
                    Operador *
                  </label>
                  <input
                    type="text"
                    id="operator"
                    name="operator"
                    value={formData.operator}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Nome do operador"
                  />
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                    Empresa *
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Nome da empresa"
                  />
                </div>

                <div>
                  <label htmlFor="anydeskAccess" className="block text-sm font-medium text-gray-700 mb-1">
                    Acesso AnyDesk *
                  </label>
                  <input
                    type="text"
                    id="anydeskAccess"
                    name="anydeskAccess"
                    value={formData.anydeskAccess}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="ID do AnyDesk"
                  />
                </div>
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
                  Criar Chamado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {transferModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Transferir Chamado</h2>
              <button 
                onClick={() => setTransferModal({ isOpen: false, ticketId: '', toUserId: '', reason: '' })}
                className="text-gray-400 hover:text-gray-500"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transferir para *
                </label>
                <select
                  value={transferModal.toUserId}
                  onChange={(e) => setTransferModal(prev => ({ ...prev, toUserId: e.target.value }))}
                  required
                  className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Selecione um usuário</option>
                  {users.filter(u => u.role !== 'supervisor' && u.id !== user?.id).map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motivo da Transferência *
                </label>
                <textarea
                  value={transferModal.reason}
                  onChange={(e) => setTransferModal(prev => ({ ...prev, reason: e.target.value }))}
                  required
                  rows={3}
                  className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Explique o motivo da transferência..."
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setTransferModal({ isOpen: false, ticketId: '', toUserId: '', reason: '' })}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleTransfer}
                  disabled={!transferModal.toUserId || !transferModal.reason.trim()}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Transferir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tickets;