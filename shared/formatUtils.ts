/**
 * Implementa o Arredondamento Bancário (Half to Even).
 * Reduz o viés estatístico em grandes volumes de dados ao arredondar .5 para o número par mais próximo.
 */
export function bankersRound(value: number): number {
  const f = Math.pow(10, 2);
  const n = +(value * f).toFixed(8); // Precisão para evitar erros de ponto flutuante
  const i = Math.floor(n);
  const d = n - i;
  const half = 0.5;
  const eps = 1e-9;

  if (Math.abs(d - half) < eps) {
    return (i % 2 === 0 ? i : i + 1) / f;
  }
  return Math.round(n) / f;
}

/**
 * Rounds a number to exactly 2 decimal places using toFixed(2).
 */
export function roundToTwo(value: number): number {
  return Number(Math.round(value * 100) / 100);
}

/**
 * Converts a decimal value (e.g. 10.50) to integer cents (e.g. 1050).
 */
export function toCents(value: number): number {
  return Math.round(value * 100);
}

/**
 * Converts integer cents back to a decimal value.
 */
export function fromCents(cents: number): number {
  return cents / 100;
}

/**
 * Divide um valor total em centavos entre duas partes baseado em uma porcentagem,
 * garantindo que a soma das partes seja rigorosamente igual ao total (sem perda de 1 centavo).
 */
export function allocateCents(totalCents: number, pctA: number): { centsA: number; centsB: number } {
  // Usamos round para a primeira parte
  const centsA = Math.round((totalCents * pctA) / 100);
  // A segunda parte é OBRIGATORIAMENTE o restante para garantir integridade
  const centsB = totalCents - centsA;
  return { centsA, centsB };
}

/**
 * Formata um número como Real Brasileiro (R$).
 */
export function formatCurrency(value: number): string {
  const rounded = roundToTwo(value);
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rounded);
}

/**
 * Analisa uma string para número, lidando com formatação brasileira e internacional.
 */
export function parseCurrency(value: string): number {
  if (!value) return 0;
  
  let clean = value.replace(/[R$\s]/g, '').trim();
  
  if (clean.startsWith('(') && clean.endsWith(')')) {
    clean = '-' + clean.substring(1, clean.length - 1);
  }
  
  if (clean.endsWith('-')) {
    clean = '-' + clean.substring(0, clean.length - 1);
  }

  if (clean.includes('.') && clean.includes(',')) {
    const lastDot = clean.lastIndexOf('.');
    const lastComma = clean.lastIndexOf(',');
    if (lastComma > lastDot) {
      clean = clean.replace(/\./g, '').replace(',', '.');
    } else {
      clean = clean.replace(/,/g, '');
    }
  } else if (clean.includes(',')) {
    const parts = clean.split(',');
    if (parts[parts.length - 1].length <= 2) {
      clean = clean.replace(',', '.');
    } else {
      clean = clean.replace(',', '');
    }
  }
  
  const parsed = parseFloat(clean);
  return isNaN(parsed) ? 0 : roundToTwo(parsed);
}
