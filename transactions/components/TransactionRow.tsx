import React, { useState } from 'react';
import { Transaction, Category, Subcategory } from '../../types/finance';
import { Check, CheckCircle2, Sparkles, User, Repeat, XCircle } from 'lucide-react';
import { CategorySelector } from './CategorySelector';
import { SubcategorySelector } from './SubcategorySelector';
import { CurrencyInput } from './CurrencyInput';
import { ConfirmationDialog } from './ConfirmationDialog';
import { TransactionMenu } from './TransactionMenu';
import { formatCurrency } from '../../shared/formatUtils';
import { ScopeDomainService } from '../../services/scopeDomainService';

interface TransactionRowProps {
  tx: Transaction;
  categories: Category[];
  subcategories: Subcategory[];
  isShared: boolean;
  currentScopeId: string;
  onUpdate: (id: string, updates: Partial<Transaction>) => void;
  onConfirm: (id: string, isRecurring: boolean) => void;
  onDelete: (id: string) => void;
  onMoveToIndividual: (id: string, userId: 'A' | 'B') => void;
  onRevertToShared: (id: string) => void;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
}

export const TransactionRow: React.FC<TransactionRowProps> = ({
  tx, categories, subcategories, isShared, currentScopeId,
  onUpdate, onConfirm, onDelete, onMoveToIndividual, onRevertToShared,
  isMenuOpen, onToggleMenu
}) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);

  const hasCategory = !!tx.categoryId;
  const hasSubcategory = !!tx.subcategoryId;
  const hasClassification = hasCategory && hasSubcategory;
  
  const shareSum = (tx.payerShare?.A || 0) + (tx.payerShare?.B || 0);
  const isShareValid = !isShared || Math.abs(shareSum - tx.amount) < 0.01;
  const canConfirm = hasClassification && isShareValid;
  
  const isAutoConfirmed = tx.isConfirmed && tx.isAutoConfirmed;
  const isMigrated = !!tx.migratedFromShared;
  const isInIndividualScope = tx.scopeId !== currentScopeId;
  const userId = ScopeDomainService.getUserIdFromChildScope(tx.scopeId);

  const handleEdit = () => {
    onUpdate(tx.id, { isConfirmed: false });
    onToggleMenu(); // Close menu after action
  };

  const validationMessage = (
    <span className="text-[10px] text-red-500 font-medium italic flex items-center gap-1 leading-none mt-1">
      <XCircle size={10} /> Não classificado
    </span>
  );

  return (
    <tr className={`${!tx.isConfirmed ? 'bg-amber-50/10' : ''} hover:bg-gray-50/80 transition-colors relative`}>
      <td className={`px-6 py-4 text-sm text-gray-600 font-medium ${isMigrated ? 'opacity-40 grayscale' : ''}`}>
        {new Date(tx.date).toLocaleDateString('pt-BR')}
      </td>
      <td className="px-6 py-4">
        <div className={`flex flex-col ${isMigrated ? 'opacity-40 grayscale' : ''}`}>
          <span className="text-sm font-bold text-gray-600">{tx.description}</span>
          {isMigrated && (
            <span className="text-[10px] text-gray-500 font-bold flex items-center gap-1 mt-1 whitespace-nowrap">
              <User size={10} /> Movida para conta individual de {userId}
            </span>
          )}
          {tx.isRecurring && (
            <span className="text-[10px] text-indigo-500 font-bold flex items-center gap-1 mt-0.5">
              <Repeat size={10} /> Recorrente
            </span>
          )}
        </div>
      </td>
      <td className={`px-6 py-4 text-sm font-bold text-gray-600 whitespace-nowrap ${isMigrated ? 'opacity-40 grayscale' : ''}`}>
        {formatCurrency(tx.amount)}
      </td>
      {isShared && (
        <>
          <td className="px-6 py-4">
            <CurrencyInput 
              value={tx.payerShare?.A || 0}
              disabled={tx.isConfirmed || isMigrated}
              isValid={isShareValid}
              onChange={(val) => onUpdate(tx.id, { payerShare: { ...tx.payerShare!, A: val } })}
            />
          </td>
          <td className="px-6 py-4">
            <CurrencyInput 
              value={tx.payerShare?.B || 0}
              disabled={tx.isConfirmed || isMigrated}
              isValid={isShareValid}
              onChange={(val) => onUpdate(tx.id, { payerShare: { ...tx.payerShare!, B: val } })}
            />
          </td>
        </>
      )}
      <td className="px-6 py-4">
        <div className={`flex flex-col gap-1.5 ${isMigrated ? 'opacity-40 grayscale' : ''}`}>
          <CategorySelector 
            categories={categories} 
            value={tx.categoryId} 
            disabled={tx.isConfirmed || isMigrated}
            onChange={(val) => onUpdate(tx.id, { categoryId: val, subcategoryId: undefined })}
          />
          <div className="flex flex-col gap-0.5">
            {isAutoConfirmed && <span className="text-[10px] text-emerald-600 font-medium italic flex items-center gap-1 leading-none"><CheckCircle2 size={10} /> Confirmado automaticamente</span>}
            {tx.isSuggested && !tx.isConfirmed && <span className="text-[10px] text-amber-500 font-medium italic flex items-center gap-1 leading-none"><Sparkles size={10} /> Sugerido</span>}
            {!hasCategory && !tx.isConfirmed && validationMessage}
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className={`flex flex-col gap-1.5 ${isMigrated ? 'opacity-40 grayscale' : ''}`}>
          <SubcategorySelector 
            subcategories={subcategories}
            categoryId={tx.categoryId}
            value={tx.subcategoryId || ''}
            disabled={tx.isConfirmed || isMigrated}
            onChange={(val) => onUpdate(tx.id, { subcategoryId: val })}
          />
          {hasCategory && !hasSubcategory && !tx.isConfirmed && validationMessage}
        </div>
      </td>
      <td className={`px-6 py-4 ${isMigrated ? 'opacity-40 grayscale' : ''}`}>
        <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase tracking-tight ${
          tx.classificationStatus === 'auto' ? 'bg-gray-100 text-gray-500' : 
          tx.classificationStatus === 'manual' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'
        }`}>
          {tx.classificationStatus}
        </span>
      </td>
      <td className="px-6 py-4 text-center">
        <div className="flex items-center justify-center gap-2">
          {!tx.isConfirmed && !isMigrated ? (
            <div className="relative group/btn">
              <ConfirmationDialog 
                isVisible={isConfirming} 
                isRecurring={isRecurring}
                onToggleRecurring={setIsRecurring}
                onConfirm={() => { onConfirm(tx.id, isRecurring); setIsConfirming(false); }}
                onCancel={() => setIsConfirming(false)}
              />
              <button
                onClick={() => { if(canConfirm) setIsConfirming(true); }}
                disabled={!canConfirm}
                className={`p-2 rounded-lg transition-all ${canConfirm ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 shadow-sm' : 'bg-gray-50 text-gray-300 cursor-not-allowed'}`}
              >
                <Check size={18} />
              </button>
            </div>
          ) : (
            <div className={`p-2 ${tx.isConfirmed ? 'text-emerald-500' : 'text-gray-300'}`}><CheckCircle2 size={18} /></div>
          )}

          <TransactionMenu 
            isOpen={isMenuOpen}
            isShared={isShared}
            isInIndividualScope={isInIndividualScope}
            isConfirmed={tx.isConfirmed}
            onToggle={onToggleMenu}
            onEdit={handleEdit}
            onMoveToIndividual={(userId) => onMoveToIndividual(tx.id, userId)}
            onRevertToShared={() => onRevertToShared(tx.id)}
            onDelete={() => onDelete(tx.id)}
          />
        </div>
      </td>
    </tr>
  );
};