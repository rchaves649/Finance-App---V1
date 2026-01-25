
import React, { useState, memo, useCallback } from 'react';
import { Transaction, Category, Subcategory, TransactionNatures } from '../../types/finance';
import { RowInfoCell } from './RowInfoCell';
import { RowInputsCell } from './RowInputsCell';
import { RowClassificationCell } from './RowClassificationCell';
import { RowActionsCell } from './RowActionsCell';
import { RowNatureCell } from './RowNatureCell';
import { ScopeDomainService } from '../../services/scopeDomainService';
import { useTransactionValidation } from '../hooks/useTransactionValidation';

interface TransactionRowProps {
  tx: Transaction;
  categories: Category[];
  subcategories: Subcategory[];
  isShared: boolean;
  currentScopeId: string;
  onUpdate: (id: string, updates: Partial<Transaction>) => void;
  onConfirm: (id: string, options: { learnCategory: boolean; isRecurring: boolean }) => void;
  onDelete: (id: string) => void;
  onMoveToIndividual: (id: string, userId: 'A' | 'B') => void;
  onRevertToShared: (id: string) => void;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
}

export const TransactionRow: React.FC<TransactionRowProps> = memo(({
  tx, categories, subcategories, isShared, currentScopeId,
  onUpdate, onConfirm, onDelete, onMoveToIndividual, onRevertToShared,
  isMenuOpen, onToggleMenu
}) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [learnCategory, setLearnCategory] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);

  const {
    isExcluded,
    isShareValid,
    canConfirm
  } = useTransactionValidation(tx, isShared);
  
  const isMigrated = !!tx.migratedFromShared;
  const isInIndividualScope = tx.scopeId !== currentScopeId;
  const userId = ScopeDomainService.getUserIdFromChildScope(tx.scopeId);
  
  const isRefundedOrNeutralized = (tx.transactionNature === TransactionNatures.REFUND || tx.isNeutralized) && tx.isConfirmed;
  const isVisuallyExcluded = isExcluded || isRefundedOrNeutralized;

  const handleEdit = useCallback(() => {
    onUpdate(tx.id, { isConfirmed: false });
    onToggleMenu();
  }, [tx.id, onUpdate, onToggleMenu]);

  const cat = categories.find(c => c.id === tx.categoryId);
  const sub = subcategories.find(s => s.id === tx.subcategoryId);

  return (
    <tr className={`
      ${!tx.isConfirmed ? 'bg-amber-50/10' : ''} 
      ${isVisuallyExcluded && tx.isConfirmed ? 'bg-gray-50/40 opacity-60' : ''} 
      hover:bg-gray-50/80 transition-colors relative text-gray-600
    `}>
      {/* Informações Básicas (Data, Descrição, Valor Total) */}
      <RowInfoCell 
        tx={tx} 
        isMigrated={isMigrated} 
        isExcluded={isVisuallyExcluded} 
        userId={userId} 
      />
      
      {/* Inputs de Divisão (Valor A / Valor B) */}
      {isShared && (
        <RowInputsCell 
          tx={tx} 
          isMigrated={isMigrated} 
          isShareValid={isShareValid} 
          userId={userId}
          onUpdate={onUpdate} 
        />
      )}

      {/* Classificação (Categoria / Subcategoria) */}
      <RowClassificationCell 
        tx={tx} 
        categories={categories} 
        subcategories={subcategories} 
        isMigrated={isMigrated} 
        isExcluded={isVisuallyExcluded} 
        onUpdate={onUpdate} 
        cat={cat}
        sub={sub}
      />

      {/* Natureza da Transação (Badge ou Seletor) */}
      <RowNatureCell 
        tx={tx}
        isMigrated={isMigrated}
        isExcluded={isVisuallyExcluded}
        onUpdate={onUpdate}
      />

      {/* Status da Classificação (Pendente, Automático, Manual) */}
      <td className={`px-4 py-3 text-center min-w-[100px] ${isMigrated || (isVisuallyExcluded && tx.isConfirmed) ? 'opacity-40 grayscale' : ''}`}>
        <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-tight ${
          tx.classificationStatus === 'auto' ? 'bg-gray-100 text-gray-500' : 
          tx.classificationStatus === 'manual' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'
        }`}>
          {tx.classificationStatus === 'pending' ? 'Pendente' : tx.classificationStatus === 'auto' ? 'Automático' : 'Manual'}
        </span>
      </td>

      {/* Ações (Confirmar, Menu de Contexto) */}
      <RowActionsCell 
        tx={tx} 
        isMigrated={isMigrated} 
        canConfirm={canConfirm} 
        isConfirming={isConfirming}
        learnCategory={learnCategory}
        isRecurring={isRecurring}
        isMenuOpen={isMenuOpen}
        isShared={isShared}
        isInIndividualScope={isInIndividualScope}
        setIsConfirming={setIsConfirming}
        setLearnCategory={setLearnCategory}
        setIsRecurring={setIsRecurring}
        onConfirm={onConfirm}
        onToggleMenu={onToggleMenu}
        handleEdit={handleEdit}
        onMoveToIndividual={onMoveToIndividual}
        onRevertToShared={onRevertToShared}
        onDelete={onDelete}
        categoryName={cat?.name}
      />
    </tr>
  );
});
