import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useData } from '../contexts/DataContext';
import { CalendarIcon, ChevronLeft, ChevronRight, Plus, Edit, Trash2, X, Filter } from 'lucide-react';

interface CalendarFormData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  type: 'subscription' | 'task' | 'reminder';
  color?: string;
}

const Calendar = () => {
  const { events, tickets, addEvent, updateEvent, deleteEvent, sectors, ticketTypes } = useData();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentEvent, setCurrentEvent] = useState<string | null>(null);
  const [showTickets, setShowTickets] = useState(true);
  const [filterType, setFilterType] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterSector, setFilterSector] = useState<string>('');
  const [formData, setFormData] = useState<CalendarFormData>({
    title: '',
    description: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    type: 'task',
    color: '#3b82f6' // Default blue
  });
  
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      startDate: format(selectedDate, 'yyyy-MM-dd'),
      endDate: format(selectedDate, 'yyyy-MM-dd'),
      type: 'task',
      color: '#3b82f6'
    });
    setCurrentEvent(null);
  };
  
  const openAddModal = (date: Date = selectedDate) => {
    resetForm();
    setFormData(prev => ({
      ...prev,
      startDate: format(date, 'yyyy-MM-dd'),
      endDate: format(date, 'yyyy-MM-dd')
    }));
    setModalMode('add');
    setIsModalOpen(true);
  };
  
  const openEditModal = (event: any) => {
    setFormData({
      title: event.title,
      description: event.description,
      startDate: format(new Date(event.startDate), 'yyyy-MM-dd'),
      endDate: format(new Date(event.endDate), 'yyyy-MM-dd'),
      type: event.type,
      color: event.color || '#3b82f6'
    });
    setCurrentEvent(event.id);
    setModalMode('edit');
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
    
    if (modalMode === 'add') {
      addEvent(formData);
    } else if (modalMode === 'edit' && currentEvent) {
      updateEvent(currentEvent, formData);
    }
    
    closeModal();
  };
  
  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este evento?')) {
      deleteEvent(id);
    }
  };
  
  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };
  
  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };
  
  const onDateClick = (day: Date) => {
    setSelectedDate(day);
  };
  
  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-xl font-semibold text-gray-900">
          {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
        </h2>
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    );
  };
  
  const renderDays = () => {
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
    return (
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center font-medium text-sm text-gray-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>
    );
  };
  
  const renderCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    
    const rows = [];
    let days = [];
    let day = startDate;
    
    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, 'yyyy-MM-dd');
        
        // Get events for the day
        let eventsForDay = events.filter((event) => {
          const eventStart = new Date(event.startDate);
          const eventEnd = new Date(event.endDate);
          const currentDay = new Date(day);
          
          return currentDay >= eventStart && currentDay <= eventEnd;
        });
        
        // Get tickets for the day (if enabled)
        let ticketsForDay: any[] = [];
        if (showTickets) {
          ticketsForDay = tickets.filter((ticket) => {
            const ticketDate = new Date(ticket.criado_em);
            const currentDay = new Date(day);
            
            // Apply filters
            if (filterType && ticket.tipo_id?.toString() !== filterType) return false;
            if (filterStatus && ticket.status !== filterStatus) return false;
            if (filterSector && ticket.setor_id?.toString() !== filterSector) return false;
            
            return isSameDay(ticketDate, currentDay);
          });
        }
        
        days.push(
          <div
            key={formattedDate}
            className={`min-h-28 p-1 border border-gray-200 ${
              !isSameMonth(day, monthStart)
                ? 'bg-gray-50 text-gray-400'
                : isSameDay(day, selectedDate)
                ? 'bg-blue-50 border-blue-300'
                : 'bg-white'
            }`}
            onClick={() => onDateClick(new Date(day))}
          >
            <div className="flex justify-between items-start">
              <span className={`text-sm font-medium ${
                isSameDay(day, new Date())
                  ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center'
                  : 'text-gray-700'
              }`}>
                {format(day, 'd')}
              </span>
              {isSameMonth(day, monthStart) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openAddModal(new Date(day));
                  }}
                  className="text-gray-400 hover:text-blue-600 p-1"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="mt-1 space-y-1 max-h-24 overflow-y-auto">
              {/* Events */}
              {eventsForDay.map((event) => (
                <div
                  key={event.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditModal(event);
                  }}
                  className="text-xs p-1 rounded truncate cursor-pointer"
                  style={{
                    backgroundColor: event.cor ? `${event.cor}20` : '#3b82f620',
                    borderLeft: `3px solid ${event.cor || '#3b82f6'}`
                  }}
                >
                  {event.titulo}
                </div>
              ))}
              
              {/* Tickets */}
              {ticketsForDay.map((ticket) => (
                <div
                  key={`ticket-${ticket.id}`}
                  className="text-xs p-1 rounded truncate bg-red-50 border-l-3 border-red-400 text-red-800"
                  title={`Chamado #${ticket.id}: ${ticket.problema}`}
                >
                  #{ticket.id.toString().padStart(4, '0')}
                </div>
              ))}
            </div>
          </div>
        );
        
        day = addDays(day, 1);
      }
      
      rows.push(
        <div key={format(day, 'yyyy-MM-dd')} className="grid grid-cols-7">
          {days}
        </div>
      );
      
      days = [];
    }
    
    return <div className="mb-4">{rows}</div>;
  };
  
  const renderEvents = () => {
    // Get events for the selected date
    let selectedDateEvents = events.filter((event) => {
      const eventStart = new Date(event.data_inicio);
      const eventEnd = new Date(event.data_termino);
      
      return (
        selectedDate >= eventStart && selectedDate <= eventEnd
      );
    });
    
    // Get tickets for the selected date
    let selectedDateTickets: any[] = [];
    if (showTickets) {
      selectedDateTickets = tickets.filter((ticket) => {
        const ticketDate = new Date(ticket.criado_em);
        
        // Apply filters
        if (filterType && ticket.tipo_id?.toString() !== filterType) return false;
        if (filterStatus && ticket.status !== filterStatus) return false;
        if (filterSector && ticket.setor_id?.toString() !== filterSector) return false;
        
        return isSameDay(ticketDate, selectedDate);
      });
    }
    
    const totalItems = selectedDateEvents.length + selectedDateTickets.length;
    
    if (totalItems === 0) {
      return (
        <div className="text-center py-4">
          <p className="text-gray-500">
            Nenhum item para {format(selectedDate, 'dd/MM/yyyy')}
          </p>
          <button
            onClick={() => openAddModal()}
            className="mt-2 inline-flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            Adicionar Evento
          </button>
        </div>
      );
    }
    
    return (
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">
            Itens em {format(selectedDate, 'dd/MM/yyyy')}
          </h3>
          <button
            onClick={() => openAddModal()}
            className="inline-flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            Adicionar
          </button>
        </div>
        
        <div className="space-y-2">
          {/* Events */}
          {selectedDateEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: event.cor || '#3b82f6' }}
                    ></div>
                    <h4 className="text-base font-medium text-gray-900">{event.titulo}</h4>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{event.descricao}</p>
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <CalendarIcon className="w-3.5 h-3.5 mr-1" />
                    <span>
                      {format(new Date(event.data_inicio), 'dd/MM/yyyy')}
                      {event.data_inicio !== event.data_termino && 
                        ` - ${format(new Date(event.data_termino), 'dd/MM/yyyy')}`}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openEditModal(event)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {/* Tickets */}
          {selectedDateTickets.map((ticket) => (
            <div
              key={`ticket-${ticket.id}`}
              className="bg-red-50 p-3 rounded-lg border border-red-200"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2 bg-red-500"></div>
                    <h4 className="text-base font-medium text-gray-900">
                      Chamado #{ticket.id.toString().padStart(4, '0')}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{ticket.problema}</p>
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      ticket.status === 'aberto' ? 'bg-red-100 text-red-800' :
                      ticket.status === 'em_andamento' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {ticket.status === 'aberto' ? 'Aberto' :
                       ticket.status === 'em_andamento' ? 'Em Andamento' : 'Resolvido'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendário</h1>
          <p className="mt-1 text-sm text-gray-600">
            Visualize eventos e chamados em um calendário integrado
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowTickets(!showTickets)}
            className={`px-3 py-2 text-sm rounded-md transition-colors ${
              showTickets 
                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {showTickets ? 'Ocultar' : 'Mostrar'} Chamados
          </button>
          <button
            onClick={() => openAddModal()}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <Plus className="w-5 h-5 mr-1" />
            Novo Evento
          </button>
        </div>
      </div>
      
      {/* Filters */}
      {showTickets && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex items-center mb-3">
            <Filter className="w-5 h-5 text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-700">Filtros de Chamados:</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="block w-full rounded-md border border-gray-300 py-2 px-3 text-sm"
              >
                <option value="">Todos os tipos</option>
                {ticketTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.nome}
                  </option>
                ))}
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
                <option value="">Todos os status</option>
                <option value="aberto">Aberto</option>
                <option value="em_andamento">Em Andamento</option>
                <option value="resolvido">Resolvido</option>
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
                <option value="">Todos os setores</option>
                {sectors.map(sector => (
                  <option key={sector.id} value={sector.id}>
                    {sector.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mt-3 flex justify-end">
            <button
              onClick={() => {
                setFilterType('');
                setFilterStatus('');
                setFilterSector('');
              }}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          {renderHeader()}
          {renderDays()}
          {renderCells()}
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          {renderEvents()}
        </div>
      </div>
      
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {modalMode === 'add' ? 'Novo Evento' : 'Editar Evento'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Título *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  ></textarea>
                </div>
                
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo *
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="subscription">Assinatura</option>
                    <option value="task">Tarefa</option>
                    <option value="reminder">Lembrete</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Início *
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      required
                      className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Término *
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      required
                      min={formData.startDate}
                      className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
                    Cor
                  </label>
                  <div className="flex items-center">
                    <input
                      type="color"
                      id="color"
                      name="color"
                      value={formData.color}
                      onChange={handleChange}
                      className="w-10 h-10 rounded-md border border-gray-300 p-1 mr-2"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={handleChange}
                      name="color"
                      className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {modalMode === 'add' ? 'Adicionar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;