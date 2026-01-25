import { Category, Subcategory } from '../types/finance';
import { CategoryRepository, SubcategoryRepository } from './localRepositories';
import { DefaultSeedService } from './defaultSeedService';

export const CategoryService = {
  getAllCategories: (scopeId: string): Category[] => {
    DefaultSeedService.ensureDefaults(scopeId);
    // Retorna apenas categorias ativas para a UI de seleção/ajustes
    return CategoryRepository.getAll(scopeId).filter(c => !c.isDeleted);
  },

  getAllSubcategories: (scopeId: string): Subcategory[] => {
    return SubcategoryRepository.getAll(scopeId).filter(s => !s.isDeleted);
  },

  addCategory: (scopeId: string, name: string): void => {
    const trimmed = name.trim();
    if (!trimmed) return;
    CategoryRepository.save({ 
      id: crypto.randomUUID(), 
      scopeId, 
      name: trimmed 
    });
  },

  deleteCategory: (scopeId: string, id: string): void => {
    const cat = CategoryRepository.getAll(scopeId).find(c => c.id === id);
    if (!cat) return;
    
    // Soft Delete: Mantém o registro para não quebrar o histórico de transações antigas
    CategoryRepository.save({ ...cat, isDeleted: true });
    
    // Faz o mesmo para as subcategorias
    const subs = SubcategoryRepository.getByCategory(scopeId, id);
    subs.forEach(s => SubcategoryRepository.save({ ...s, isDeleted: true }));
  },

  addSubcategory: (scopeId: string, categoryId: string, name: string): void => {
    const trimmed = name.trim();
    if (!trimmed) return;
    SubcategoryRepository.save({ 
      id: crypto.randomUUID(), 
      scopeId, 
      categoryId, 
      name: trimmed 
    });
  },

  deleteSubcategory: (id: string): void => {
    // Para simplificar, subcategorias órfãs são removidas ou marcadas como deletadas
    const all = SubcategoryRepository.getAll(''); // Dummy scope just to find it
    const sub = all.find(s => s.id === id);
    if (sub) {
      SubcategoryRepository.save({ ...sub, isDeleted: true });
    }
  }
};
