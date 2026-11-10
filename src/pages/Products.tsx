import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { Package, Plus, Edit, Trash2, X, Filter, AlertTriangle, PlusCircle, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { Product, ProductStatus, PRODUCT_STATUS_LABELS } from '../types';

type ProductFormData = {
  nome: string;
  descricao: string;
  categoria_id: string;
  quantidade: number;
  quantidade_minima: number;
  status: ProductStatus;
  numero_serie: string;
  localizacao: string;
  data_compra: string;
  fim_garantia: string;
  notas: string;
};

const emptyForm = (categoryId = ''): ProductFormData => ({
  nome: '',
  descricao: '',
  categoria_id: categoryId,
  quantidade: 1,
  quantidade_minima: 1,
  status: 'ativo',
  numero_serie: '',
  localizacao: '',
  data_compra: '',
  fim_garantia: '',
  notas: '',
});

const Products = () => {
  const { products, categories, addProduct, updateProduct, deleteProduct, adjustProductQuantity, loading } = useData();
  const location = useLocation();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentProduct, setCurrentProduct] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterLowStock, setFilterLowStock] = useState<boolean>(false);
  const [quickAdjustModal, setQuickAdjustModal] = useState<{
    isOpen: boolean;
    productId: number;
    productName: string;
  }>({ isOpen: false, productId: 0, productName: '' });
  const [adjustReason, setAdjustReason] = useState('');
  const [formData, setFormData] = useState<ProductFormData>(emptyForm());

  // Filtro vindo da URL (?filter=lowstock)
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('filter') === 'lowstock') {
      setFilterLowStock(true);
    }
  }, [location.search]);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter(product =>
      (!filterCategory || product.categoria_id === Number(filterCategory)) &&
      (!filterStatus || product.status === filterStatus) &&
      (!filterLowStock || product.quantidade <= product.quantidade_minima) &&
      (!term ||
        product.nome.toLowerCase().includes(term) ||
        (product.numero_serie ?? '').toLowerCase().includes(term) ||
        (product.localizacao ?? '').toLowerCase().includes(term))
    );
  }, [products, search, filterCategory, filterStatus, filterLowStock]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-500">Carregando produtos...</p>
        </div>
      </div>
    );
  }

  const resetForm = () => {
    setFormData(emptyForm(categories.length > 0 ? String(categories[0].id) : ''));
    setCurrentProduct(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalMode('add');
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setFormData({
      nome: product.nome,
      descricao: product.descricao ?? '',
      categoria_id: String(product.categoria_id),
      quantidade: product.quantidade,
      quantidade_minima: product.quantidade_minima,
      status: product.status,
      numero_serie: product.numero_serie ?? '',
      localizacao: product.localizacao ?? '',
      data_compra: product.data_compra ?? '',
      fim_garantia: product.fim_garantia ?? '',
      notas: product.notas ?? '',
    });
    setCurrentProduct(product.id);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Math.max(0, parseInt(value, 10) || 0) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoria_id) {
      toast.error('Selecione uma categoria. Cadastre uma em Estoque > Categorias, se necessário.');
      return;
    }

    const payload = {
      nome: formData.nome.trim(),
      descricao: formData.descricao.trim() || null,
      categoria_id: Number(formData.categoria_id),
      quantidade: formData.quantidade,
      quantidade_minima: formData.quantidade_minima,
      status: formData.status,
      numero_serie: formData.numero_serie.trim() || null,
      localizacao: formData.localizacao.trim() || null,
      data_compra: formData.data_compra || null,
      fim_garantia: formData.fim_garantia || null,
      notas: formData.notas.trim() || null,
    };

    setSaving(true);
    const ok = modalMode === 'add'
      ? await addProduct(payload)
      : currentProduct !== null && await updateProduct(currentProduct, payload);
    setSaving(false);

    if (ok) closeModal();
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      deleteProduct(id);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setFilterCategory('');
    setFilterStatus('');
    setFilterLowStock(false);
    navigate('/products');
  };

  const openQuickAdjustModal = (product: Product) => {
    setAdjustReason('');
    setQuickAdjustModal({
      isOpen: true,
      productId: product.id,
      productName: product.nome,
    });
  };

  const closeQuickAdjustModal = () => {
    setQuickAdjustModal({ isOpen: false, productId: 0, productName: '' });
  };

  const handleQuickAdjust = async (adjustment: number) => {
    if (quickAdjustModal.productId) {
      const ok = await adjustProductQuantity(quickAdjustModal.productId, adjustment, adjustReason.trim() || undefined);
      if (ok) closeQuickAdjustModal();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
        <button
          onClick={openAddModal}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          <Plus className="w-5 h-5 mr-1" />
          Novo Produto
        </button>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center">
            <Filter className="w-5 h-5 text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-700">Filtros:</span>
          </div>
          
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label htmlFor="search" className="block text-xs font-medium text-gray-500 mb-1">
                Buscar
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="search"
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Nome, série ou local"
                  className="block w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label htmlFor="filterCategory" className="block text-xs font-medium text-gray-500 mb-1">
                Categoria
              </label>
              <select
                id="filterCategory"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="block w-full rounded-md border border-gray-300 py-2 px-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Todas as categorias</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.nome}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="filterStatus" className="block text-xs font-medium text-gray-500 mb-1">
                Status
              </label>
              <select
                id="filterStatus"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="block w-full rounded-md border border-gray-300 py-2 px-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Todos os status</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
                <option value="em_manutencao">Em Manutenção</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <input
                id="filterLowStock"
                type="checkbox"
                checked={filterLowStock}
                onChange={(e) => setFilterLowStock(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="filterLowStock" className="ml-2 block text-sm text-gray-700">
                Apenas estoque baixo
              </label>
            </div>
          </div>
          
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Limpar filtros
          </button>
        </div>
      </div>
      
      {/* Products list */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {products.length === 0 ? (
          <div className="p-6 text-center">
            <Package className="w-12 h-12 mx-auto text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Sem produtos</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comece adicionando seu primeiro produto.
            </p>
            <div className="mt-6">
              <button
                onClick={openAddModal}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Plus className="w-5 h-5 mr-1" />
                Novo Produto
              </button>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-6 text-center">
            <h3 className="text-sm font-medium text-gray-900">Nenhum produto corresponde aos filtros</h3>
            <button
              onClick={clearFilters}
              className="mt-2 text-blue-600 hover:text-blue-900"
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantidade
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Local
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => {
                  const category = categories.find(c => c.id === product.categoria_id);
                  const isLowStock = product.quantidade <= product.quantidade_minima;
                  
                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {isLowStock && (
                            <AlertTriangle className="w-4 h-4 text-amber-500 mr-1.5" />
                          )}
                          <div className="text-sm font-medium text-gray-900">{product.nome}</div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {product.numero_serie && `SN: ${product.numero_serie}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{category?.nome || 'Sem categoria'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${isLowStock ? 'text-amber-600 font-medium' : 'text-gray-900'}`}>
                          {product.quantidade} / {product.quantidade_minima}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.status === 'ativo'
                            ? 'bg-green-100 text-green-800'
                            : product.status === 'em_manutencao'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {PRODUCT_STATUS_LABELS[product.status] ?? product.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{product.localizacao || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openEditModal(product)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => openQuickAdjustModal(product)}
                          className="text-green-600 hover:text-green-900 mr-3"
                          title="Ajuste rápido de quantidade"
                        >
                          <PlusCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {modalMode === 'add' ? 'Novo Produto' : 'Editar Produto'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="md:col-span-2">
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
                
                <div className="md:col-span-2">
                  <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    id="descricao"
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleChange}
                    rows={2}
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  ></textarea>
                </div>
                
                <div>
                  <label htmlFor="categoria_id" className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria *
                  </label>
                  <select
                    id="categoria_id"
                    name="categoria_id"
                    value={formData.categoria_id}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="" disabled>Selecione uma categoria</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.nome}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                    <option value="em_manutencao">Em Manutenção</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="quantidade" className="block text-sm font-medium text-gray-700 mb-1">
                    Quantidade *
                  </label>
                  <input
                    type="number"
                    id="quantidade"
                    name="quantidade"
                    value={formData.quantidade}
                    onChange={handleChange}
                    min="0"
                    required
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="quantidade_minima" className="block text-sm font-medium text-gray-700 mb-1">
                    Quantidade Mínima *
                  </label>
                  <input
                    type="number"
                    id="quantidade_minima"
                    name="quantidade_minima"
                    value={formData.quantidade_minima}
                    onChange={handleChange}
                    min="0"
                    required
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="numero_serie" className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Série
                  </label>
                  <input
                    type="text"
                    id="numero_serie"
                    name="numero_serie"
                    value={formData.numero_serie}
                    onChange={handleChange}
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="localizacao" className="block text-sm font-medium text-gray-700 mb-1">
                    Localização
                  </label>
                  <input
                    type="text"
                    id="localizacao"
                    name="localizacao"
                    value={formData.localizacao}
                    onChange={handleChange}
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="data_compra" className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Compra
                  </label>
                  <input
                    type="date"
                    id="data_compra"
                    name="data_compra"
                    value={formData.data_compra}
                    onChange={handleChange}
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="fim_garantia" className="block text-sm font-medium text-gray-700 mb-1">
                    Fim da Garantia
                  </label>
                  <input
                    type="date"
                    id="fim_garantia"
                    name="fim_garantia"
                    value={formData.fim_garantia}
                    onChange={handleChange}
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="notas" className="block text-sm font-medium text-gray-700 mb-1">
                    Notas
                  </label>
                  <textarea
                    id="notas"
                    name="notas"
                    value={formData.notas}
                    onChange={handleChange}
                    rows={2}
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  ></textarea>
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

      {/* Quick Adjust Modal */}
      {quickAdjustModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Ajuste Rápido</h2>
              <button onClick={closeQuickAdjustModal} className="text-gray-400 hover:text-gray-500">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                <strong>{quickAdjustModal.productName}</strong>
              </p>
              <input
                type="text"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                placeholder="Motivo (opcional)"
                className="mb-6 block w-full rounded-md border border-gray-300 py-2 px-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Adicionar</p>
                  {[1, 5, 10, 25].map(amount => (
                    <button
                      key={amount}
                      onClick={() => handleQuickAdjust(amount)}
                      className="w-full py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      +{amount}
                    </button>
                  ))}
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Remover</p>
                  {[1, 5, 10, 25].map(amount => (
                    <button
                      key={amount}
                      onClick={() => handleQuickAdjust(-amount)}
                      className="w-full py-2 px-4 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      -{amount}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;