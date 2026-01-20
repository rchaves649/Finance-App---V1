
import { RawCSVTransaction } from '../types/finance';
import { roundToTwo } from '../shared/formatUtils';

/**
 * Palavras-chave para mapeamento inteligente de colunas CSV.
 */
const COLUMN_KEYWORDS = {
  date: ['data', 'date', 'dt', 'vencimento'],
  description: ['descrição', 'description', 'histórico', 'history', 'detalhes', 'details', 'item'],
  amount: ['valor', 'amount', 'valor (r$)', 'quantia', 'total', 'lançamento', 'valor b6']
};

export const CSVService = {
  /**
   * Processa o texto CSV e retorna transações brutas, identificando colunas dinamicamente.
   */
  parse: (text: string): RawCSVTransaction[] => {
    const rows = text.split('\n')
      .map(r => r.trim())
      .filter(r => r.length > 0);

    if (rows.length === 0) return [];

    // 1. Detectar Separador e Cabeçalho
    const firstRow = rows[0];
    const separator = firstRow.includes(';') ? ';' : ',';
    const headerCells = firstRow.split(separator).map(c => c.toLowerCase().trim());

    // 2. Determinar Índices das Colunas
    let dateIdx = 0;
    let descIdx = 1;
    let amountIdx = 2;

    const foundDate = headerCells.findIndex(cell => COLUMN_KEYWORDS.date.some(k => cell.includes(k)));
    const foundDesc = headerCells.findIndex(cell => COLUMN_KEYWORDS.description.some(k => cell.includes(k)));
    const foundAmount = headerCells.findIndex(cell => COLUMN_KEYWORDS.amount.some(k => cell.includes(k)));

    // Se encontramos pelo menos um cabeçalho válido, usamos o mapeamento dinâmico
    const hasHeader = foundDate !== -1 || foundDesc !== -1 || foundAmount !== -1;
    
    if (hasHeader) {
      if (foundDate !== -1) dateIdx = foundDate;
      if (foundDesc !== -1) descIdx = foundDesc;
      if (foundAmount !== -1) amountIdx = foundAmount;
    }

    const dataRows = hasHeader ? rows.slice(1) : rows;

    return dataRows.map(row => {
      const cols = row.split(separator).map(c => c.trim());
      
      const dateRaw = cols[dateIdx] || '';
      const descRaw = cols[descIdx] || 'Sem descrição';
      const amountRaw = cols[amountIdx] || '0';

      // Normalização de Valor
      const cleanAmount = amountRaw
        .replace(/[R$\s]/g, '')
        .replace(/\.(?=[0-9]{3},[0-9]{2})/g, '') // Remove ponto de milhar se seguir padrão BR (1.200,50)
        .replace(',', '.');
      
      const normalizedAmount = Math.abs(parseFloat(cleanAmount));

      // Normalização de Data (Suporta DD/MM/YYYY e ISO)
      let isoDate = '';
      if (dateRaw.includes('/')) {
        const parts = dateRaw.split('/');
        if (parts.length === 3) {
          const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
          isoDate = `${year}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
      } else {
        // Tenta capturar apenas a parte da data se for ISO com tempo (YYYY-MM-DD...)
        isoDate = dateRaw.split('T')[0];
      }

      return {
        date: isoDate || new Date().toISOString().split('T')[0],
        description: descRaw,
        amount: isNaN(normalizedAmount) ? 0 : roundToTwo(normalizedAmount),
      };
    });
  }
};
