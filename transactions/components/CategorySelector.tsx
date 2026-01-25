import React from 'react';
import { Category } from '../../types/finance';

interface CategorySelectorProps {
  categories: Category[];
  value?: string;
  disabled?: boolean;
  hasError?: boolean;
  onChange: (value: string) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({ categories, value, disabled, hasError, onChange }) => (
  <select
    disabled={disabled}
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
    className={`p-1.5 border rounded-lg text-[11px] bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 shadow-sm outline-none w-full transition-all ${
      hasError ? 'border-red-300 bg-red-50 focus:ring-red-200' : 'border-gray-200 hover:border-indigo-200'
    } ${disabled ? 'opacity-60 bg-gray-50 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    <option value="" className="text-gray-900 bg-white">Selecionar...</option>
    {categories.map(c => (
      <option key={c.id} value={c.id} className="text-gray-900 bg-white">
        {c.name}
      </option>
    ))}
  </select>
);