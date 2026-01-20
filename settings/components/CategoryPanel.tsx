
import React, { useState } from 'react';
import { Tag, Plus, Trash2 } from 'lucide-react';
import { Category } from '../../types/finance';

interface CategoryPanelProps {
  categories: Category[];
  onAddCategory: (name: string) => void;
  onDeleteCategory: (id: string) => void;
}

export const CategoryPanel: React.FC<CategoryPanelProps> = ({ 
  categories, 
  onAddCategory, 
  onDeleteCategory 
}) => {
  const [newCatName, setNewCatName] = useState('');

  const handleAdd = () => {
    if (newCatName.trim()) {
      onAddCategory(newCatName.trim());
      setNewCatName('');
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Tag size={20} className="text-indigo-600" /> Categorias
      </h3>
      
      <div className="flex gap-2 mb-6">
        <input 
          type="text" 
          placeholder="Nova categoria..." 
          value={newCatName}
          onChange={(e) => setNewCatName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          className="flex-1 p-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        <button 
          onClick={handleAdd}
          className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="space-y-3">
        {categories.map(cat => (
          <div key={cat.id} className="group flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-indigo-200 transition-colors">
            <span className="text-sm font-medium text-gray-700">{cat.name}</span>
            <button 
              onClick={() => onDeleteCategory(cat.id)}
              className="p-2 text-gray-300 hover:text-red-500 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
