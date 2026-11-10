export type ExcelRow = Record<string, string | number | null | undefined>;

/**
 * Gera e baixa um arquivo .xlsx a partir de linhas já formatadas.
 * As chaves de cada linha viram os cabeçalhos das colunas.
 */
export const generateExcel = async (reportName: string, rows: ExcelRow[]) => {
  // Carregada sob demanda: a biblioteca é grande e só é usada ao exportar
  const XLSX = await import('xlsx');
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  const sheetName = (reportName.charAt(0).toUpperCase() + reportName.slice(1)).slice(0, 31);
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  XLSX.writeFile(workbook, `Relatorio_${reportName}_${timestamp}.xlsx`);
};

export const formatDate = (value?: string | null): string => {
  if (!value) return '';
  // Datas puras (YYYY-MM-DD) são interpretadas como UTC pelo JS; força horário local
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00`) : new Date(value);
  return isNaN(date.getTime()) ? '' : date.toLocaleDateString('pt-BR');
};

export const formatDateTime = (value?: string | null): string => {
  if (!value) return '';
  const date = new Date(value);
  return isNaN(date.getTime()) ? '' : date.toLocaleString('pt-BR');
};
