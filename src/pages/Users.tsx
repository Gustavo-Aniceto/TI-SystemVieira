import React, { useState } from 'react';
import { useData, AppUser } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Edit, Trash2, X, ShieldAlert } from 'lucide-react';
import type { UserRole } from '../types';

interface UserFormData {
  nome_usuario: string;
  senha: string;
  nome: string;
  email: string;
  funcao: UserRole;
  empresa_id: string;
  setor_id: string;
}

const Users = () => {
  const { users, addUser, updateUser, deleteUser, companies, sectors } = useData();
  const { user: currentUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const emptyForm = (): UserFormData => ({
    nome_usuario: '',
    senha: '',
    nome: '',
    email: '',
    funcao: 'usuario',
    empresa_id: companies.length > 0 ? String(companies[0].id) : '',
    setor_id: '',
  });
  const [formData, setFormData] = useState<UserFormData>(emptyForm);

  const resetForm = () => {
    setFormData(emptyForm());
    setCurrentUserId(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalMode('add');
    setIsModalOpen(true);
  };

  const openEditModal = (user: AppUser) => {
    setFormData({
      nome_usuario: user.nome_usuario,
      senha: '', // A senha atual não é exibida; preencher define uma nova
      nome: user.nome,
      email: user.email,
      funcao: user.funcao,
      empresa_id: user.empresa_id ? String(user.empresa_id) : '',
      setor_id: user.setor_id ? String(user.setor_id) : '',
    });
    setCurrentUserId(user.id);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Ao trocar a empresa, o setor anterior deixa de ser válido
      ...(name === 'empresa_id' ? { setor_id: '' } : {}),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      nome: formData.nome.trim(),
      nome_usuario: formData.nome_usuario.trim(),
      email: formData.email.trim(),
      funcao: formData.funcao,
      empresa_id: formData.empresa_id ? Number(formData.empresa_id) : null,
      setor_id: formData.setor_id ? Number(formData.setor_id) : null,
    };

    setSaving(true);
    const ok = modalMode === 'add'
      ? await addUser({ ...payload, senha: formData.senha })
      : currentUserId !== null && await updateUser(currentUserId, formData.senha ? { ...payload, senha: formData.senha } : payload);
    setSaving(false);

    if (ok) closeModal();
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      deleteUser(id);
    }
  };

  const getRoleDisplay = (funcao: string) => {
    switch (funcao) {
      case 'administrador':
        return 'Administrador';
      case 'usuario':
        return 'Usuário';
      case 'estagiario':
        return 'Estagiário';
      case 'supervisor':
        return 'Supervisor';
      default:
        return funcao;
    }
  };

  const getRoleColor = (funcao: string) => {
    switch (funcao) {
      case 'administrador':
        return 'bg-purple-100 text-purple-800';
      case 'supervisor':
        return 'bg-orange-100 text-orange-800';
      case 'estagiario':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCompanyName = (empresa_id: number | null) => {
    const company = companies.find(c => c.id === empresa_id);
    return company ? company.nome : '-';
  };

  const getSectorName = (setor_id: number | null) => {
    if (!setor_id) return '-';
    const sector = sectors.find(s => s.id === setor_id);
    return sector ? sector.nome : '-';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
        <button
          onClick={openAddModal}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          <Plus className="w-5 h-5 mr-1" />
          Novo Usuário
        </button>
      </div>
      
      {/* Users list */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome de Usuário
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Função
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empresa
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Setor
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className={`hover:bg-gray-50 ${user.id === currentUser?.id ? 'bg-blue-50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">{user.nome}</div>
                      {user.id === currentUser?.id && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Você
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.nome_usuario}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.funcao)}`}>
                      {user.funcao === 'administrador' && <ShieldAlert className="w-3 h-3 mr-1" />}
                      {getRoleDisplay(user.funcao)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{getCompanyName(user.empresa_id)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{getSectorName(user.setor_id)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openEditModal(user)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className={`text-red-600 hover:text-red-900 ${
                        user.id === currentUser?.id ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      disabled={user.id === currentUser?.id}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {modalMode === 'add' ? 'Novo Usuário' : 'Editar Usuário'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome *
                  </label>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="nome_usuario" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome de Usuário *
                  </label>
                  <input
                    type="text"
                    id="nome_usuario"
                    name="nome_usuario"
                    value={formData.nome_usuario}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-1">
                    {modalMode === 'add' ? 'Senha *' : 'Nova Senha (deixe em branco para manter a atual)'}
                  </label>
                  <input
                    type="password"
                    id="senha"
                    name="senha"
                    value={formData.senha}
                    onChange={handleChange}
                    required={modalMode === 'add'}
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="funcao" className="block text-sm font-medium text-gray-700 mb-1">
                    Função *
                  </label>
                  <select
                    id="funcao"
                    name="funcao"
                    value={formData.funcao}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="usuario">Usuário</option>
                    <option value="administrador">Administrador</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="estagiario">Estagiário</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="empresa_id" className="block text-sm font-medium text-gray-700 mb-1">
                    Empresa *
                  </label>
                  <select
                    id="empresa_id"
                    name="empresa_id"
                    value={formData.empresa_id}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="" disabled>Selecione uma empresa</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="setor_id" className="block text-sm font-medium text-gray-700 mb-1">
                    Setor
                  </label>
                  <select
                    id="setor_id"
                    name="setor_id"
                    value={formData.setor_id}
                    onChange={handleChange}
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Selecione um setor</option>
                    {sectors.filter(s => s.empresa_id === Number(formData.empresa_id)).map((sector) => (
                      <option key={sector.id} value={sector.id}>
                        {sector.nome}
                      </option>
                    ))}
                  </select>
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
                  disabled={saving}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {saving ? 'Salvando...' : modalMode === 'add' ? 'Adicionar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;