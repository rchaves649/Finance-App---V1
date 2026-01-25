import React from 'react';
import { Subcategory } from '../../types/finance';

interface SubcategorySelectorProps {
  subcategories: Subcategory[];
  categoryId?: string;
  value?: string;
  disabled?: boolean;
  hasError?: boolean;
  onChange: (value: string) => void;
}

export const SubcategorySelector: React.FC<SubcategorySelectorProps> = ({ subcategories, categoryId, value, disabled, hasError, onChange }) => {
  const filteredSubs = subcategories.filter(s => s.categoryId === categoryId);
  
  return (
    <select
      disabled={disabled || !categoryId}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className={`p-1.5 border rounded-lg text-[11px] bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 shadow-sm outline-none w-full transition-all ${
        hasError ? 'border-red-300 bg-red-50 focus:ring-red-200' : 'border-gray-200 hover:border-indigo-200'
      } ${disabled || !categoryId ? 'opacity-60 bg-gray-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <option value="" className="text-gray-900 bg-white">Selecionar...</option>
      {filteredSubs.map(s => (
        <option key={s.id} value={s.id} className="text-gray-900 bg-white">
          {s.name}
        </option>
      ))}
    </select>
  );
};