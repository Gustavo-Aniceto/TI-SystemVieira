import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Clock, User, Building, MapPin, Paperclip, KeyRound, X, Ticket as TicketIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Ticket, TicketStatus, TICKET_STATUS_LABELS } from '../types';

interface TicketFormData {
  problema: string;
  supervisor_id: string;
  posicao_operador: string;
  empresa_id: string;
  setor_id: string;
  id_acesso: string;
  anexo: string;
  tipo_id: string;
  subtipo_id: string;
}

const STATUS_COLORS: Record<TicketStatus, string> = {
  aberto: 'bg-red-100 text-red-800',
  em_andamento: 'bg-yellow-100 text-yellow-800',
  resolvido: 'bg-green-100 text-green-800',
};

const inputClass =
  'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100';

const isSafeUrl = (value: string) => /^https?:\/\//i.test(value);

const Tickets: React.FC = () => {
  const { user, isSupervisor, isAdmin } = useAuth();
  const {
    tickets, users, companies, sectors, ticketTypes, ticketSubtypes,
    addTicket, updateTicket, deleteTicket, loading,
  } = useData();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showModal, setShowModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') ?? '');

  // Mantém o filtro de status sincronizado com a URL (links do dashboard)
  useEffect(() => {
    setStatusFilter(searchParams.get('status') ?? '');
  }, [searchParams]);

  const changeStatusFilter = (value: string) => {
    setStatusFilter(value);
    setSearchParams(value ? { status: value } : {});
  };

  const emptyForm = (): TicketFormData => ({
    problema: '',
    supervisor_id: isSupervisor && user ? String(user.id) : '',
    posicao_operador: '',
    empresa_id: isSupervisor && user?.empresa_id ? String(user.empresa_id) : '',
    setor_id: isSupervisor && user?.setor_id ? String(user.setor_id) : '',
    id_acesso: '',
    anexo: '',
    tipo_id: '',
    subtipo_id: '',
  });
  const [formData, setFormData] = useState<TicketFormData>(emptyForm);

  const nameOf = <T extends { id: number; nome: string }>(list: T[], id: number | null) =>
    list.find(item => item.id === id)?.nome ?? '';

  // Supervisores enxergam apenas os chamados da própria empresa
  const visibleTickets = useMemo(
    () => (isSupervisor ? tickets.filter(t => t.empresa_id === user?.empresa_id) : tickets),
    [tickets, isSupervisor, user?.empresa_id]
  );

  const filteredTickets = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return visibleTickets.filter(ticket => {
      const matchesStatus = !statusFilter || ticket.status === statusFilter;
      if (!matchesStatus) return false;
      if (!term) return true;
      return [
        ticket.problema,
        `#${ticket.id}`,
        nameOf(users, ticket.supervisor_id),
        nameOf(companies, ticket.empresa_id),
        nameOf(sectors, ticket.setor_id),
        ticket.posicao_operador ?? '',
      ].some(value => value.toLowerCase().includes(term));
    });
  }, [visibleTickets, searchTerm, statusFilter, users, companies, sectors]);

  const supervisorOptions = users.filter(
    u => u.funcao === 'supervisor' && (!formData.empresa_id || u.empresa_id === Number(formData.empresa_id))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const openNew = () => {
    if (isSupervisor && !user?.empresa_id) {
      toast.error('Seu usuário não está vinculado a uma empresa. Contate o administrador.');
      return;
    }
    setEditingTicket(null);
    setFormData(emptyForm());
    setShowModal(true);
  };

  const handleEdit = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setFormData({
      problema: ticket.problema,
      supervisor_id: String(ticket.supervisor_id),
      posicao_operador: ticket.posicao_operador ?? '',
      empresa_id: String(ticket.empresa_id),
      setor_id: String(ticket.setor_id),
      id_acesso: ticket.id_acesso ?? '',
      anexo: ticket.anexo ?? '',
      tipo_id: ticket.tipo_id ? String(ticket.tipo_id) : '',
      subtipo_id: ticket.subtipo_id ? String(ticket.subtipo_id) : '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTicket(null);
    setFormData(emptyForm());
  };

  const setField = (field: keyof TicketFormData, value: string) =>
    setFormData(prev => {
      const next = { ...prev, [field]: value };
      if (field === 'empresa_id') {
        next.setor_id = '';
        next.supervisor_id = '';
      }
      if (field === 'tipo_id') next.subtipo_id = '';
      return next;
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.anexo && !isSafeUrl(formData.anexo.trim())) {
      toast.error('O anexo deve ser um link começando com http:// ou https://');
      return;
    }

    const payload = {
      problema: formData.problema.trim(),
      supervisor_id: Number(formData.supervisor_id),
      posicao_operador: formData.posicao_operador.trim() || null,
      empresa_id: Number(formData.empresa_id),
      setor_id: Number(formData.setor_id),
      id_acesso: formData.id_acesso.trim() || null,
      anexo: formData.anexo.trim() || null,
      tipo_id: formData.tipo_id ? Number(formData.tipo_id) : null,
      subtipo_id: formData.subtipo_id ? Number(formData.subtipo_id) : null,
    };

    setSaving(true);
    const ok = editingTicket
      ? await updateTicket(editingTicket.id, payload)
      : await addTicket({ ...payload, status: 'aberto' });
    setSaving(false);

    if (ok) closeModal();
  };

  const handleStatusChange = (ticket: Ticket, status: TicketStatus) => {
    if (status !== ticket.status) updateTicket(ticket.id, { status });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este chamado?')) {
      deleteTicket(id);
    }
  };

  const canEdit = (ticket: Ticket) => !isSupervisor || (ticket.supervisor_id === user?.id && ticket.status === 'aberto');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chamados</h1>
          <p className="text-sm text-gray-500 mt-1">
            {visibleTickets.filter(t => t.status !== 'resolvido').length} chamado(s) pendente(s)
          </p>
        </div>
        <button
          onClick={openNew}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo Chamado
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por problema, número, supervisor, empresa ou setor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => changeStatusFilter(e.target.value)}
              className={inputClass}
            >
              <option value="">Todos os Status</option>
              {(Object.keys(TICKET_STATUS_LABELS) as TicketStatus[]).map(status => (
                <option key={status} value={status}>{TICKET_STATUS_LABELS[status]}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Chamados */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Chamado', 'Supervisor', 'Empresa/Setor', 'Tipo', 'Status', 'Data'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50 align-top">
                  <td className="px-6 py-4 max-w-sm">
                    <div className="text-xs font-mono text-gray-400">#{String(ticket.id).padStart(4, '0')}</div>
                    <div className="text-sm font-medium text-gray-900 whitespace-pre-wrap break-words">{ticket.problema}</div>
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                      {ticket.posicao_operador && (
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{ticket.posicao_operador}</span>
                      )}
                      {ticket.id_acesso && (
                        <span className="flex items-center gap-1"><KeyRound className="w-3 h-3" />{ticket.id_acesso}</span>
                      )}
                      {ticket.anexo && isSafeUrl(ticket.anexo) && (
                        <a href={ticket.anexo} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-indigo-600 hover:underline">
                          <Paperclip className="w-3 h-3" />Anexo
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {nameOf(users, ticket.supervisor_id) || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center gap-1">
                      <Building className="w-3 h-3" />
                      {nameOf(companies, ticket.empresa_id) || '-'}
                    </div>
                    <div className="text-sm text-gray-500">{nameOf(sectors, ticket.setor_id)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{nameOf(ticketTypes, ticket.tipo_id) || '-'}</div>
                    <div className="text-sm text-gray-500">{nameOf(ticketSubtypes, ticket.subtipo_id)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isSupervisor ? (
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${STATUS_COLORS[ticket.status]}`}>
                        {TICKET_STATUS_LABELS[ticket.status]}
                      </span>
                    ) : (
                      <select
                        value={ticket.status}
                        onChange={(e) => handleStatusChange(ticket, e.target.value as TicketStatus)}
                        className={`text-xs font-semibold rounded-full px-2 py-1 border-0 cursor-pointer focus:ring-2 focus:ring-indigo-500 ${STATUS_COLORS[ticket.status]}`}
                        aria-label="Alterar status"
                      >
                        {(Object.keys(TICKET_STATUS_LABELS) as TicketStatus[]).map(status => (
                          <option key={status} value={status}>{TICKET_STATUS_LABELS[status]}</option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(ticket.criado_em).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {canEdit(ticket) && (
                        <button onClick={() => handleEdit(ticket)} className="text-indigo-600 hover:text-indigo-900" title="Editar">
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      {isAdmin && (
                        <button onClick={() => handleDelete(ticket.id)} className="text-red-600 hover:text-red-900" title="Excluir">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTickets.length === 0 && (
          <div className="text-center py-12">
            <TicketIcon className="w-12 h-12 mx-auto text-gray-300 mb-2" />
            <div className="text-gray-500">Nenhum chamado encontrado</div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{editingTicket ? `Editar Chamado #${editingTicket.id}` : 'Novo Chamado'}</h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-500"><X className="w-6 h-6" /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Problema *</label>
                  <textarea
                    value={formData.problema}
                    onChange={(e) => setField('problema', e.target.value)}
                    className={inputClass}
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Empresa *</label>
                    <select
                      value={formData.empresa_id}
                      onChange={(e) => setField('empresa_id', e.target.value)}
                      className={inputClass}
                      disabled={isSupervisor}
                      required
                    >
                      <option value="">Selecione uma empresa</option>
                      {companies.map(empresa => (
                        <option key={empresa.id} value={empresa.id}>{empresa.nome}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Setor *</label>
                    <select
                      value={formData.setor_id}
                      onChange={(e) => setField('setor_id', e.target.value)}
                      className={inputClass}
                      disabled={!formData.empresa_id}
                      required
                    >
                      <option value="">Selecione um setor</option>
                      {sectors
                        .filter(setor => setor.empresa_id === Number(formData.empresa_id))
                        .map(setor => (
                          <option key={setor.id} value={setor.id}>{setor.nome}</option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Supervisor *</label>
                    <select
                      value={formData.supervisor_id}
                      onChange={(e) => setField('supervisor_id', e.target.value)}
                      className={inputClass}
                      disabled={isSupervisor}
                      required
                    >
                      <option value="">Selecione um supervisor</option>
                      {(isSupervisor && user ? [user] : supervisorOptions).map(supervisor => (
                        <option key={supervisor.id} value={supervisor.id}>{supervisor.nome}</option>
                      ))}
                    </select>
                    {!isSupervisor && formData.empresa_id && supervisorOptions.length === 0 && (
                      <p className="text-xs text-amber-600 mt-1">Nenhum supervisor cadastrado para esta empresa.</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Posição do Operador</label>
                    <input
                      type="text"
                      value={formData.posicao_operador}
                      onChange={(e) => setField('posicao_operador', e.target.value)}
                      className={inputClass}
                      placeholder="Ex.: PA 12"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo do Chamado</label>
                    <select value={formData.tipo_id} onChange={(e) => setField('tipo_id', e.target.value)} className={inputClass}>
                      <option value="">Selecione um tipo</option>
                      {ticketTypes.map(tipo => (
                        <option key={tipo.id} value={tipo.id}>{tipo.nome}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subtipo do Chamado</label>
                    <select
                      value={formData.subtipo_id}
                      onChange={(e) => setField('subtipo_id', e.target.value)}
                      className={inputClass}
                      disabled={!formData.tipo_id}
                    >
                      <option value="">Selecione um subtipo</option>
                      {ticketSubtypes
                        .filter(subtipo => subtipo.tipo_id === Number(formData.tipo_id))
                        .map(subtipo => (
                          <option key={subtipo.id} value={subtipo.id}>{subtipo.nome}</option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ID de Acesso (AnyDesk, etc.)</label>
                    <input
                      type="text"
                      value={formData.id_acesso}
                      onChange={(e) => setField('id_acesso', e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Anexo</label>
                    <input
                      type="url"
                      value={formData.anexo}
                      onChange={(e) => setField('anexo', e.target.value)}
                      className={inputClass}
                      placeholder="https://link-do-anexo"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {saving ? 'Salvando...' : editingTicket ? 'Atualizar Chamado' : 'Criar Chamado'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tickets;
