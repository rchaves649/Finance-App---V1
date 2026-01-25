import { useState, useEffect, useCallback } from 'react';
import { Scope, Period } from '../../types/finance';

/**
 * useDashboardState: Hook customizado para gerenciar os estados de interação do usuário
 * com os gráficos e painéis do Dashboard.
 */
export const useDashboardState = (currentScope: Scope, period: Period) => {
  // Estado para os gráficos vinculados: Evolução por Categoria e Visão Geral (Detalhamento)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Estado INDEPENDENTE para o gráfico horizontal "Categorias em..."
  const [horizontalSelectedCategory, setHorizontalSelectedCategory] = useState<string | null>(null);
  
  // Vínculo entre o clique na Evolução Mensal e o filtro de categorias
  const [focusedMonthKey, setFocusedMonthKey] = useState<string | null>(null);

  // Estado de expansão do painel de Insights
  const [isInsightExpanded, setIsInsightExpanded] = useState(false);

  // Resetar seleções e estados ao trocar de escopo ou período (Zero Regressão de Filtros)
  useEffect(() => {
    setSelectedCategory(null);
    setHorizontalSelectedCategory(null);
    setFocusedMonthKey(null);
    setIsInsightExpanded(false);
  }, [currentScope.scopeId, period]);

  const toggleInsight = useCallback(() => {
    setIsInsightExpanded(prev => !prev);
  }, []);

  const handleSelectCategory = useCallback((category: string) => {
    setSelectedCategory(prev => prev === category ? null : category);
  }, []);

  const handleSelectHorizontalCategory = useCallback((category: string) => {
    setHorizontalSelectedCategory(prev => prev === category ? null : category);
  }, []);

  const handleSelectMonth = useCallback((bucketKey: string) => {
    // Alterna a seleção: se clicar no mesmo mês, limpa o filtro
    setFocusedMonthKey(prev => prev === bucketKey ? null : bucketKey);
  }, []);

  return {
    selectedCategory,
    horizontalSelectedCategory,
    focusedMonthKey,
    isInsightExpanded,
    toggleInsight,
    handleSelectCategory,
    handleSelectHorizontalCategory,
    handleSelectMonth
  };
};