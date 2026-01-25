import { Transaction, TransactionNatures } from '../types/finance';
import { TransactionRepository, CategoryRepository, SubcategoryRepository } from './localRepositories';
import { toCents, fromCents, allocateCents } from '../shared/formatUtils';
import { ScopeDomainService } from './scopeDomainService';
import { DefaultSeedService } from './defaultSeedService';

export const TransactionMigrationService = {
  /**
   * Move uma transação do escopo conjunto para o individual de um usuário.
   * Implementa rastreabilidade para evitar duplicidade e manter histórico.
   */
  moveToIndividual: (tx: Transaction, userId: 'A' | 'B', sharedScopeId: string): void => {
    const targetScopeId = ScopeDomainService.createChildScopeId(sharedScopeId, userId);
    DefaultSeedService.ensureDefaults(targetScopeId);

    const sourceCats = CategoryRepository.getAll(tx.scopeId);
    const sourceSubs = SubcategoryRepository.getAll(tx.scopeId);
    const targetCats = CategoryRepository.getAll(targetScopeId);
    const targetSubs = SubcategoryRepository.getAll(targetScopeId);

    const sourceCat = sourceCats.find(c => c.id === tx.categoryId);
    const sourceSub = sourceSubs.find(s => s.id === tx.subcategoryId);

    let targetCatId = undefined;
    let targetSubId = undefined;

    if (sourceCat) {
      const matchCat = targetCats.find(c => c.name === sourceCat.name);
      if (matchCat) {
        targetCatId = matchCat.id;
        if (sourceSub) {
          const matchSub = targetSubs.find(s => s.categoryId === matchCat.id && s.name === sourceSub.name);
          if (matchSub) targetSubId = matchSub.id;
        }
      }
    }

    // Criação da transação individual com metadados de auditoria
    const updated: Transaction = { 
      ...tx,
      scopeId: targetScopeId,
      categoryId: targetCatId,
      subcategoryId: targetSubId,
      migratedFromShared: sharedScopeId,
      visibleInShared: true,
      isConfirmed: false,
      // Metadado de Rastreabilidade (Audit Log)
      auditTrail: {
        originId: tx.id,
        migratedAt: new Date().toISOString(),
        previousScopeId: tx.scopeId
      }
    };
    
    // Remove payerShare pois agora é 100% individual
    delete updated.payerShare;
    
    TransactionRepository.save(updated);
  },

  /**
   * Reverte uma transação migrada de volta para o escopo compartilhado.
   */
  revertToShared: (tx: Transaction, sharedScopeId: string, defaultSplit?: {A: number, B: number}): void => {
    if (!tx.migratedFromShared) return;
    DefaultSeedService.ensureDefaults(sharedScopeId);

    const targetCats = CategoryRepository.getAll(sharedScopeId);
    const targetSubs = SubcategoryRepository.getAll(sharedScopeId);

    const sourceCat = CategoryRepository.getAll(tx.scopeId).find(c => c.id === tx.categoryId);
    const sourceSub = SubcategoryRepository.getAll(tx.scopeId).find(s => s.id === tx.subcategoryId);

    let targetCatId = undefined;
    let targetSubId = undefined;

    if (sourceCat) {
      const matchCat = targetCats.find(c => c.name === sourceCat.name);
      if (matchCat) {
        targetCatId = matchCat.id;
        if (sourceSub) {
          const matchSub = targetSubs.find(s => s.categoryId === matchCat.id && s.name === sourceSub.name);
          if (matchSub) targetSubId = matchSub.id;
        }
      }
    }

    const updated: Transaction = {
      ...tx,
      scopeId: sharedScopeId,
      categoryId: targetCatId,
      subcategoryId: targetSubId,
      migratedFromShared: undefined,
      visibleInShared: undefined,
      isConfirmed: false,
      auditTrail: undefined // Limpa rastro de migração ao voltar à origem
    };
    
    // Restaura a divisão de custos usando a nova lógica de alocação segura
    const totalCents = toCents(updated.amount);
    const splitA = defaultSplit?.A ?? 50;
    const { centsA, centsB } = allocateCents(totalCents, splitA);
    
    updated.payerShare = { A: fromCents(centsA), B: fromCents(centsB) };
    
    TransactionRepository.save(updated);
  }
};
