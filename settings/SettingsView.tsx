
import React, { useState } from 'react';
import { Category, Subcategory, Scope } from '../types/finance';
import { Plus, Trash2, Tag, ChevronRight, Eraser, Beaker, Scale } from 'lucide-react';

interface SettingsViewProps {
  currentScope: Scope;
  categories: Category[];
  subcategories: Subcategory[];
  onAddCategory: (name: string) => void;
  onAddSubcategory: (catId: string, name: string) => void;
  onDeleteCategory: (id: string) => void;
  onDeleteSubcategory: (id: string) => void;
  onUpdateSplit: (split: { A: number, B: number }) => void;
  onLoadDemo: () => void;
  onClearAll: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentScope,
  categories,
  subcategories,
  onAddCategory,
  onAddSubcategory,
  onDeleteCategory,
  onDeleteSubcategory,
  onUpdateSplit,
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
        <div className="space-y-8">
          {/* Default Split Setting (Only for Shared Scopes) */}
          {currentScope.scopeType === 'shared' && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Scale size={20} className="text-indigo-600" /> Divisão Padrão
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Define a proporção automática ao importar novas despesas neste escopo.
              </p>
              <div className="flex items-center gap-6">
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-gray-500 uppercase">
                    <span>Pessoa A: {currentScope.defaultSplit?.A}%</span>
                    <span>Pessoa B: {currentScope.defaultSplit?.B}%</span>
                  </div>
                  <input 
                    type="range"
                    min="0"
                    max="100"
                    value={currentScope.defaultSplit?.A ?? 50}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      onUpdateSplit({ A: val, B: 100 - val });
                    }}
                    className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>A paga tudo</span>
                    <span>50/50</span>
                    <span>B paga tudo</span>
                  </div>
                </div>
              </div>
            </div>
          )}

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
