
import React, { useState, useEffect, useCallback } from 'react';
import { useScope } from '../shared/ScopeContext';
import { useToast } from '../shared/ToastContext';
import { 
  AppRepository, 
  ClassificationRepository, 
  RecurringRepository 
} from '../services/localRepositories';
import { DemoSeedService } from '../services/demoSeed';
import { CategoryService } from '../services/categoryService';
import { Category, Subcategory, ClassificationMemoryEntry, RecurringMemoryEntry } from '../types/finance';
import { SettingsView } from './SettingsView';

export const SettingsContainer: React.FC = () => {
  const { currentScope, updateScopeSettings } = useScope();
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [mappings, setMappings] = useState<ClassificationMemoryEntry[]>([]);
  const [recurringRules, setRecurringRules] = useState<RecurringMemoryEntry[]>([]);

  const loadData = useCallback(() => {
    setCategories(CategoryService.getAllCategories(currentScope.scopeId));
    setSubcategories(CategoryService.getAllSubcategories(currentScope.scopeId));
    setMappings(ClassificationRepository.getAll(currentScope.scopeId));
    setRecurringRules(RecurringRepository.getAll(currentScope.scopeId));
  }, [currentScope.scopeId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddCategory = (name: string) => {
    CategoryService.addCategory(currentScope.scopeId, name);
    showToast(`Categoria criada.`, 'success');
    loadData();
  };

  const handleAddSubcategory = (categoryId: string, name: string) => {
    CategoryService.addSubcategory(currentScope.scopeId, categoryId, name);
    showToast(`Subcategoria criada.`, 'success');
    loadData();
  };

  const handleDeleteCategory = (id: string) => {
    if (window.confirm('Ao excluir uma categoria, todas as suas subcategorias também serão removidas. Continuar?')) {
      CategoryService.deleteCategory(currentScope.scopeId, id);
      showToast('Categoria excluída.', 'info');
      loadData();
    }
  };

  const handleDeleteSubcategory = (id: string) => {
    CategoryService.deleteSubcategory(id);
    showToast('Subcategoria excluída.', 'info');
    loadData();
  };

  const handleDeleteMapping = (normalizedKey: string) => {
    if (window.confirm(`Deseja remover o aprendizado para "${normalizedKey}"?`)) {
      ClassificationRepository.delete(currentScope.scopeId, normalizedKey);
      RecurringRepository.delete(currentScope.scopeId, normalizedKey);
      showToast('Mapeamento removido.', 'info');
      loadData();
    }
  };

  const handleUpdateSplit = (split: { A: number, B: number }) => {
    updateScopeSettings(currentScope.scopeId, { defaultSplit: split });
    showToast('Divisão padrão atualizada.', 'success');
  };

  const handleLoadDemo = () => {
    if (window.confirm('Isso irá carregar dados fictícios no escopo atual. Continuar?')) {
      DemoSeedService.seed(currentScope.scopeId);
      showToast('Dados de exemplo carregados.', 'success');
      loadData();
    }
  };

  const handleClearAll = () => {
    if (window.confirm('ATENÇÃO: Isso apagará TODOS os dados salvos localmente. Esta ação não pode ser desfeita. Continuar?')) {
      AppRepository.clearAll();
      window.location.reload();
    }
  };

  return (
    <SettingsView 
      currentScope={currentScope}
      categories={categories}
      subcategories={subcategories}
      mappings={mappings}
      recurringRules={recurringRules}
      onAddCategory={handleAddCategory}
      onAddSubcategory={handleAddSubcategory}
      onDeleteCategory={handleDeleteCategory}
      onDeleteSubcategory={handleDeleteSubcategory}
      onDeleteMapping={handleDeleteMapping}
      onUpdateSplit={handleUpdateSplit}
      onLoadDemo={handleLoadDemo}
      onClearAll={handleClearAll}
    />
  );
};
