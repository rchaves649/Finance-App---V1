
import React from 'react';
import { Category } from '../../types/finance';

interface CategorySelectorProps {
  categories: Category[];
  value?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({ categories, value, disabled, onChange }) => (
  <select
    disabled={disabled}
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
    className={`p-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none w-full max-w-[160px] ${disabled ? 'opacity-60 bg-gray-50 cursor-not-allowed' : ''}`}
  >
    <option value="">Selecionar...</option>
    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
  </select>
);
