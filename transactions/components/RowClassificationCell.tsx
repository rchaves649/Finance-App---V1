
import React, { memo } from 'react';
import { Transaction, Category, Subcategory } from '../../types/finance';
import { CategorySelector } from './CategorySelector';
import { SubcategorySelector } from './SubcategorySelector';

interface RowClassificationCellProps {
  tx: Transaction;
  categories: Category[];
  subcategories: Subcategory[];
  isMigrated: boolean;
  isExcluded: boolean;
  onUpdate: (id: string, updates: Partial<Transaction>) => void;
  cat?: Category;
  sub?: Subcategory;
}

export const RowClassificationCell: React.FC<RowClassificationCellProps> = memo(({ 
  tx, categories, subcategories, isMigrated, isExcluded, onUpdate, cat, sub 
}) => (
  <>
    <td className="px-4 py-3 min-w-[115px]">
      <div className={`flex flex-col gap-0.5 ${isMigrated || (isExcluded && tx.isConfirmed) ? 'opacity-40 grayscale' : ''}`}>
        {tx.isConfirmed ? (
           <div className="flex flex-col items-start">
             {cat ? (
                <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded uppercase truncate max-w-full">{cat.name}</span>
             ) : (
                <span className="text-[9px] text-amber-600 font-bold uppercase bg-amber-100 px-1.5 py-0.5 rounded-md">Pendente</span>
             )}
           </div>
        ) : (
          <CategorySelector 
            categories={categories} 
            value={tx.categoryId} 
            disabled={isMigrated}
            onChange={(val: string) => onUpdate(tx.id, { categoryId: val, subcategoryId: undefined })}
          />
        )}
      </div>
    </td>
    <td className="px-4 py-3 min-w-[110px]">
      <div className={`flex flex-col gap-0.5 ${isMigrated || (isExcluded && tx.isConfirmed) ? 'opacity-40 grayscale' : ''}`}>
        {tx.isConfirmed ? (
          <span className="text-[8px] text-gray-400 font-medium uppercase truncate max-w-full">{sub?.name || (cat ? 'Outros' : '')}</span>
        ) : (
          <SubcategorySelector 
            subcategories={subcategories}
            categoryId={tx.categoryId}
            value={tx.subcategoryId || ''}
            disabled={isMigrated || !tx.categoryId}
            onChange={(val: string) => onUpdate(tx.id, { subcategoryId: val })}
          />
        )}
      </div>
    </td>
  </>
));
