import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Eye, Edit, Trash2, Clock, User, Building, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

interface Ticket {
  id: number;
  problema: string;
  supervisor_id: number;
  posicao_operador: string;
  empresa_id: number;
  setor_id: number;
  id_acesso: string;
  anexo: string;
  status: 'aberto' | 'em_andamento' | 'resolvido';
  criado_em: string;
  tipo_id?: number;
  subtipo_id?: number;
  supervisor?: { nome: string };
  empresa?: { nome: string };
  setor?: { nome: string };
  tipo?: { nome: string };
  subtipo?: { nome: string };
}

const Tickets: React.FC = () => {
  const { user } = useAuth();
  const { companies, sectors, users, ticketTypes, ticketSubtypes } = useData();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [formData, setFormData] = useState({
    problema: '',
    supervisor_id: '',
    posicao_operador: '',
    empresa_id: '',
    setor_id: '',
    id_acesso: '',
    anexo: '',
    tipo_id: '',
    subtipo_id: ''
  });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('chamados')
        .select(`
          *,
          supervisor:usuarios!supervisor_id(nome),
          empresa:empresas(nome),
          setor:setores(nome),
          tipo:tipos_chamado(nome),
          subtipo:subtipos_chamado(nome)
        `)
        .order('criado_em', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Erro ao buscar chamados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const ticketData = {
        ...formData,
        supervisor_id: parseInt(formData.supervisor_id),
        empresa_id: user?.funcao === 'supervisor' ? user.empresa_id : parseInt(formData.empresa_id),
        setor_id: parseInt(formData.setor_id),
        tipo_id: formData.tipo_id ? parseInt(formData.tipo_id) : null,
        subtipo_id: formData.subtipo_id ? parseInt(formData.subtipo_id) : null
      };

      if (editingTicket) {
        const { error } = await supabase
          .from('chamados')
          .update(ticketData)
          .eq('id', editingTicket.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('chamados')
          .insert([ticketData]);

        if (error) throw error;
      }

      setShowModal(false);
      setEditingTicket(null);
      setFormData({
        problema: '',
        supervisor_id: '',
        posicao_operador: '',
        empresa_id: '',
        setor_id: '',
        id_acesso: '',
        anexo: '',
        tipo_id: '',
        subtipo_id: ''
      });
      fetchTickets();
    } catch (error) {
      console.error('Erro ao salvar chamado:', error);
      alert('Erro ao salvar chamado');
    }
  };

  const handleEdit = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setFormData({
      problema: ticket.problema,
      supervisor_id: ticket.supervisor_id.toString(),
      posicao_operador: ticket.posicao_operador || '',
      empresa_id: ticket.empresa_id.toString(),
      setor_id: ticket.setor_id.toString(),
      id_acesso: ticket.id_acesso || '',
      anexo: ticket.anexo || '',
      tipo_id: ticket.tipo_id?.toString() || '',
      subtipo_id: ticket.subtipo_id?.toString() || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este chamado?')) {
      try {
        const { error } = await supabase
          .from('chamados')
          .delete()
          .eq('id', id);

        if (error) throw error;
        fetchTickets();
      } catch (error) {
        console.error('Erro ao excluir chamado:', error);
        alert('Erro ao excluir chamado');
      }
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.problema.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.supervisor?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.empresa?.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aberto': return 'bg-red-100 text-red-800';
      case 'em_andamento': return 'bg-yellow-100 text-yellow-800';
      case 'resolvido': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'aberto': return 'Aberto';
      case 'em_andamento': return 'Em Andamento';
      case 'resolvido': return 'Resolvido';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Chamados</h1>
        <button
          onClick={() => setShowModal(true)}
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
                placeholder="Buscar chamados..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Todos os Status</option>
              <option value="aberto">Aberto</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="resolvido">Resolvido</option>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Problema
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supervisor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empresa/Setor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {ticket.problema}
                    </div>
                    {ticket.posicao_operador && (
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {ticket.posicao_operador}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {ticket.supervisor?.nome}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center gap-1">
                      <Building className="w-3 h-3" />
                      {ticket.empresa?.nome}
                    </div>
                    <div className="text-sm text-gray-500">
                      {ticket.setor?.nome}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {ticket.tipo?.nome}
                    </div>
                    {ticket.subtipo?.nome && (
                      <div className="text-sm text-gray-500">
                        {ticket.subtipo.nome}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                      {getStatusText(ticket.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(ticket.criado_em).toLocaleDateString('pt-BR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(ticket)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(ticket.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTickets.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">Nenhum chamado encontrado</div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingTicket ? 'Editar Chamado' : 'Novo Chamado'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Problema *
                  </label>
                  <textarea
                    value={formData.problema}
                    onChange={(e) => setFormData({ ...formData, problema: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Supervisor *
                    </label>
                    <select
                      value={formData.supervisor_id}
                      onChange={(e) => setFormData({ ...formData, supervisor_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    >
                      <option value="">Selecione um supervisor</option>
                      {usuarios.filter(u => u.funcao === 'supervisor').map((supervisor) => (
                        <option key={supervisor.id} value={supervisor.id}>
                          {supervisor.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Posição do Operador
                    </label>
                    <input
                      type="text"
                      value={formData.posicao_operador}
                      onChange={(e) => setFormData({ ...formData, posicao_operador: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {user?.funcao !== 'supervisor' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Empresa *
                      </label>
                      <select
                        value={formData.empresa_id}
                        onChange={(e) => setFormData({ ...formData, empresa_id: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      >
                        <option value="">Selecione uma empresa</option>
                        {empresas.map((empresa) => (
                          <option key={empresa.id} value={empresa.id}>
                            {empresa.nome}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Setor *
                      </label>
                      <select
                        value={formData.setor_id}
                        onChange={(e) => setFormData({ ...formData, setor_id: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      >
                        <option value="">Selecione um setor</option>
                        {setores
                          .filter(setor => !formData.empresa_id || setor.empresa_id.toString() === formData.empresa_id)
                          .map((setor) => (
                            <option key={setor.id} value={setor.id}>
                              {setor.nome}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo do Chamado
                    </label>
                    <select
                      value={formData.tipo_id}
                      onChange={(e) => setFormData({ ...formData, tipo_id: e.target.value, subtipo_id: '' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="">Selecione um tipo</option>
                      {tipos.map((tipo) => (
                        <option key={tipo.id} value={tipo.id}>
                          {tipo.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subtipo do Chamado
                    </label>
                    <select
                      value={formData.subtipo_id}
                      onChange={(e) => setFormData({ ...formData, subtipo_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      disabled={!formData.tipo_id}
                    >
                      <option value="">Selecione um subtipo</option>
                      {subtipos
                        .filter(subtipo => subtipo.tipo_id.toString() === formData.tipo_id)
                        .map((subtipo) => (
                          <option key={subtipo.id} value={subtipo.id}>
                            {subtipo.nome}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ID de Acesso
                    </label>
                    <input
                      type="text"
                      value={formData.id_acesso}
                      onChange={(e) => setFormData({ ...formData, id_acesso: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Anexo
                    </label>
                    <input
                      type="text"
                      value={formData.anexo}
                      onChange={(e) => setFormData({ ...formData, anexo: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="URL do anexo"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingTicket(null);
                      setFormData({
                        problema: '',
                        supervisor_id: '',
                        posicao_operador: '',
                        empresa_id: '',
                        setor_id: '',
                        id_acesso: '',
                        anexo: '',
                        tipo_id: '',
                        subtipo_id: ''
                      });
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    {editingTicket ? 'Atualizar' : 'Criar'} Chamado
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