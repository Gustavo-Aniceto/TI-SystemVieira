// Configuração do cliente Supabase
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Variáveis de ambiente do Supabase não encontradas. Clique em "Connect to Supabase" no canto superior direito.');
}

// Cliente HTTP para requisições à API REST da Supabase
class SupabaseClient {
  private baseUrl: string;
  private headers: HeadersInit;

  constructor() {
    this.baseUrl = `${SUPABASE_URL}/rest/v1`;
    this.headers = {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };
  }

  // Método genérico para requisições GET
  async get(table: string, query?: string) {
    const url = query ? `${this.baseUrl}/${table}?${query}` : `${this.baseUrl}/${table}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: this.headers
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar dados: ${response.statusText}`);
    }

    return response.json();
  }

  // Método genérico para requisições POST
  async post(table: string, data: any) {
    const response = await fetch(`${this.baseUrl}/${table}`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Erro ao criar registro: ${response.statusText}`);
    }

    return response.json();
  }

  // Método genérico para requisições PATCH
  async patch(table: string, id: number, data: any) {
    const response = await fetch(`${this.baseUrl}/${table}?id=eq.${id}`, {
      method: 'PATCH',
      headers: this.headers,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Erro ao atualizar registro: ${response.statusText}`);
    }

    return response.json();
  }

  // Método genérico para requisições DELETE
  async delete(table: string, id: number) {
    const response = await fetch(`${this.baseUrl}/${table}?id=eq.${id}`, {
      method: 'DELETE',
      headers: this.headers
    });

    if (!response.ok) {
      throw new Error(`Erro ao deletar registro: ${response.statusText}`);
    }

    return response.json();
  }

  // Métodos específicos para cada tabela

  // USUÁRIOS
  async getUsers() {
    return this.get('usuarios');
  }

  async createUser(userData: any) {
    return this.post('usuarios', userData);
  }

  async updateUser(id: number, userData: any) {
    return this.patch('usuarios', id, userData);
  }

  async deleteUser(id: number) {
    return this.delete('usuarios', id);
  }

  async getUserByCredentials(nome_usuario: string, senha: string) {
    return this.get('usuarios', `nome_usuario=eq.${nome_usuario}&senha=eq.${senha}`);
  }

  // EMPRESAS
  async getCompanies() {
    return this.get('empresas');
  }

  async createCompany(companyData: any) {
    return this.post('empresas', companyData);
  }

  async updateCompany(id: number, companyData: any) {
    return this.patch('empresas', id, companyData);
  }

  async deleteCompany(id: number) {
    return this.delete('empresas', id);
  }

  // SETORES
  async getSectors() {
    return this.get('setores');
  }

  async createSector(sectorData: any) {
    return this.post('setores', sectorData);
  }

  async updateSector(id: number, sectorData: any) {
    return this.patch('setores', id, sectorData);
  }

  async deleteSector(id: number) {
    return this.delete('setores', id);
  }

  // CATEGORIAS
  async getCategories() {
    return this.get('categorias');
  }

  async createCategory(categoryData: any) {
    return this.post('categorias', categoryData);
  }

  async updateCategory(id: number, categoryData: any) {
    return this.patch('categorias', id, categoryData);
  }

  async deleteCategory(id: number) {
    return this.delete('categorias', id);
  }

  // PRODUTOS
  async getProducts() {
    return this.get('produtos');
  }

  async createProduct(productData: any) {
    return this.post('produtos', productData);
  }

  async updateProduct(id: number, productData: any) {
    return this.patch('produtos', id, productData);
  }

  async deleteProduct(id: number) {
    return this.delete('produtos', id);
  }

  // CHAMADOS
  async getTickets() {
    return this.get('chamados');
  }

  async createTicket(ticketData: any) {
    return this.post('chamados', ticketData);
  }

  async updateTicket(id: number, ticketData: any) {
    return this.patch('chamados', id, ticketData);
  }

  async deleteTicket(id: number) {
    return this.delete('chamados', id);
  }

  // HISTÓRICO DE CHAMADOS
  async getTicketHistory() {
    return this.get('historico_chamados');
  }

  async createTicketHistory(historyData: any) {
    return this.post('historico_chamados', historyData);
  }

  // EVENTOS DO CALENDÁRIO
  async getCalendarEvents() {
    return this.get('eventos_calendario');
  }

  async createCalendarEvent(eventData: any) {
    return this.post('eventos_calendario', eventData);
  }

  async updateCalendarEvent(id: number, eventData: any) {
    return this.patch('eventos_calendario', id, eventData);
  }

  async deleteCalendarEvent(id: number) {
    return this.delete('eventos_calendario', id);
  }

  // ANOTAÇÕES
  async getNotes() {
    return this.get('anotacoes');
  }

  async createNote(noteData: any) {
    return this.post('anotacoes', noteData);
  }

  async updateNote(id: number, noteData: any) {
    return this.patch('anotacoes', id, noteData);
  }

  async deleteNote(id: number) {
    return this.delete('anotacoes', id);
  }

  // LISTAS DE TAREFAS
  async getTaskLists() {
    return this.get('listas_tarefas');
  }

  async createTaskList(taskListData: any) {
    return this.post('listas_tarefas', taskListData);
  }

  async updateTaskList(id: number, taskListData: any) {
    return this.patch('listas_tarefas', id, taskListData);
  }

  async deleteTaskList(id: number) {
    return this.delete('listas_tarefas', id);
  }

  // ITENS DE LISTA DE TAREFA
  async getTaskListItems() {
    return this.get('itens_lista_tarefa');
  }

  async createTaskListItem(itemData: any) {
    return this.post('itens_lista_tarefa', itemData);
  }

  async updateTaskListItem(id: number, itemData: any) {
    return this.patch('itens_lista_tarefa', id, itemData);
  }

  async deleteTaskListItem(id: number) {
    return this.delete('itens_lista_tarefa', id);
  }

  // TIPOS DE CHAMADOS
  async getTicketTypes() {
    return this.get('chamados_tipos');
  }

  async createTicketType(typeData: any) {
    return this.post('chamados_tipos', typeData);
  }

  // SUBTIPOS DE CHAMADOS
  async getTicketSubtypes() {
    return this.get('chamados_subtipos');
  }

  async createTicketSubtype(subtypeData: any) {
    return this.post('chamados_subtipos', subtypeData);
  }

  // MOVIMENTAÇÕES DE ESTOQUE
  async getStockMovements() {
    return this.get('movimentacoes_estoque');
  }

  async createStockMovement(movementData: any) {
    return this.post('movimentacoes_estoque', movementData);
  }

  // NOTIFICAÇÕES
  async getNotifications() {
    return this.get('notificacoes');
  }

  async createNotification(notificationData: any) {
    return this.post('notificacoes', notificationData);
  }

  async updateNotification(id: number, notificationData: any) {
    return this.patch('notificacoes', id, notificationData);
  }

  // SENHAS
  async getPasswords() {
    return this.get('senhas');
  }

  async createPassword(passwordData: any) {
    return this.post('senhas', passwordData);
  }

  async updatePassword(id: number, passwordData: any) {
    return this.patch('senhas', id, passwordData);
  }

  async deletePassword(id: number) {
    return this.delete('senhas', id);
  }
}

export const supabase = new SupabaseClient();