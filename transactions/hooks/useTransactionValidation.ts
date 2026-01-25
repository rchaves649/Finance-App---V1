
import { useMemo } from 'react';
import { Transaction, TransactionNatures } from '../../types/finance';

export const useTransactionValidation = (tx: Transaction, isShared: boolean) => {
  const stats = useMemo(() => {
    const isExcluded = tx.transactionNature === TransactionNatures.REFUND || 
                      tx.transactionNature === TransactionNatures.PAYMENT;
    
    const hasCategory = !!tx.categoryId;
    const hasSubcategory = !!tx.subcategoryId;
    const hasClassification = hasCategory && hasSubcategory;
    
    const shareSum = (tx.payerShare?.A || 0) + (tx.payerShare?.B || 0);
    const isShareValid = !isShared || Math.abs(shareSum - tx.amount) < 0.01;
    
    const canConfirm = (hasClassification || isExcluded) && isShareValid;
    const isAutoConfirmed = tx.isConfirmed && tx.isAutoConfirmed;

    return {
      isExcluded,
      hasCategory,
      hasSubcategory,
      hasClassification,
      isShareValid,
      canConfirm,
      isAutoConfirmed
    };
  }, [tx, isShared]);

  return stats;
};
