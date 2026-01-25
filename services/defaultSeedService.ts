
import { CategoryRepository, SubcategoryRepository } from './localRepositories';

const DEFAULT_STRUCTURE = [
  { name: 'Alimentação', subs: ['Supermercado', 'Restaurantes', 'Lanches/Ifood', 'Padaria'] },
  { name: 'Transporte', subs: ['Combustível', 'Uber/99', 'Manutenção Veículo', 'Transporte Público', 'Estacionamento'] },
  { name: 'Moradia', subs: ['Aluguel/Prestação', 'Condomínio', 'Energia', 'Água', 'Internet', 'Manutenção Casa'] },
  { name: 'Saúde', subs: ['Farmácia', 'Consultas/Exames', 'Plano de Saúde', 'Academia'] },
  { name: 'Lazer', subs: ['Cinema/Shows', 'Viagens', 'Hobbies', 'Streaming (Netflix/Spotify)'] },
  { name: 'Educação', subs: ['Cursos', 'Livros', 'Mensalidades'] },
  { name: 'Compras', subs: ['Vestuário', 'Eletrônicos', 'Presentes', 'Casa/Decoração'] },
  { name: 'Financeiro', subs: ['Investimentos', 'Tarifas Bancárias', 'Seguros', 'Empréstimos'] },
  { name: 'Outros', subs: ['Diversos'] }
];

export const DefaultSeedService = {
  /**
   * Garante que o escopo possua as categorias básicas.
   * Utiliza um flag no localStorage para evitar recriação se o usuário deletar tudo propositalmente.
   */
  ensureDefaults: (scopeId: string) => {
    const initKey = `fc_init_categories_${scopeId}`;
    const alreadyInitialized = localStorage.getItem(initKey);

    if (alreadyInitialized) return;

    // Se não houver categorias no repositório, cria as padrões
    const currentCats = CategoryRepository.getAll(scopeId);
    if (currentCats.length === 0) {
      DEFAULT_STRUCTURE.forEach(catDef => {
        const category = { id: crypto.randomUUID(), scopeId, name: catDef.name };
        CategoryRepository.save(category);
        
        catDef.subs.forEach(subName => {
          SubcategoryRepository.save({ 
            id: crypto.randomUUID(), 
            scopeId, 
            categoryId: category.id, 
            name: subName 
          });
        });
      });
    }

    localStorage.setItem(initKey, 'true');
  }
};
