import { TimeSeriesEntry, CategorySummary } from '../types/finance';

/**
 * DashboardService: Centraliza as transformações de dados específicas para componentes de visualização.
 * Mantém o DashboardContainer focado apenas na orquestração de dados brutos.
 */
export const DashboardService = {
  /**
   * Extrai o detalhamento de categorias para um mês específico a partir de uma série temporal.
   * Utilizado para a funcionalidade de "Linked Charts" (Gráfico de Evolução -> Gráfico de Categorias).
   */
  getCategoryBreakdownForMonth: (
    monthlyEvolution: TimeSeriesEntry[],
    monthKey: string | null,
    defaultSummaries: CategorySummary[]
  ): CategorySummary[] => {
    // Se não há filtro de mês, retorna os dados agregados do período atual
    if (!monthKey) return defaultSummaries;
    
    // Localiza a entrada correspondente ao mês focado na evolução histórica
    const monthEntry = monthlyEvolution.find(e => e.bucketKey === monthKey);
    if (!monthEntry) return defaultSummaries;

    // Converte as chaves dinâmicas (Categorias) do TimeSeriesEntry em um array de CategorySummary
    // Ignora metadados do Recharts (bucketKey, label, total) e subcategorias (::)
    return Object.keys(monthEntry)
      .filter(key => !['bucketKey', 'label', 'total'].includes(key) && !key.includes('::'))
      .map(catName => ({
        name: catName,
        value: Number(monthEntry[catName]) || 0,
        subcategories: [] 
      }))
      .filter(c => c.value > 0.01) // Purge de valores irrelevantes
      .sort((a, b) => b.value - a.value);
  }
};