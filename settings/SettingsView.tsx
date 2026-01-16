
import React, { useState } from 'react';
import { Category, Subcategory } from '../types';
import { Plus, Trash2, Tag, ChevronRight, Database, Eraser, Beaker } from 'lucide-react';

interface SettingsViewProps {
  categories: Category[];
  subcategories: Subcategory[];
  onAddCategory: (name: string) => void;
  onAddSubcategory: (catId: string, name: string) => void;
  onDeleteCategory: (id: string) => void;
  onDeleteSubcategory: (id: string) => void;
  onLoadDemo: () => void;
  onClearAll: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  categories,
  subcategories,
  onAddCategory,
  onAddSubcategory,
  onDeleteCategory,
  onDeleteSubcategory,
  onLoadDemo,
  onClearAll
}) => {
  const [newCatName, setNewCatName] = useState('');
  const [newSubNames, setNewSubNames] = useState<Record<string, string>>({});

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Ajustes</h2>
          <p className="text-gray-500">Gerencie suas categorias e dados da aplicação.</p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={onLoadDemo}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-sm font-medium transition-colors"
          >
            <Beaker size={16} />
            <span>Carregar Dados Demo</span>
          </button>
          <button 
            onClick={onClearAll}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors"
          >
            <Eraser size={16} />
            <span>Limpar Tudo</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Categories Panel */}
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
              className="flex-1 p-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <button 
              onClick={() => { if(newCatName) { onAddCategory(newCatName); setNewCatName(''); } }}
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

        {/* Subcategories Panel */}
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
                      className="flex-1 p-1.5 border border-gray-100 rounded-lg text-xs bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <button 
                      onClick={() => { if(newSubNames[cat.id]) { onAddSubcategory(cat.id, newSubNames[cat.id]); setNewSubNames(prev => ({ ...prev, [cat.id]: '' })); } }}
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
      </div>
    </div>
  );
};
