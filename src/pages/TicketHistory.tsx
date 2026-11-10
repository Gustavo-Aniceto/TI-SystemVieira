import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { formatDateTime } from '../utils/excelUtils';
import { TICKET_STATUS_LABELS } from '../types';
import { ClipboardList, Filter, FileText, Calendar, User, CheckCircle } from 'lucide-react';

const TicketHistory = () => {
  const { tickets, users, companies, sectors, ticketTypes, ticketSubtypes, generateReport } = useData();
  const { isAdmin } = useAuth();
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterSector, setFilterSector] = useState<string>('');
  const [filterUser, setFilterUser] = useState<string>('');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');

  // Only show for admins
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <ClipboardList className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Acesso Negado</h3>
          <p className="text-gray-500">Apenas administradores podem acessar o histórico de chamados.</p>
        </div>
      </div>
    );
  }

  const resolvedTickets = tickets.filter(ticket => ticket.status === 'resolvido');

  const filteredTickets = tickets.filter(ticket => {
    if (filterStatus && ticket.status !== filterStatus) return false;
    if (filterType && ticket.tipo_id?.toString() !== filterType) return false;
    if (filterSector && ticket.setor_id?.toString() !== filterSector) return false;
    if (filterUser && ticket.supervisor_id?.toString() !== filterUser) return false;
    if (filterStartDate && new Date(ticket.criado_em) < new Date(`${filterStartDate}T00:00:00`)) return false;
    if (filterEndDate && new Date(ticket.criado_em) > new Date(`${filterEndDate}T23:59:59`)) return false;
    return true;
  });

  const getUserName = (userId: number) => {
    const user = users.find(u => u.id === userId);
    return user ? user.nome : 'Usuário não encontrado';
  };

  const getCompanyName = (companyId: number) => {
    const company = companies.find(c => c.id === companyId);
    return company ? company.nome : 'Empresa não encontrada';
  };

  const getSectorName = (sectorId: number) => {
    const sector = sectors.find(s => s.id === sectorId);
    return sector ? sector.nome : 'Setor não encontrado';
  };

  const getTypeName = (typeId: number | null) => {
    if (!typeId) return '-';
    const type = ticketTypes.find(t => t.id === typeId);
    return type ? type.nome : 'Tipo não encontrado';
  };

  const getSubtypeName = (subtypeId: number | null) => {
    if (!subtypeId) return '-';
    const subtype = ticketSubtypes.find(st => st.id === subtypeId);
    return subtype ? subtype.nome : 'Subtipo não encontrado';
  };

  // Exporta exatamente o que está filtrado na tela
  const generateHistoryReport = () => {
    generateReport('tickets', {}, filteredTickets.map(ticket => ({
      ID: ticket.id,
      Problema: ticket.problema,
      Status: TICKET_STATUS_LABELS[ticket.status] ?? ticket.status,
      Supervisor: getUserName(ticket.supervisor_id),
      Empresa: getCompanyName(ticket.empresa_id),
      Setor: getSectorName(ticket.setor_id),
      Tipo: getTypeName(ticket.tipo_id),
      Subtipo: getSubtypeName(ticket.subtipo_id),
      'Posição do Operador': ticket.posicao_operador ?? '',
      'ID de Acesso': ticket.id_acesso ?? '',
      'Data de Criação': formatDateTime(ticket.criado_em),
    })));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <ClipboardList className="w-8 h-8 text-blue-600 mr-3" />
            Histórico de Chamados
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Consulte e exporte o histórico completo de chamados do sistema
          </p>
        </div>
        <button
          onClick={generateHistoryReport}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          <FileText className="w-5 h-5 mr-2" />
          Gerar Relatório
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
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
              <option value="aberto">Aberto</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="resolvido">Resolvido</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="block w-full rounded-md border border-gray-300 py-2 px-3 text-sm"
            >
              <option value="">Todos</option>
              {ticketTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Setor
            </label>
            <select
              value={filterSector}
              onChange={(e) => setFilterSector(e.target.value)}
              className="block w-full rounded-md border border-gray-300 py-2 px-3 text-sm"
            >
              <option value="">Todos</option>
              {sectors.map(sector => (
                <option key={sector.id} value={sector.id}>
                  {sector.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Usuário
            </label>
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="block w-full rounded-md border border-gray-300 py-2 px-3 text-sm"
            >
              <option value="">Todos</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.nome}
                </option>
              ))}
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
              setFilterStatus('');
              setFilterType('');
              setFilterSector('');
              setFilterUser('');
              setFilterStartDate('');
              setFilterEndDate('');
            }}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Limpar Filtros
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg mr-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Resolvidos</p>
              <p className="text-2xl font-bold text-gray-900">{resolvedTickets.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg mr-4">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Abertos este mês</p>
              <p className="text-2xl font-bold text-gray-900">
                {tickets.filter(ticket => {
                  const ticketDate = new Date(ticket.criado_em);
                  const now = new Date();
                  return ticketDate.getMonth() === now.getMonth() && 
                         ticketDate.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg mr-4">
              <Filter className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Filtrados</p>
              <p className="text-2xl font-bold text-gray-900">{filteredTickets.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tickets History Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chamado
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo/Subtipo
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empresa/Setor
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Solicitante
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Datas
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        #{ticket.id.toString().padStart(6, '0')}
                      </div>
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {ticket.problema}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{getTypeName(ticket.tipo_id)}</div>
                    <div className="text-sm text-gray-500">{getSubtypeName(ticket.subtipo_id)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{getCompanyName(ticket.empresa_id)}</div>
                    <div className="text-sm text-gray-500">{getSectorName(ticket.setor_id)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                      <div className="text-sm text-gray-900">{getUserName(ticket.supervisor_id)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      Aberto: {new Date(ticket.criado_em).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(ticket.criado_em).toLocaleTimeString('pt-BR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      ticket.status === 'resolvido'
                        ? 'bg-green-100 text-green-800'
                        : ticket.status === 'em_andamento'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {TICKET_STATUS_LABELS[ticket.status] ?? ticket.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTickets.length === 0 && (
          <div className="p-6 text-center">
            <ClipboardList className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum chamado encontrado</h3>
            <p className="text-gray-500">
              {tickets.length === 0
                ? 'Ainda não há chamados no sistema.'
                : 'Tente ajustar os filtros de busca.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketHistory;