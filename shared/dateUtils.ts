
import { Period } from "../types/finance";

const MONTH_NAMES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
];

/**
 * Retorna a data de hoje no formato YYYY-MM-DD respeitando o fuso horário local.
 */
export function getTodayISO(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Normaliza uma data ou string para YYYY-MM-DD sem sofrer deslocamento de fuso horário.
 */
export function toISODate(input: Date | string): string {
  if (!input) return '';
  
  if (typeof input === 'string') {
    // Se já for formato ISO (YYYY-MM-DD), retorna apenas a parte da data
    const match = input.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) return `${match[1]}-${match[2]}-${match[3]}`;
    
    // Se for outro formato, tenta o parsing local
    const d = new Date(input);
    if (isNaN(d.getTime())) return '';
    input = d;
  }
  
  const year = input.getFullYear();
  const month = String(input.getMonth() + 1).padStart(2, '0');
  const day = String(input.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formata um ISO (YYYY-MM-DD) para exibição "mês de ano" (ex: "dezembro de 2025").
 * Usa manipulação direta de string para evitar bugs de fuso horário do objeto Date.
 */
export function formatMonthYear(dateISO: string): string {
  if (!dateISO) return '';
  const parts = dateISO.split('T')[0].split('-');
  const year = parts[0];
  const monthIdx = parseInt(parts[1], 10) - 1;
  
  if (isNaN(monthIdx) || monthIdx < 0 || monthIdx > 11) return '';
  
  return `${MONTH_NAMES[monthIdx]} de ${year}`;
}

/**
 * Converte a string do filtro (ex: "janeiro de 2026") de volta para componentes numéricos.
 */
export function parseMonthYearString(label: string): { month: number; year: number } | null {
  const parts = label.toLowerCase().split(' de ');
  if (parts.length !== 2) return null;
  
  const monthName = parts[0];
  const year = parseInt(parts[1], 10);
  const monthIdx = MONTH_NAMES.indexOf(monthName);
  
  if (monthIdx === -1 || isNaN(year)) return null;
  
  return { month: monthIdx + 1, year };
}

/**
 * Garante que o intervalo de datas tenha a menor data primeiro.
 */
export function clampRange(startISO: string, endISO: string): { startISO: string; endISO: string } {
  if (startISO > endISO) return { startISO: endISO, endISO: startISO };
  return { startISO, endISO };
}

/**
 * Verifica se uma data ISO está dentro do período selecionado.
 */
export function inPeriod(dateISO: string, period: Period): boolean {
  if (!dateISO) return false;
  const cleanDate = dateISO.split('T')[0];
  
  switch (period.kind) {
    case 'month': {
      const prefix = `${period.year}-${period.month.toString().padStart(2, '0')}`;
      return cleanDate.startsWith(prefix);
    }
    case 'year': {
      return cleanDate.startsWith(`${period.year}-`);
    }
    case 'range': {
      const { startISO, endISO } = clampRange(period.startISO, period.endISO);
      return cleanDate >= startISO && cleanDate <= endISO;
    }
    default:
      return false;
  }
}
