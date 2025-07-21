import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { Package, Plus, Edit, Trash2, X, Filter, AlertTriangle, Minus, PlusCircle } from 'lucide-react';

interface ProductFormData {
  name: string;
  description: string;
  categoryId: string;
  quantity: number;
  minQuantity: number;
  status: 'active' | 'inactive' | 'maintenance';
  serialNumber?: string;
  location?: string;
  purchaseDate?: string;
  warrantyEnd?: string;
  notes?: string;
}

const Products = () => {
  const { products, categories, addProduct, updateProduct, deleteProduct, adjustProductQuantity } = useData();
  const location = useLocation();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentProduct, setCurrentProduct] = useState<string | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<typeof products>([]);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterLowStock, setFilterLowStock] = useState<boolean>(false);
  const [quickAdjustModal, setQuickAdjustModal] = useState<{
    isOpen: boolean;
    productId: number;
    productName: string;
  }>({ isOpen: false, productId: 0, productName: '' });
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    categoryId: '',
    quantity: 1,
    minQuantity: 1,
    status: 'active'
  });
  
  // Check for URL filters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const lowStockFilter = searchParams.get('filter') === 'lowstock';
    
    if (lowStockFilter) {
      setFilterLowStock(true);
    }
  }, [location.search]);
  
  // Apply filters
  useEffect(() => {
    let result = [...products];
    
    if (filterCategory) {
      result = result.filter(product => product.categoryId === filterCategory);
    }
    
    if (filterStatus) {
      result = result.filter(product => product.status === filterStatus);
    }
    
    if (filterLowStock) {
      result = result.filter(product => product.quantity <= product.minQuantity);
    }
    
    setFilteredProducts(result);
  }, [products, filterCategory, filterStatus, filterLowStock]);
  
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      categoryId: categories.length > 0 ? categories[0].id : '',
      quantity: 1,
      minQuantity: 1,
      status: 'active',
      serialNumber: '',
      location: '',
      purchaseDate: '',
      warrantyEnd: '',
      notes: ''
    });
    setCurrentProduct(null);
  };
  
  const openAddModal = () => {
    resetForm();
    setModalMode('add');
    setIsModalOpen(true);
  };
  
  const openEditModal = (product: any) => {
    setFormData({
      name: product.name,
      description: product.description,
      categoryId: product.categoryId,
      quantity: product.quantity,
      minQuantity: product.minQuantity,
      status: product.status,
      serialNumber: product.serialNumber || '',
      location: product.location || '',
      purchaseDate: product.purchaseDate || '',
      warrantyEnd: product.warrantyEnd || '',
      notes: product.notes || ''
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
    
    if (type === 'number') {
      setFormData(prev => ({ 
        ...prev, 
        [name]: parseInt(value, 10) 
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (modalMode === 'add') {
      addProduct(formData);
    } else if (modalMode === 'edit' && currentProduct) {
      updateProduct(currentProduct, formData);
    }
    
    closeModal();
  };
  
  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      deleteProduct(id);
    }
  };
  
  const clearFilters = () => {
    setFilterCategory('');
    setFilterStatus('');
    setFilterLowStock(false);
    navigate('/products');
  };

  const openQuickAdjustModal = (product: any) => {
    setQuickAdjustModal({
      isOpen: true,
      productId: product.id,
      productName: product.nome
    });
  };

  const closeQuickAdjustModal = () => {
    setQuickAdjustModal({ isOpen: false, productId: 0, productName: '' });
  };

  const handleQuickAdjust = async (adjustment: number) => {
    if (quickAdjustModal.productId) {
      await adjustProductQuantity(quickAdjustModal.productId, adjustment);
      closeQuickAdjustModal();
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
          
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                    {category.name}
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
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
                <option value="maintenance">Em Manutenção</option>
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
                  const category = categories.find(c => c.id === product.categoryId);
                  const isLowStock = product.quantity <= product.minQuantity;
                  
                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {isLowStock && (
                            <AlertTriangle className="w-4 h-4 text-amber-500 mr-1.5" />
                          )}
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {product.serialNumber && `SN: ${product.serialNumber}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{category?.name || 'Sem categoria'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${isLowStock ? 'text-amber-600 font-medium' : 'text-gray-900'}`}>
                          {product.quantity} / {product.minQuantity}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : product.status === 'maintenance'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.status === 'active'
                            ? 'Ativo'
                            : product.status === 'maintenance'
                            ? 'Em Manutenção'
                            : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{product.location || '-'}</div>
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
                <div className="col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                
                <div className="col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={2}
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  ></textarea>
                </div>
                
                <div>
                  <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria *
                  </label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="" disabled>Selecione uma categoria</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
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
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                    <option value="maintenance">Em Manutenção</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                    Quantidade *
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    min="0"
                    required
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="minQuantity" className="block text-sm font-medium text-gray-700 mb-1">
                    Quantidade Mínima *
                  </label>
                  <input
                    type="number"
                    id="minQuantity"
                    name="minQuantity"
                    value={formData.minQuantity}
                    onChange={handleChange}
                    min="0"
                    required
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="serialNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Série
                  </label>
                  <input
                    type="text"
                    id="serialNumber"
                    name="serialNumber"
                    value={formData.serialNumber}
                    onChange={handleChange}
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Localização
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Compra
                  </label>
                  <input
                    type="date"
                    id="purchaseDate"
                    name="purchaseDate"
                    value={formData.purchaseDate}
                    onChange={handleChange}
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="warrantyEnd" className="block text-sm font-medium text-gray-700 mb-1">
                    Fim da Garantia
                  </label>
                  <input
                    type="date"
                    id="warrantyEnd"
                    name="warrantyEnd"
                    value={formData.warrantyEnd}
                    onChange={handleChange}
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                
                <div className="col-span-2">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Notas
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
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
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {modalMode === 'add' ? 'Adicionar' : 'Salvar'}
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
              <p className="text-gray-600 mb-6">
                <strong>{quickAdjustModal.productName}</strong>
              </p>
              
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