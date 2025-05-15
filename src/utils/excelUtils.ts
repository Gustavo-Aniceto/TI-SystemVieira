import * as XLSX from 'xlsx';

export const generateExcel = (
  reportType: string,
  data: any[],
  columns: string[]
) => {
  // Format the data for Excel
  const formattedData = data.map(item => {
    switch (reportType) {
      case 'products':
        return {
          'ID': item.id,
          'Nome': item.name,
          'Categoria': item.categoryName,
          'Quantidade': item.quantity,
          'Quantidade Mínima': item.minQuantity,
          'Status': formatStatus(item.status),
          'Localização': formatLocation(item),
          'Ciclo de Vida': formatLifecycleStatus(item.lifecycleStatus),
          'Data de Compra': formatDate(item.purchaseDate),
          'Fim da Garantia': formatDate(item.warrantyEnd),
          'Expiração da Licença': formatDate(item.licenseExpiration),
          'Data de Criação': formatDate(item.createdAt)
        };
      
      case 'movements':
        return {
          'ID': item.id,
          'Produto': item.productName,
          'Tipo': formatMovementType(item.type),
          'Usuário': item.userName,
          'De': item.fromLocation || '-',
          'Para': item.toLocation || '-',
          'Data': formatDate(item.date),
          'Motivo': item.reason || '-',
          'Retorno Previsto': formatDate(item.expectedReturnDate)
        };
      
      case 'maintenance':
        return {
          'ID': item.id,
          'Produto': item.productName,
          'Data': formatDate(item.date),
          'Descrição': item.description,
          'Custo': formatCurrency(item.cost),
          'Fornecedor': item.provider || '-',
          'Status': formatMaintenanceStatus(item.status),
          'Notas': item.notes || '-'
        };
      
      case 'categories':
        return {
          'ID': item.id,
          'Nome': item.name,
          'Descrição': item.description,
          'Data de Criação': formatDate(item.createdAt)
        };
      
      case 'events':
        return {
          'ID': item.id,
          'Título': item.title,
          'Tipo': formatEventType(item.type),
          'Data de Início': formatDate(item.startDate),
          'Data de Término': formatDate(item.endDate),
          'Descrição': item.description,
          'Produto Relacionado': item.productName || '-',
          'Data de Criação': formatDate(item.createdAt)
        };
      
      default:
        return item;
    }
  });

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  
  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, reportType.charAt(0).toUpperCase() + reportType.slice(1));
  
  // Create timestamp for filename
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  // Generate Excel file
  XLSX.writeFile(workbook, `Relatorio_${reportType}_${timestamp}.xlsx`);
};

// Helper functions
const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

const formatStatus = (status: string): string => {
  switch (status) {
    case 'active': return 'Ativo';
    case 'inactive': return 'Inativo';
    case 'maintenance': return 'Em Manutenção';
    default: return status;
  }
};

const formatEventType = (type: string): string => {
  switch (type) {
    case 'subscription': return 'Assinatura';
    case 'task': return 'Tarefa';
    case 'reminder': return 'Lembrete';
    case 'maintenance': return 'Manutenção';
    case 'license': return 'Licença';
    default: return type;
  }
};

const formatLocation = (item: any): string => {
  const parts = [
    item.location,
    item.department,
    item.branch
  ].filter(Boolean);
  
  return parts.join(' / ') || '-';
};

const formatLifecycleStatus = (status: string): string => {
  switch (status) {
    case 'new': return 'Novo';
    case 'in-use': return 'Em Uso';
    case 'maintenance': return 'Em Manutenção';
    case 'disposed': return 'Descartado';
    default: return status;
  }
};

const formatMovementType = (type: string): string => {
  switch (type) {
    case 'check-out': return 'Saída';
    case 'check-in': return 'Entrada';
    case 'transfer': return 'Transferência';
    default: return type;
  }
};

const formatMaintenanceStatus = (status: string): string => {
  switch (status) {
    case 'completed': return 'Concluída';
    case 'pending': return 'Pendente';
    case 'scheduled': return 'Agendada';
    default: return status;
  }
};

const formatCurrency = (value: number | undefined): string => {
  if (value === undefined) return '-';
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
};