
import { RawCSVTransaction } from '../types/finance';
import { roundToTwo, parseCurrency } from '../shared/formatUtils';

const COLUMN_KEYWORDS = {
  date: ['data', 'date', 'dt', 'vencimento', 'ocorrencia', 'dia', 'transacao', 'movimentacao'],
  description: [
    'descricao', 'description', 'historico', 'history', 'detalhes', 'details', 
    'item', 'estabelecimento', 'informacao', 'complemento', 'texto', 'narrativa', 
    'nome', 'estabelecimento/cidade', 'lancamento', 'memo', 'estabelecimento', 'compras'
  ],
  amount: [
    'valor', 'amount', 'quantia', 'total', 'lancamento', 
    'saldo', 'movimentacao', 'debito', 'credito', 'importancia', 'montante', 'valor (r$)', 'valor(r$)', 'valor_total'
  ],
  externalId: ['id', 'identificador', 'transactionid', 'txid', 'referencia', 'nsu', 'autenticacao', 'id transacao', 'external_id']
};

function normalizeHeader(text: string): string {
  if (!text) return '';
  return text.toLowerCase().trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function splitCSVLine(line: string, separator: string): string[] {
  const result: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === separator && !inQuotes) {
      result.push(currentField.trim());
      currentField = '';
    } else {
      currentField += char;
    }
  }
  result.push(currentField.trim());
  return result;
}

export const CSVService = {
  parse: (text: string): RawCSVTransaction[] => {
    const cleanText = text.replace(/^\uFEFF/, '').trim();
    const rows = cleanText.split(/\r?\n/).map(r => r.trim()).filter(r => r.length > 0);
    if (rows.length < 1) return [];

    // 1. Detecta o separador mais provável
    const separators = [';', ',', '\t'];
    let separator = ',';
    let maxColsFound = 0;
    separators.forEach(s => {
      const count = splitCSVLine(rows[0], s).length;
      if (count > maxColsFound) {
        maxColsFound = count;
        separator = s;
      }
    });

    let headerRowIdx = -1;
    let bestIndices = { date: -1, desc: -1, amount: -1, externalId: -1 };
    let maxConfidence = -1;

    // 2. Busca o cabeçalho percorrendo as primeiras 20 linhas
    for (let i = 0; i < Math.min(rows.length, 20); i++) {
      const cells = splitCSVLine(rows[i], separator).map(normalizeHeader);
      let foundDate = -1;
      let foundDesc = -1;
      let foundAmount = -1;
      let foundId = -1;
      let confidence = 0;

      cells.forEach((cell, idx) => {
        if (!cell) return;
        
        // Verifica Date
        if (foundDate === -1 && COLUMN_KEYWORDS.date.some(k => cell.includes(normalizeHeader(k)))) {
          foundDate = idx;
          confidence += 10;
        }
        // Verifica Amount
        if (foundAmount === -1 && COLUMN_KEYWORDS.amount.some(k => cell.includes(normalizeHeader(k)))) {
          foundAmount = idx;
          confidence += 10;
        }
        // Verifica Description (Histórico/Estabelecimento)
        if (foundDesc === -1 && COLUMN_KEYWORDS.description.some(k => cell.includes(normalizeHeader(k)))) {
          foundDesc = idx;
          confidence += 8;
        }
        // Verifica External ID
        if (foundId === -1 && COLUMN_KEYWORDS.externalId.some(k => cell.includes(normalizeHeader(k)))) {
          foundId = idx;
          confidence += 5;
        }
      });

      // Validação rápida: Se achamos data e valor, é um forte candidato
      if (foundDate !== -1 && foundAmount !== -1) {
        // Se a descrição ainda está vazia, tentamos achar a coluna com mais texto na linha de dados
        if (foundDesc === -1 && i + 1 < rows.length) {
          const nextCells = splitCSVLine(rows[i+1], separator);
          let longestIdx = -1;
          let maxLen = 0;
          nextCells.forEach((c, idx) => {
             if (idx !== foundDate && idx !== foundAmount && c.length > maxLen) {
               maxLen = c.length;
               longestIdx = idx;
             }
          });
          if (longestIdx !== -1) {
            foundDesc = longestIdx;
            confidence += 5;
          }
        }
      }

      if (confidence > maxConfidence && foundDate !== -1 && foundAmount !== -1) {
        maxConfidence = confidence;
        headerRowIdx = i;
        bestIndices = { date: foundDate, desc: foundDesc, amount: foundAmount, externalId: foundId };
      }
    }

    // Fallback agressivo se não encontrar nada com confiança
    if (headerRowIdx === -1) {
      // Tenta assumir que a primeira linha de dados é o índice 0=data, 1=valor, 2=desc ou vice-versa
      // Mas para muitos bancos brasileiros (ex Nubank), o padrão é Data, Valor, ID, Descrição
      bestIndices = { date: 0, amount: 1, desc: 3, externalId: 2 };
      headerRowIdx = -1; // Começa da linha 0
    }

    const dataRows = rows.slice(headerRowIdx + 1);

    return dataRows.map((row) => {
      const cols = splitCSVLine(row, separator);
      
      const dateRaw = cols[bestIndices.date] || '';
      const amountRaw = cols[bestIndices.amount] || '0';
      const descRaw = bestIndices.desc !== -1 ? (cols[bestIndices.desc] || '') : '';
      const idRaw = bestIndices.externalId !== -1 ? cols[bestIndices.externalId] : undefined;

      const parsedAmount = parseCurrency(amountRaw);

      // Tratamento de Data robusto
      let isoDate = '';
      const dateMatch = dateRaw.match(/(\d{1,4})[/-](\d{1,2})[/-](\d{1,4})/);
      if (dateMatch) {
        let [_, v1, v2, v3] = dateMatch;
        if (v1.length === 4) {
          isoDate = `${v1}-${v2.padStart(2, '0')}-${v3.padStart(2, '0')}`;
        } else {
          const year = v3.length === 2 ? `20${v3}` : v3;
          isoDate = `${year}-${v2.padStart(2, '0')}-${v1.padStart(2, '0')}`;
        }
      }

      // Se não encontrou descrição mas temos ID, usamos ID como fallback parcial ou vice-versa
      let finalDesc = descRaw.replace(/^"(.*)"$/, '$1').trim();
      if (!finalDesc && idRaw) finalDesc = idRaw;
      if (!finalDesc) finalDesc = 'Lançamento sem nome';

      return {
        date: isoDate || new Date().toISOString().split('T')[0],
        description: finalDesc,
        amount: isNaN(parsedAmount) ? 0 : roundToTwo(parsedAmount),
        externalId: idRaw?.trim()
      };
    }).filter(tx => tx.amount !== 0 || tx.description !== 'Lançamento sem nome');
  }
};
