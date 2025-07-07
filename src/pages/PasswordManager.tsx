import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Key, Plus, Edit, Trash2, X, Eye, EyeOff, Copy, RefreshCw, Search, Filter, Shield, Globe, User, CreditCard, Briefcase, Heart } from 'lucide-react';
import toast from 'react-hot-toast';

interface PasswordFormData {
  title: string;
  username: string;
  password: string;
  website?: string;
  notes?: string;
  category: 'work' | 'personal' | 'social' | 'financial' | 'other';
}

const PasswordManager = () => {
  const { passwords, addPassword, updatePassword, deletePassword } = useData();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentPassword, setCurrentPassword] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [formData, setFormData] = useState<PasswordFormData>({
    title: '',
    username: '',
    password: '',
    website: '',
    notes: '',
    category: 'personal'
  });

  // Filter passwords for current user
  const userPasswords = passwords.filter(password => password.userId === user?.id);

  // Apply search and category filters
  const filteredPasswords = userPasswords.filter(password => {
    const matchesSearch = password.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         password.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (password.website && password.website.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !filterCategory || password.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const resetForm = () => {
    setFormData({
      title: '',
      username: '',
      password: '',
      website: '',
      notes: '',
      category: 'personal'
    });
    setCurrentPassword(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalMode('add');
    setIsModalOpen(true);
  };

  const openEditModal = (password: any) => {
    setFormData({
      title: password.title,
      username: password.username,
      password: password.password,
      website: password.website || '',
      notes: password.notes || '',
      category: password.category
    });
    setCurrentPassword(password.id);
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

  const generatePassword = (length: number = 16, includeSymbols: boolean = true) => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    let charset = lowercase + uppercase + numbers;
    if (includeSymbols) {
      charset += symbols;
    }
    
    let password = '';
    
    // Ensure at least one character from each type
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    if (includeSymbols) {
      password += symbols[Math.floor(Math.random() * symbols.length)];
    }
    
    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  };

  const handleGeneratePassword = () => {
    const newPassword = generatePassword();
    setFormData(prev => ({ ...prev, password: newPassword }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (modalMode === 'add') {
      addPassword({
        ...formData,
        userId: user!.id
      });
    } else if (modalMode === 'edit' && currentPassword) {
      updatePassword(currentPassword, formData);
    }
    
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta senha?')) {
      deletePassword(id);
    }
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${type} copiado para a área de transferência!`);
    } catch (err) {
      toast.error('Erro ao copiar para a área de transferência');
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'work':
        return <Briefcase className="w-4 h-4" />;
      case 'personal':
        return <User className="w-4 h-4" />;
      case 'social':
        return <Heart className="w-4 h-4" />;
      case 'financial':
        return <CreditCard className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'work':
        return 'bg-blue-100 text-blue-800';
      case 'personal':
        return 'bg-green-100 text-green-800';
      case 'social':
        return 'bg-pink-100 text-pink-800';
      case 'financial':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'work':
        return 'Trabalho';
      case 'personal':
        return 'Pessoal';
      case 'social':
        return 'Social';
      case 'financial':
        return 'Financeiro';
      default:
        return 'Outros';
    }
  };

  const getPasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score <= 2) return { label: 'Fraca', color: 'text-red-600', bg: 'bg-red-100' };
    if (score <= 4) return { label: 'Média', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { label: 'Forte', color: 'text-green-600', bg: 'bg-green-100' };
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Key className="w-8 h-8 text-blue-600 mr-3" />
            Gerenciador de Senhas
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Gerencie suas senhas de forma segura e organizada
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          <Plus className="w-5 h-5 mr-1" />
          Nova Senha
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por título, usuário ou site..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Filter className="w-5 h-5 text-gray-400 mr-2" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="rounded-md border border-gray-300 py-2 px-3 text-sm"
              >
                <option value="">Todas as categorias</option>
                <option value="work">Trabalho</option>
                <option value="personal">Pessoal</option>
                <option value="social">Social</option>
                <option value="financial">Financeiro</option>
                <option value="other">Outros</option>
              </select>
            </div>
            
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterCategory('');
              }}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Limpar filtros
            </button>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-blue-900">Segurança das Senhas</h3>
            <p className="text-sm text-blue-800 mt-1">
              Suas senhas são armazenadas localmente no seu navegador. Para maior segurança, 
              recomendamos fazer backup regular dos seus dados e usar senhas únicas para cada conta.
            </p>
          </div>
        </div>
      </div>

      {/* Password Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPasswords.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg border border-gray-200 p-8 text-center">
            <Key className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || filterCategory ? 'Nenhuma senha encontrada' : 'Nenhuma senha salva'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterCategory 
                ? 'Tente ajustar os filtros de busca.'
                : 'Comece adicionando sua primeira senha.'
              }
            </p>
            {!searchTerm && !filterCategory && (
              <button
                onClick={openAddModal}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="w-5 h-5 mr-1" />
                Adicionar Senha
              </button>
            )}
          </div>
        ) : (
          filteredPasswords.map(password => {
            const strength = getPasswordStrength(password.password);
            const isVisible = showPasswords[password.id];
            
            return (
              <div
                key={password.id}
                className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg ${getCategoryColor(password.category)} mr-3`}>
                      {getCategoryIcon(password.category)}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{password.title}</h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(password.category)}`}>
                        {getCategoryLabel(password.category)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(password)}
                      className="text-gray-600 hover:text-blue-600 p-1"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(password.id)}
                      className="text-gray-600 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Website */}
                  {password.website && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Site</label>
                      <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm text-gray-700 truncate">{password.website}</span>
                        <button
                          onClick={() => copyToClipboard(password.website!, 'Site')}
                          className="text-gray-500 hover:text-gray-700 ml-2"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Username */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Usuário</label>
                    <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm text-gray-700 truncate">{password.username}</span>
                      <button
                        onClick={() => copyToClipboard(password.username, 'Usuário')}
                        className="text-gray-500 hover:text-gray-700 ml-2"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Senha</label>
                    <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm text-gray-700 font-mono">
                        {isVisible ? password.password : '••••••••••••'}
                      </span>
                      <div className="flex space-x-1 ml-2">
                        <button
                          onClick={() => togglePasswordVisibility(password.id)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => copyToClipboard(password.password, 'Senha')}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Password Strength */}
                    <div className="mt-2 flex items-center">
                      <span className="text-xs text-gray-500 mr-2">Força:</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${strength.bg} ${strength.color}`}>
                        {strength.label}
                      </span>
                    </div>
                  </div>

                  {/* Notes */}
                  {password.notes && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Notas</label>
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{password.notes}</p>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Criado: {new Date(password.createdAt).toLocaleDateString('pt-BR')}</span>
                      <span>Atualizado: {new Date(password.updatedAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Key className="w-6 h-6 text-blue-600 mr-2" />
                {modalMode === 'add' ? 'Nova Senha' : 'Editar Senha'}
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
                    placeholder="Ex: Gmail, Facebook, Banco..."
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="personal">Pessoal</option>
                    <option value="work">Trabalho</option>
                    <option value="social">Social</option>
                    <option value="financial">Financeiro</option>
                    <option value="other">Outros</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                    Site/URL
                  </label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://exemplo.com"
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                    Usuário/Email *
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    placeholder="seu@email.com ou nome_usuario"
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Senha *
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="flex-1 rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                      title="Gerar senha segura"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center">
                        <span className="text-xs text-gray-500 mr-2">Força da senha:</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${getPasswordStrength(formData.password).bg} ${getPasswordStrength(formData.password).color}`}>
                          {getPasswordStrength(formData.password).label}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Notas
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Informações adicionais..."
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  ></textarea>
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

export default PasswordManager;</parameter>