
import React, { useState } from 'react';
import { ChevronRight, Plus, Trash2 } from 'lucide-react';
import { Category, Subcategory } from '../../types/finance';

interface SubcategoryPanelProps {
  categories: Category[];
  subcategories: Subcategory[];
  onAddSubcategory: (catId: string, name: string) => void;
  onDeleteSubcategory: (id: string) => void;
}

export const SubcategoryPanel: React.FC<SubcategoryPanelProps> = ({
  categories,
  subcategories,
  onAddSubcategory,
  onDeleteSubcategory
}) => {
  const [newSubNames, setNewSubNames] = useState<Record<string, string>>({});

  const handleAdd = (categoryId: string) => {
    const name = newSubNames[categoryId];
    if (name?.trim()) {
      onAddSubcategory(categoryId, name.trim());
      setNewSubNames(prev => ({ ...prev, [categoryId]: '' }));
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
        <ChevronRight size={20} className="text-indigo-600" /> Subcategorias
      </h3>

      <div className="space-y-6">
        {categories.map(cat => {
          const subs = subcategories.filter(s => s.categoryId === cat.id);
          return (
            <div key={cat.id} className="border-b border-gray-50 pb-4 last:border-0">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{cat.name}</h4>
              
              <div className="flex gap-2 mb-3">
                <input 
                  type="text" 
                  placeholder="Nova subcategoria..." 
                  value={newSubNames[cat.id] || ''}
                  onChange={(e) => setNewSubNames(prev => ({ ...prev, [cat.id]: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd(cat.id)}
                  className="flex-1 p-1.5 border border-gray-100 rounded-lg text-xs bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <button 
                  onClick={() => handleAdd(cat.id)}
                  className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {subs.map(sub => (
                  <span key={sub.id} className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-xs font-medium border border-gray-100">
                    {sub.name}
                    <button onClick={() => onDeleteSubcategory(sub.id)} className="hover:text-red-500 transition-colors">
                      <Trash2 size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
