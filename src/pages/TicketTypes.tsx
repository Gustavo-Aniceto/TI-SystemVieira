import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Ticket, Plus, Edit, Trash2, X, ChevronDown, ChevronRight } from 'lucide-react';

interface TicketTypeFormData {
  nome: string;
}

interface TicketSubtypeFormData {
  nome: string;
  tipo_id: number;
}

const TicketTypes = () => {
  const { ticketTypes, ticketSubtypes, addTicketType, updateTicketType, deleteTicketType, addTicketSubtype, updateTicketSubtype, deleteTicketSubtype, loading } = useData();
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [isSubtypeModalOpen, setIsSubtypeModalOpen] = useState(false);
  const [typeModalMode, setTypeModalMode] = useState<'add' | 'edit'>('add');
  const [subtypeModalMode, setSubtypeModalMode] = useState<'add' | 'edit'>('add');
  const [currentType, setCurrentType] = useState<string | null>(null);
  const [currentSubtype, setCurrentSubtype] = useState<string | null>(null);
  const [expandedTypes, setExpandedTypes] = useState<Record<number, boolean>>({});
  const [typeFormData, setTypeFormData] = useState<TicketTypeFormData>({
    nome: ''
  });
  const [subtypeFormData, setSubtypeFormData] = useState<TicketSubtypeFormData>({
    nome: '',
    tipo_id: 0
  });
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-500">Carregando tipos de chamado...</p>
        </div>
      </div>
    );
  }
  
  const resetTypeForms = () => {
    setTypeFormData({ nome: '' });
    setSubtypeFormData({ nome: '', tipo_id: 0 });
    setCurrentType(null);
    setCurrentSubtype(null);
  };
  
  const openAddTypeModal = () => {
    resetTypeForms();
    setTypeModalMode('add');
    setIsTypeModalOpen(true);
  };
  
  const openEditTypeModal = (type: any) => {
    setTypeFormData({ nome: type.nome });
    setCurrentType(type.id.toString());
    setTypeModalMode('edit');
    setIsTypeModalOpen(true);
  };
  
  const openAddSubtypeModal = (typeId: number) => {
    resetTypeForms();
    setSubtypeFormData({ nome: '', tipo_id: typeId });
    setSubtypeModalMode('add');
    setIsSubtypeModalOpen(true);
  };
  
  const openEditSubtypeModal = (subtype: any) => {
    setSubtypeFormData({ nome: subtype.nome, tipo_id: subtype.tipo_id });
    setCurrentSubtype(subtype.id.toString());
    setSubtypeModalMode('edit');
    setIsSubtypeModalOpen(true);
  };
  
  const closeModals = () => {
    setIsTypeModalOpen(false);
    setIsSubtypeModalOpen(false);
    resetTypeForms();
  };
  
  const handleTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTypeFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubtypeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSubtypeFormData(prev => ({ 
      ...prev, 
      [name]: name === 'tipo_id' ? parseInt(value) : value 
    }));
  };
  
  const handleTypeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (typeModalMode === 'add') {
      addTicketType(typeFormData);
    } else if (typeModalMode === 'edit' && currentType) {
      updateTicketType(parseInt(currentType), typeFormData);
    }
    
    closeModals();
  };
  
  const handleSubtypeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (subtypeModalMode === 'add') {
      addTicketSubtype(subtypeFormData);
    } else if (subtypeModalMode === 'edit' && currentSubtype) {
      updateTicketSubtype(parseInt(currentSubtype), subtypeFormData);
    }
    
    closeModals();
  };
  
  const handleDeleteType = (id: string) => {
    const subtypesCount = ticketSubtypes.filter(st => st.tipo_id === parseInt(id)).length;
    if (subtypesCount > 0) {
      alert('Não é possível excluir este tipo pois existem subtipos vinculados a ele.');
      return;
    }
    
    if (window.confirm('Tem certeza que deseja excluir este tipo de chamado?')) {
      deleteTicketType(parseInt(id));
    }
  };
  
  const handleDeleteSubtype = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este subtipo de chamado?')) {
      deleteTicketSubtype(parseInt(id));
    }
  };

  const toggleTypeExpansion = (typeId: number) => {
    setExpandedTypes(prev => ({
      ...prev,
      [typeId]: !prev[typeId]
    }));
  };

  const getSubtypesForType = (typeId: number) => {
    return ticketSubtypes.filter(subtype => subtype.tipo_id === typeId);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tipos de Chamado</h1>
          <p className="mt-1 text-sm text-gray-600">
            Gerencie os tipos e subtipos de chamados do sistema
          </p>
        </div>
        <button
          onClick={openAddTypeModal}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          <Plus className="w-5 h-5 mr-1" />
          Novo Tipo
        </button>
      </div>
      
      {/* Types list */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {ticketTypes.length === 0 ? (
          <div className="p-6 text-center">
            <Ticket className="w-12 h-12 mx-auto text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Sem tipos de chamado</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comece adicionando seu primeiro tipo de chamado.
            </p>
            <div className="mt-6">
              <button
                onClick={openAddTypeModal}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Plus className="w-5 h-5 mr-1" />
                Novo Tipo
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {ticketTypes.map((type) => {
              const subtypes = getSubtypesForType(type.id);
              const isExpanded = expandedTypes[type.id];
              
              return (
                <div key={type.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <button
                        onClick={() => toggleTypeExpansion(type.id)}
                        className="mr-2 p-1 hover:bg-gray-100 rounded"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        )}
                      </button>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{type.nome}</h3>
                        <p className="text-sm text-gray-500">{subtypes.length} subtipo(s)</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openAddSubtypeModal(type.id)}
                        className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                        title="Adicionar subtipo"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditTypeModal(type)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="Editar tipo"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteType(type.id.toString())}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        title="Excluir tipo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {isExpanded && subtypes.length > 0 && (
                    <div className="mt-4 ml-6 space-y-2">
                      {subtypes.map((subtype) => (
                        <div key={subtype.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm text-gray-700">{subtype.nome}</span>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => openEditSubtypeModal(subtype)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100"
                              title="Editar subtipo"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteSubtype(subtype.id.toString())}
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100"
                              title="Excluir subtipo"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Type Modal */}
      {isTypeModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {typeModalMode === 'add' ? 'Novo Tipo de Chamado' : 'Editar Tipo de Chamado'}
              </h2>
              <button onClick={closeModals} className="text-gray-400 hover:text-gray-500">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleTypeSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome *
                  </label>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    value={typeFormData.nome}
                    onChange={handleTypeChange}
                    required
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModals}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {typeModalMode === 'add' ? 'Adicionar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Subtype Modal */}
      {isSubtypeModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {subtypeModalMode === 'add' ? 'Novo Subtipo de Chamado' : 'Editar Subtipo de Chamado'}
              </h2>
              <button onClick={closeModals} className="text-gray-400 hover:text-gray-500">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubtypeSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="tipo_id" className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo *
                  </label>
                  <select
                    id="tipo_id"
                    name="tipo_id"
                    value={subtypeFormData.tipo_id}
                    onChange={handleSubtypeChange}
                    required
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Selecione um tipo</option>
                    {ticketTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.nome}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome *
                  </label>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    value={subtypeFormData.nome}
                    onChange={handleSubtypeChange}
                    required
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModals}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {subtypeModalMode === 'add' ? 'Adicionar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketTypes;