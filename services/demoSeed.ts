
// DEV ONLY. Remove when Firebase is connected.
import { CategoryRepository, SubcategoryRepository, TransactionRepository, ClassificationRepository } from './localRepositories';
import { DefaultSeedService } from './defaultSeedService';
import { normalizeDescription } from '../classification/classificationService';
import { Transaction } from '../types/finance';

export const DemoSeedService = {
  seed: (scopeId: string) => {
    // 1. Garante categorias básicas antes de tudo
    DefaultSeedService.ensureDefaults(scopeId);

    const categories = CategoryRepository.getAll(scopeId);
    const subcategories = SubcategoryRepository.getAll(scopeId);

    const findCat = (name: string) => categories.find(c => c.name === name);
    const findSub = (catId: string, name: string) => subcategories.find(s => s.categoryId === catId && s.name === name);

    const isShared = scopeId.includes('casal');
    const transactions: Transaction[] = [];
    const now = new Date();
    
    // Mapeamento de Comerciantes para as categorias padrões
    const merchants = [
      { desc: 'Pão de Açúcar', cat: 'Alimentação', sub: 'Supermercado', baseAmount: 350 },
      { desc: 'Uber *Trip', cat: 'Transporte', sub: 'Uber/99', baseAmount: 30 },
      { desc: 'Shell Select', cat: 'Transporte', sub: 'Combustível', baseAmount: 220 },
      { desc: 'Netflix.com', cat: 'Lazer', sub: 'Streaming (Netflix/Spotify)', baseAmount: 55.90 },
      { desc: 'Droga Raia', cat: 'Saúde', sub: 'Farmácia', baseAmount: 60 },
      { desc: 'iFood *Jantar', cat: 'Alimentação', sub: 'Lanches/Ifood', baseAmount: 95 },
      { desc: 'Aluguel Mensal', cat: 'Moradia', sub: 'Aluguel/Prestação', baseAmount: 2800, isFixed: true },
      { desc: 'Energia Enel', cat: 'Moradia', sub: 'Energia', baseAmount: 240, isFixed: true },
      { desc: 'Condomínio', cat: 'Moradia', sub: 'Condomínio', baseAmount: 650, isFixed: true },
      { desc: 'Curso de Inglês', cat: 'Educação', sub: 'Cursos', baseAmount: 450, isFixed: true }
    ];

    for (let m = 0; m <= 3; m++) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - m, 15);
      const isCurrentMonth = m === 0;
      const monthMultiplier = isCurrentMonth ? 1.25 : 1.0;

      merchants.forEach(merchant => {
        const cat = findCat(merchant.cat);
        const sub = cat ? findSub(cat.id, merchant.sub) : null;

        if (!cat || !sub) return;

        if (merchant.isFixed) {
          const tx: Transaction = {
            id: crypto.randomUUID(),
            scopeId,
            date: new Date(targetDate.getFullYear(), targetDate.getMonth(), 5).toISOString().split('T')[0],
            description: merchant.desc,
            amount: merchant.baseAmount,
            categoryId: cat.id,
            subcategoryId: sub.id,
            isConfirmed: true,
            transactionNature: 'expense'
          };
          transactions.push(tx);
        } else {
          const frequency = isCurrentMonth ? 5 : 3;
          for (let i = 0; i < frequency; i++) {
            const day = Math.floor(Math.random() * 28) + 1;
            
            const tx: Transaction = {
              id: crypto.randomUUID(),
              scopeId,
              userId: isShared ? (Math.random() > 0.5 ? 'Pessoa A' : 'Pessoa B') : undefined,
              date: new Date(targetDate.getFullYear(), targetDate.getMonth(), day).toISOString().split('T')[0],
              description: merchant.desc,
              amount: (merchant.baseAmount * monthMultiplier) + (Math.random() * 20),
              categoryId: cat.id,
              subcategoryId: sub.id,
              isConfirmed: true,
              transactionNature: 'expense'
            };
            transactions.push(tx);
            
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
