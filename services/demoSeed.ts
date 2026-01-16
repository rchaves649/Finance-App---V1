
// DEV ONLY. Remove when Firebase is connected.
import { CategoryRepository, SubcategoryRepository, TransactionRepository, ClassificationRepository } from './localRepositories';
import { normalizeDescription } from '../classification/classificationService';

export const DemoSeedService = {
  seed: (scopeId: string) => {
    // 1. Categories and Subcategories
    const categoryData = [
      { name: 'Alimentação', subs: ['Supermercado', 'Restaurantes', 'Ifood'] },
      { name: 'Transporte', subs: ['Combustível', 'Uber/99', 'Manutenção'] },
      { name: 'Moradia', subs: ['Aluguel', 'Energia', 'Internet', 'Condomínio'] },
      { name: 'Lazer', subs: ['Cinema', 'Viagens', 'Hobbies'] },
      { name: 'Saúde', subs: ['Farmácia', 'Consulta', 'Exames'] },
      { name: 'Educação', subs: ['Cursos', 'Livros'] }
    ];

    const createdCategories = categoryData.map(cat => {
      const category = { id: crypto.randomUUID(), scopeId, name: cat.name };
      CategoryRepository.save(category);
      
      const subs = cat.subs.map(subName => {
        const sub = { id: crypto.randomUUID(), scopeId, categoryId: category.id, name: subName };
        SubcategoryRepository.save(sub);
        return sub;
      });

      return { ...category, subs };
    });

    const isShared = scopeId.includes('casal');
    const transactions = [];
    const now = new Date();
    
    // Configurações de Comerciantes
    const merchants = [
      { desc: 'Pão de Açúcar', catIdx: 0, subIdx: 0, baseAmount: 350, isFixed: false },
      { desc: 'Uber *Trip', catIdx: 1, subIdx: 1, baseAmount: 30, isFixed: false },
      { desc: 'Shell Select', catIdx: 1, subIdx: 0, baseAmount: 220, isFixed: false },
      { desc: 'Netflix.com', catIdx: 3, subIdx: 2, baseAmount: 55.90, isFixed: false },
      { desc: 'Droga Raia', catIdx: 4, subIdx: 0, baseAmount: 60, isFixed: false },
      { desc: 'iFood *Jantar', catIdx: 0, subIdx: 2, baseAmount: 95, isFixed: false },
      { desc: 'Aluguel Mensal', catIdx: 2, subIdx: 0, baseAmount: 2800, isFixed: true },
      { desc: 'Energia Enel', catIdx: 2, subIdx: 1, baseAmount: 240, isFixed: true },
      { desc: 'Condomínio', catIdx: 2, subIdx: 3, baseAmount: 650, isFixed: true },
      { desc: 'Curso de Inglês', catIdx: 5, subIdx: 0, baseAmount: 450, isFixed: true }
    ];

    // Gerar 4 meses de dados (3 meses de histórico + mês atual)
    for (let m = 0; m <= 3; m++) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - m, 15);
      const isCurrentMonth = m === 0;
      
      // Multiplicador de "inflação" para o mês atual parecer mais alto
      const monthMultiplier = isCurrentMonth ? 1.25 : 1.0;

      merchants.forEach(merchant => {
        // Gastos Fixos ocorrem uma vez por mês
        if (merchant.isFixed) {
          const tx = {
            id: crypto.randomUUID(),
            scopeId,
            userId: undefined, // Fixos geralmente não são atribuídos a uma pessoa específica no insight
            date: new Date(targetDate.getFullYear(), targetDate.getMonth(), 5).toISOString().split('T')[0],
            description: merchant.desc,
            amount: merchant.baseAmount,
            categoryId: createdCategories[merchant.catIdx].id,
            subcategoryId: createdCategories[merchant.catIdx].subs[merchant.subIdx].id,
            isConfirmed: true
          };
          transactions.push(tx);
        } else {
          // Gastos Variáveis ocorrem múltiplas vezes
          const frequency = isCurrentMonth ? 5 : 3;
          for (let i = 0; i < frequency; i++) {
            const day = Math.floor(Math.random() * 28) + 1;
            
            // No mês atual (m=0), a Pessoa A gasta mais para disparar o insight de "contribuinte dominante"
            let assignedUser = undefined;
            if (isShared) {
              if (isCurrentMonth) {
                assignedUser = Math.random() > 0.2 ? 'Pessoa A' : 'Pessoa B';
              } else {
                assignedUser = Math.random() > 0.5 ? 'Pessoa A' : 'Pessoa B';
              }
            }

            const tx = {
              id: crypto.randomUUID(),
              scopeId,
              userId: assignedUser,
              date: new Date(targetDate.getFullYear(), targetDate.getMonth(), day).toISOString().split('T')[0],
              description: merchant.desc,
              amount: (merchant.baseAmount * monthMultiplier) + (Math.random() * 20),
              categoryId: createdCategories[merchant.catIdx].id,
              subcategoryId: createdCategories[merchant.catIdx].subs[merchant.subIdx].id,
              isConfirmed: true
            };
            transactions.push(tx);
            
            // Salvar na memória de classificação apenas uma vez
            if (m === 0 && i === 0) {
              ClassificationRepository.save({
                scopeId,
                normalizedKey: normalizeDescription(tx.description),
                categoryId: tx.categoryId,
                subcategoryId: tx.subcategoryId,
                usageCount: 10,
                lastUsedAt: tx.date
              });
            }
          }
        }
      });
    }

    TransactionRepository.saveMany(transactions);
  }
};
