
import React from 'react';
import { Subcategory } from '../../types/finance';

interface SubcategorySelectorProps {
  subcategories: Subcategory[];
  categoryId?: string;
  value?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

export const SubcategorySelector: React.FC<SubcategorySelectorProps> = ({ subcategories, categoryId, value, disabled, onChange }) => {
  const filteredSubs = subcategories.filter(s => s.categoryId === categoryId);
  
  return (
    <select
      disabled={disabled || !categoryId}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className={`p-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none w-full max-w-[160px] ${disabled || !categoryId ? 'opacity-60 bg-gray-50 cursor-not-allowed' : ''}`}
    >
      <option value="">Selecionar...</option>
      {filteredSubs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
    </select>
  );
};
