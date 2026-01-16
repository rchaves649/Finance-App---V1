
export function normalizeDescription(description: string): string {
  return description
    .toUpperCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^\w\s]/gi, '') // Remove pontuação
    .replace(/\s+/g, ' '); // Colapsa espaços
}
