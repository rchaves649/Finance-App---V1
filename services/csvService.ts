
import { Transaction } from '../types';

export interface RawCSVTransaction {
  date: string;
  description: string;
  amount: number;
}

export const CSVService = {
  parse: (text: string): RawCSVTransaction[] => {
    const rows = text.split('\n').filter(r => r.trim());
    if (rows.length === 0) return [];

    // Tenta detectar se a primeira linha é um cabeçalho
    const firstRow = rows[0].split(/[,;]/);
    const isHeader = firstRow.some(cell => 
      ['data', 'date', 'descrição', 'description', 'valor', 'amount', 'valor (r$)'].includes(cell.toLowerCase().trim())
    );

    const dataRows = isHeader ? rows.slice(1) : rows;

    return dataRows.map(row => {
      const cols = row.split(/[,;]/);
      
      let dateRaw = cols[0]?.trim();
      const descRaw = cols[1]?.trim() || 'Sem descrição';
      const amountRaw = cols[2]?.trim() || '0';

      // Normalização de Valor: Remove "R$", espaços, e converte vírgula decimal para ponto
      const cleanAmount = amountRaw
        .replace(/[R$\s]/g, '')
        .replace('.', '') // Remove pontos de milhar se existirem (ex: 1.200,50)
        .replace(',', '.');
      
      const normalizedAmount = Math.abs(parseFloat(cleanAmount));

      // Normalização de Data (Suporta DD/MM/YYYY e ISO)
      let isoDate = dateRaw;
      if (dateRaw && dateRaw.includes('/')) {
        const parts = dateRaw.split('/');
        if (parts.length === 3) {
          // Garante que o ano tenha 4 dígitos (assume 20xx para 2 dígitos)
          const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
          isoDate = `${year}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
      }

      return {
        date: isoDate || new Date().toISOString().split('T')[0],
        description: descRaw,
        amount: isNaN(normalizedAmount) ? 0 : normalizedAmount,
      };
    });
  }
};
