
import React from 'react';
import { Category, Subcategory, Scope, ClassificationMemoryEntry, RecurringMemoryEntry } from '../types/finance';
import { Eraser, Beaker } from 'lucide-react';
import { CategoryPanel } from './components/CategoryPanel';
import { SubcategoryPanel } from './components/SubcategoryPanel';
import { IntelligenceMappingTable } from './components/IntelligenceMappingTable';
import { DefaultSplitConfig } from './components/DefaultSplitConfig';

interface SettingsViewProps {
  currentScope: Scope;
  categories: Category[];
  subcategories: Subcategory[];
  mappings: ClassificationMemoryEntry[];
  recurringRules: RecurringMemoryEntry[];
  onAddCategory: (name: string) => void;
  onAddSubcategory: (catId: string, name: string) => void;
  onDeleteCategory: (id: string) => void;
  onDeleteSubcategory: (id: string) => void;
  onDeleteMapping: (normalizedKey: string) => void;
  onUpdateSplit: (split: { A: number, B: number }) => void;
  onLoadDemo: () => void;
  onClearAll: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentScope,
  categories,
  subcategories,
  mappings,
  recurringRules,
  onAddCategory,
  onAddSubcategory,
  onDeleteCategory,
  onDeleteSubcategory,
  onDeleteMapping,
  onUpdateSplit,
  onLoadDemo,
  onClearAll
}) => {
  return (
    <div className="space-y-8 pb-12">
      {/* Header com ações globais */}
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

      {/* Grid de Configurações */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-8">
          <DefaultSplitConfig 
            currentScope={currentScope} 
            onUpdateSplit={onUpdateSplit} 
          />

          <CategoryPanel 
            categories={categories}
            onAddCategory={onAddCategory}
            onDeleteCategory={onDeleteCategory}
          />
        </div>

        <SubcategoryPanel 
          categories={categories}
          subcategories={subcategories}
          onAddSubcategory={onAddSubcategory}
          onDeleteSubcategory={onDeleteSubcategory}
        />
      </div>

      {/* Seção de Inteligência */}
      <IntelligenceMappingTable 
        mappings={mappings}
        recurringRules={recurringRules}
        categories={categories}
        subcategories={subcategories}
        onDeleteMapping={onDeleteMapping}
      />
    </div>
  );
};
