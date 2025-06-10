import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Ticket, MessageSquare, Plus, Edit, Trash2, X, Filter, Send, FileText, Clock, CheckCircle, User, AlertCircle, Lock, Upload, Download, Share2, Check, XIcon } from 'lucide-react';

interface TicketFormData {
  problem: string;
  supervisor: string;
  operator: string;
  company: string;
  anydeskAccess: string;
  attachments: File[];
}

interface FeedbackFormData {
  feedback: string;
}

interface TransferFormData {
  toUserId: string;
  reason: string;
}

const Tickets = () => {
  const { tickets, addTicket, updateTicket, deleteTicket, addTicketComment, transferTicket, respondToTransfer, users } = useData();
  const { user, isSupervisor } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [feedbackForm, setFeedbackForm] = useState<FeedbackFormData>({ feedback: '' });
  const [transferForm, setTransferForm] = useState<TransferFormData>({ toUserId: '', reason: '' });
  const [formData, setFormData] = useState<TicketFormData>({
    problem: '',
    supervisor: '',
    operator: '',
    company: '',
    anydeskAccess: '',
    attachments: []
  });
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'create' | 'my-tickets' | 'all-tickets' | 'transfers'>(
    isSupervisor ? 'create' : 'all-tickets'
  );

  // Filter tickets based on user role and active tab
  const filteredTickets = tickets.filter(ticket => {
    if (filterStatus && ticket.status !== filterStatus) return false;
    
    if (activeTab === 'my-tickets') {
      // Supervisors only see tickets they created
      if (isSupervisor) {
        return ticket.createdBy === user?.id;
      }
      // Other users see tickets they created or are attending
      return ticket.createdBy === user?.id || ticket.attendedBy === user?.id;
    }
    
    if (activeTab === 'transfers') {
      // Show tickets with pending transfers to current user
      return ticket.transfers.some(transfer => 
        transfer.toUserId === user?.id && transfer.status === 'pending'
      );
    }
    
    return true;
  });

  // Get pending transfers for current user
  const pendingTransfers = tickets.filter(ticket =>
    ticket.transfers.some(transfer => 
      transfer.toUserId === user?.id && transfer.status === 'pending'
    )
  );

  const myTicketsCount = tickets.filter(ticket => 
    isSupervisor ? ticket.createdBy === user?.id : 
    (ticket.createdBy === user?.id || ticket.attendedBy === user?.id)
  ).length;
  
  const openTicketsCount = tickets.filter(ticket => ticket.status === 'open').length;

  const resetForm = () => {
    setFormData({
      problem: '',
      supervisor: '',
      operator: '',
      company: '',
      anydeskAccess: '',
      attachments: []
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({
        ...prev,
        attachments: Array.from(e.target.files || [])
      }));
    }
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert files to base64 for storage
    const attachments = await Promise.all(
      formData.attachments.map(async (file) => {
        const base64 = await fileToBase64(file);
        return {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          type: file.type,
          data: base64,
          uploadedAt: new Date().toISOString()
        };
      })
    );
    
    addTicket({
      ...formData,
      createdBy: user!.id,
      attachments
    });
    
    resetForm();
    setActiveTab('my-tickets');
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const downloadAttachment = (attachment: any) => {
    const link = document.createElement('a');
    link.href = attachment.data;
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  const handleAttendTicket = (ticketId: string) => {
    updateTicket(ticketId, {
      status: 'in-progress',
      attendedBy: user!.id,
      attendedAt: new Date().toISOString()
    });
  };

  const handleCloseTicket = (ticketId: string) => {
    setSelectedTicket(ticketId);
    setIsFeedbackModalOpen(true);
  };

  const handleTransferTicket = (ticketId: string) => {
    setSelectedTicket(ticketId);
    setTransferForm({ toUserId: '', reason: '' });
    setIsTransferModalOpen(true);
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedTicket && feedbackForm.feedback.trim()) {
      updateTicket(selectedTicket, {
        status: 'closed',
        closedAt: new Date().toISOString(),
        closingFeedback: feedbackForm.feedback
      });
      
      setFeedbackForm({ feedback: '' });
      setIsFeedbackModalOpen(false);
      setSelectedTicket(null);
    }
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedTicket && transferForm.toUserId && transferForm.reason.trim()) {
      transferTicket(selectedTicket, {
        fromUserId: user!.id,
        toUserId: transferForm.toUserId,
        reason: transferForm.reason,
        status: 'pending'
      });
      
      setTransferForm({ toUserId: '', reason: '' });
      setIsTransferModalOpen(false);
      setSelectedTicket(null);
    }
  };

  const handleTransferResponse = (ticketId: string, transferId: string, response: 'accepted' | 'rejected') => {
    respondToTransfer(ticketId, transferId, response);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este chamado?')) {
      deleteTicket(id);
    }
  };

  const handleStatusChange = (ticketId: string, newStatus: string) => {
    const ticket = tickets.find(t => t.id === ticketId);
    
    // Check if user can modify this ticket
    if (ticket && ticket.attendedBy && ticket.attendedBy !== user?.id && user?.role !== 'admin') {
      return; // Can't modify tickets attended by others
    }
    
    if (newStatus === 'closed') {
      handleCloseTicket(ticketId);
    } else {
      updateTicket(ticketId, { status: newStatus });
    }
  };

  const canModifyTicket = (ticket: any) => {
    // Admin can modify any ticket
    if (user?.role === 'admin') return true;
    
    // Supervisor can only modify their own tickets
    if (isSupervisor) return ticket.createdBy === user?.id;
    
    // Other users can only modify tickets they are attending or unattended tickets
    return !ticket.attendedBy || ticket.attendedBy === user?.id;
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
      case 'closed':
        return 'Resolvido';
      default:
        return status;
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getTimeDifference = (startDate: string, endDate?: string) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    }
    return `${diffMinutes}m`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get available users for transfer (exclude supervisors and current user)
  const availableUsers = users.filter(u => 
    u.role !== 'supervisor' && u.id !== user?.id
  );

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
          
          <button
            onClick={() => setActiveTab('my-tickets')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'my-tickets'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-1" />
            {isSupervisor ? 'Meus Chamados' : 'Meus Chamados'} ({myTicketsCount})
          </button>
          
          {!isSupervisor && (
            <button
              onClick={() => setActiveTab('all-tickets')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'all-tickets'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
            </button>
          )}

          {!isSupervisor && (
            <button
              onClick={() => setActiveTab('transfers')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'transfers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Share2 className="w-4 h-4 inline mr-1" />
              Transferências ({pendingTransfers.length})
              {pendingTransfers.length > 0 && (
                <span className="ml-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                  {pendingTransfers.length}
                </span>
              )}
            </button>
          )}
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
                    👩🏽‍💼 SUPERVISOR *
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
                    👩🏽‍💻 POSIÇÃO DO OPERADOR *
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
                    🏢 EMPRESA/SETOR *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Nome da empresa ou setor"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    🔑 ID DE ACESSO *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.anydeskAccess}
                    onChange={(e) => setFormData({ ...formData, anydeskAccess: e.target.value })}
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="ID de acesso "
                  />
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  📎 ANEXOS (Opcional)
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                        <span>Clique para enviar arquivos</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          multiple
                          className="sr-only"
                          onChange={handleFileChange}
                          accept="image/*,.pdf,.doc,.docx,.txt"
                        />
                      </label>
                      <p className="pl-1">ou arraste e solte</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, PDF, DOC até 10MB cada
                    </p>
                  </div>
                </div>

                {/* Selected Files */}
                {formData.attachments.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Arquivos selecionados:</h4>
                    <div className="space-y-2">
                      {formData.attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                          <div className="flex items-center">
                            <FileText className="w-4 h-4 text-gray-500 mr-2" />
                            <span className="text-sm text-gray-700">{file.name}</span>
                            <span className="text-xs text-gray-500 ml-2">({formatFileSize(file.size)})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
      {(activeTab === 'my-tickets' || activeTab === 'all-tickets' || activeTab === 'transfers') && (
        <>
          {/* Filters */}
          {activeTab !== 'transfers' && (
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
                  <option value="closed">Resolvido</option>
                </select>
                <button
                  onClick={() => setFilterStatus('')}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Limpar filtros
                </button>
              </div>
            </div>
          )}

          {/* Tickets */}
          <div className="space-y-4">
            {filteredTickets.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <Ticket className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {activeTab === 'my-tickets' ? 'Nenhum chamado encontrado' : 
                   activeTab === 'transfers' ? 'Nenhuma transferência pendente' :
                   'Nenhum chamado encontrado'}
                </h3>
                <p className="text-gray-500">
                  {activeTab === 'my-tickets' 
                    ? 'Você ainda não tem chamados.'
                    : activeTab === 'transfers'
                    ? 'Não há transferências pendentes para você.'
                    : 'Não há chamados que correspondam aos filtros selecionados.'
                  }
                </p>
              </div>
            ) : (
              filteredTickets.map(ticket => {
                const creator = users.find(u => u.id === ticket.createdBy);
                const attendedBy = ticket.attendedBy ? users.find(u => u.id === ticket.attendedBy) : null;
                const canModify = canModifyTicket(ticket);
                const pendingTransfer = ticket.transfers.find(t => 
                  t.toUserId === user?.id && t.status === 'pending'
                );
                
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
                          em {formatDateTime(ticket.createdAt)}
                        </span>
                        {ticket.attendedBy && ticket.attendedBy !== user?.id && (
                          <span className="flex items-center text-sm text-orange-600">
                            <Lock className="w-4 h-4 mr-1" />
                            Atendido por {attendedBy?.name}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {/* Transfer Response Buttons */}
                        {pendingTransfer && activeTab === 'transfers' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleTransferResponse(ticket.id, pendingTransfer.id, 'accepted')}
                              className="flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Aceitar
                            </button>
                            <button
                              onClick={() => handleTransferResponse(ticket.id, pendingTransfer.id, 'rejected')}
                              className="flex items-center px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                            >
                              <XIcon className="w-4 h-4 mr-1" />
                              Rejeitar
                            </button>
                          </div>
                        )}

                        {/* Attend Ticket Button */}
                        {!isSupervisor && ticket.status === 'open' && !ticket.attendedBy && activeTab !== 'transfers' && (
                          <button
                            onClick={() => handleAttendTicket(ticket.id)}
                            className="flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                          >
                            <User className="w-4 h-4 mr-1" />
                            Atender Chamado
                          </button>
                        )}

                        {/* Transfer Button */}
                        {!isSupervisor && ticket.attendedBy === user?.id && ticket.status !== 'closed' && activeTab !== 'transfers' && (
                          <button
                            onClick={() => handleTransferTicket(ticket.id)}
                            className="flex items-center px-3 py-1 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700"
                          >
                            <Share2 className="w-4 h-4 mr-1" />
                            Transferir
                          </button>
                        )}

                        {/* Status Change for authorized users */}
                        {!isSupervisor && ticket.status !== 'open' && canModify && activeTab !== 'transfers' && (
                          <select
                            value={ticket.status}
                            onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="in-progress">Em Andamento</option>
                            <option value="closed">Resolvido</option>
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

                    {/* Transfer Information */}
                    {pendingTransfer && activeTab === 'transfers' && (
                      <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <h4 className="text-sm font-medium text-purple-900 mb-1 flex items-center">
                          <Share2 className="w-4 h-4 mr-1" />
                          Solicitação de Transferência
                        </h4>
                        <p className="text-sm text-purple-800">
                          <strong>De:</strong> {users.find(u => u.id === pendingTransfer.fromUserId)?.name}
                        </p>
                        <p className="text-sm text-purple-800">
                          <strong>Motivo:</strong> {pendingTransfer.reason}
                        </p>
                        <p className="text-xs text-purple-600 mt-1">
                          Solicitado em {formatDateTime(pendingTransfer.transferredAt)}
                        </p>
                      </div>
                    )}

                    {/* Timing Information */}
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 text-gray-500 mr-2" />
                          <div>
                            <p className="font-medium text-gray-700">Tempo decorrido:</p>
                            <p className="text-gray-600">
                              {getTimeDifference(ticket.createdAt, ticket.closedAt)}
                            </p>
                          </div>
                        </div>
                        
                        {ticket.attendedBy && (
                          <div className="flex items-center">
                            <User className="w-4 h-4 text-blue-500 mr-2" />
                            <div>
                              <p className="font-medium text-gray-700">Atendido por:</p>
                              <p className="text-gray-600">{attendedBy?.name || 'Usuário Removido'}</p>
                              {ticket.attendedAt && (
                                <p className="text-xs text-gray-500">
                                  {formatDateTime(ticket.attendedAt)}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {ticket.closedAt && (
                          <div className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            <div>
                              <p className="font-medium text-gray-700">Finalizado em:</p>
                              <p className="text-gray-600">{formatDateTime(ticket.closedAt)}</p>
                            </div>
                          </div>
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
                          <h4 className="text-sm font-medium text-blue-900 mb-1">👩🏽‍💼 SUPERVISOR:</h4>
                          <p className="text-sm text-blue-800">{ticket.supervisor}</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-md">
                          <h4 className="text-sm font-medium text-green-900 mb-1">👩🏽‍💻 POSIÇÃO DO OPERADOR:</h4>
                          <p className="text-sm text-green-800">{ticket.operator}</p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-md">
                          <h4 className="text-sm font-medium text-purple-900 mb-1">🏢 EMPRESA/SETOR:</h4>
                          <p className="text-sm text-purple-800">{ticket.company}</p>
                        </div>
                        <div className="bg-orange-50 p-3 rounded-md">
                          <h4 className="text-sm font-medium text-orange-900 mb-1">🔑 ID DE ACESSO:</h4>
                          <p className="text-sm text-orange-800 font-mono">{ticket.anydeskAccess}</p>
                        </div>
                      </div>

                      {/* Attachments */}
                      {ticket.attachments && ticket.attachments.length > 0 && (
                        <div className="bg-gray-50 border border-gray-200 p-3 rounded-md">
                          <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                            <FileText className="w-4 h-4 mr-1" />
                            Anexos ({ticket.attachments.length})
                          </h4>
                          <div className="space-y-2">
                            {ticket.attachments.map(attachment => (
                              <div key={attachment.id} className="flex items-center justify-between bg-white p-2 rounded border">
                                <div className="flex items-center">
                                  <FileText className="w-4 h-4 text-gray-500 mr-2" />
                                  <span className="text-sm text-gray-700">{attachment.name}</span>
                                  <span className="text-xs text-gray-500 ml-2">({formatFileSize(attachment.size)})</span>
                                </div>
                                <button
                                  onClick={() => downloadAttachment(attachment)}
                                  className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                                >
                                  <Download className="w-4 h-4 mr-1" />
                                  Baixar
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Closing Feedback */}
                      {ticket.closingFeedback && (
                        <div className="bg-green-50 border border-green-200 p-3 rounded-md">
                          <h4 className="text-sm font-medium text-green-900 mb-1 flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Feedback de Finalização:
                          </h4>
                          <p className="text-sm text-green-800">{ticket.closingFeedback}</p>
                        </div>
                      )}
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
                                    {formatDateTime(comment.createdAt)}
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

      {/* Transfer Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Share2 className="w-6 h-6 text-purple-500 mr-2" />
                Transferir Chamado
              </h2>
              <button
                onClick={() => {
                  setIsTransferModalOpen(false);
                  setSelectedTicket(null);
                  setTransferForm({ toUserId: '', reason: '' });
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transferir para *
                  </label>
                  <select
                    required
                    value={transferForm.toUserId}
                    onChange={(e) => setTransferForm(prev => ({ ...prev, toUserId: e.target.value }))}
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Selecione um usuário</option>
                    {availableUsers.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.role === 'admin' ? 'Administrador' : user.role === 'intern' ? 'Estagiário' : 'Usuário'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Motivo da transferência *
                  </label>
                  <textarea
                    required
                    value={transferForm.reason}
                    onChange={(e) => setTransferForm(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Explique o motivo da transferência..."
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsTransferModalOpen(false);
                    setSelectedTicket(null);
                    setTransferForm({ toUserId: '', reason: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Transferir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {isFeedbackModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <AlertCircle className="w-6 h-6 text-orange-500 mr-2" />
                Finalizar Chamado
              </h2>
              <button
                onClick={() => {
                  setIsFeedbackModalOpen(false);
                  setSelectedTicket(null);
                  setFeedbackForm({ feedback: '' });
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
              <p className="text-sm text-orange-800">
                <strong>Atenção:</strong> Para finalizar este chamado, é obrigatório fornecer um feedback sobre a resolução do problema.
              </p>
            </div>

            <form onSubmit={handleFeedbackSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback de Finalização *
                </label>
                <textarea
                  required
                  value={feedbackForm.feedback}
                  onChange={(e) => setFeedbackForm({ feedback: e.target.value })}
                  placeholder="Descreva como o problema foi resolvido, quais ações foram tomadas, etc..."
                  className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  rows={4}
                />
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsFeedbackModalOpen(false);
                    setSelectedTicket(null);
                    setFeedbackForm({ feedback: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Finalizar Chamado
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