
/**
 * Serviço de Domínio para regras de negócio relacionadas a Escopos.
 * Centraliza a lógica de identificadores e hierarquias para evitar espalhamento de strings.
 */
export const ScopeDomainService = {
  /**
   * Extrai o identificador do usuário (A ou B) a partir de um ID de escopo filho.
   * Padrão atual: "{parentScopeId}-{userId}"
   */
  getUserIdFromChildScope: (scopeId: string): 'A' | 'B' => {
    return scopeId.endsWith('-A') ? 'A' : 'B';
  },

  /**
   * Cria um identificador de escopo individual (filho) a partir de um escopo compartilhado (pai).
   */
  createChildScopeId: (parentScopeId: string, userId: 'A' | 'B'): string => {
    return `${parentScopeId}-${userId}`;
  },

  /**
   * Verifica se um escopo é filho de outro (ex: conta individual vinculada a uma conjunta).
   */
  isChildOf: (childScopeId: string, parentScopeId: string): boolean => {
    return childScopeId.startsWith(parentScopeId) && childScopeId !== parentScopeId;
  }
};
