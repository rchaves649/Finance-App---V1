
import React, { useState, useEffect, useCallback } from 'react';
import { useScope } from '../shared/ScopeContext';
import { CategoryRepository, SubcategoryRepository, AppRepository } from '../services/localRepositories';
import { DemoSeedService } from '../services/demoSeed';
import { Category, Subcategory } from '../types/finance';
import { SettingsView } from './SettingsView';

export const SettingsContainer: React.FC = () => {
  const { currentScope, updateScopeSettings } = useScope();
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

  const loadData = useCallback(() => {
    setCategories(CategoryRepository.getAll(currentScope.scopeId));
    setSubcategories(SubcategoryRepository.getAll(currentScope.scopeId));
  }, [currentScope.scopeId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddCategory = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    
    CategoryRepository.save({ 
      id: crypto.randomUUID(), 
      scopeId: currentScope.scopeId, 
      name: trimmed 
    });
    loadData();
  };

  const handleAddSubcategory = (categoryId: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    SubcategoryRepository.save({ 
      id: crypto.randomUUID(), 
      scopeId: currentScope.scopeId, 
      categoryId, 
      name: trimmed 
    });
    loadData();
  };

  const handleDeleteCategory = (id: string) => {
    if (window.confirm('Ao excluir uma categoria, todas as suas subcategorias também serão removidas. Continuar?')) {
      SubcategoryRepository.deleteByCategory(currentScope.scopeId, id);
      CategoryRepository.delete(id);
      loadData();
    }
  };

  const handleDeleteSubcategory = (id: string) => {
    SubcategoryRepository.delete(id);
    loadData();
  };

  const handleUpdateSplit = (split: { A: number, B: number }) => {
    updateScopeSettings(currentScope.scopeId, { defaultSplit: split });
  };

  const handleLoadDemo = () => {
    if (window.confirm('Isso irá carregar dados fictícios no escopo atual. Continuar?')) {
      DemoSeedService.seed(currentScope.scopeId);
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
      onAddCategory={handleAddCategory}
      onAddSubcategory={handleAddSubcategory}
      onDeleteCategory={handleDeleteCategory}
      onDeleteSubcategory={handleDeleteSubcategory}
      onUpdateSplit={handleUpdateSplit}
      onLoadDemo={handleLoadDemo}
      onClearAll={handleClearAll}
    />
  );
};
