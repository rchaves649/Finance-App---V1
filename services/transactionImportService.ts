
import { Transaction, Scope, TransactionNatures } from '../types/finance';
import { TransactionRepository, ImportLogRepository } from './localRepositories';
import { roundToTwo, toCents } from '../shared/formatUtils';
import { ClassificationEngine, detectNature, normalizeDescription } from '../classification/classificationService';
import { CSVService } from './csvService';

export const TransactionImportService = {
  prepareCSVTransactions: (csvText: string, scope: Scope, fileName?: string): { transactions: Transaction[], isDuplicateFile: boolean } => {
    const isDuplicateFile = fileName ? ImportLogRepository.isAlreadyImported(scope.scopeId, fileName) : false;
    
    const rawData = CSVService.parse(csvText);
    const existingTxs = TransactionRepository.getAll(scope.scopeId);

    // Mapeia IDs externos já existentes para detecção absoluta
    const existingExternalIds = new Set(existingTxs.filter(t => !!t.externalId).map(t => t.externalId!));

    // Contador de frequência por fingerprint (Data + Valor + Descrição)
    // Usado como fallback quando não há externalId
    const dbFrequency = new Map<string, number>();
    existingTxs.forEach(t => {
      if (!t.externalId) {
        const fp = `${t.date}_${toCents(t.amount)}_${normalizeDescription(t.description)}`;
        dbFrequency.set(fp, (dbFrequency.get(fp) || 0) + 1);
      }
    });
    
    const initialTxs: Transaction[] = [];
    const amountMap = new Map<number, number[]>();
    const currentFileProcessedCount = new Map<string, number>();

    rawData.forEach((item) => {
      const normalizedDesc = normalizeDescription(item.description);
      const amountCents = toCents(item.amount);
      const absCents = Math.abs(amountCents);
      const fingerprint = `${item.date}_${absCents}_${normalizedDesc}`;

      // 1. Prioridade Máxima: Duplicidade por ID Externo (NSU/Autenticação)
      if (item.externalId && existingExternalIds.has(item.externalId)) {
        return;
      }

      // 2. Fallback: Detecção de Duplicidade por Frequência (para bancos sem ID)
      // Se não temos ID, comparamos se a "instância" atual no arquivo já existe no banco.
      if (!item.externalId) {
        const alreadyInDb = dbFrequency.get(fingerprint) || 0;
        const alreadyProcessedInThisFile = currentFileProcessedCount.get(fingerprint) || 0;

        // Se o banco já tem 2 cafés e este é o 1º ou 2º café do arquivo, ignoramos (é sobreposição)
        // Se o banco tem 2 cafés e este é o 3º café do arquivo, importamos (é um novo gasto legítimo)
        if (alreadyInDb > alreadyProcessedInThisFile) {
          currentFileProcessedCount.set(fingerprint, alreadyProcessedInThisFile + 1);
          return;
        }
      }

      const suggestion = ClassificationEngine.suggest(scope.scopeId, item.description, item.amount);
      const nature = suggestion?.nature || detectNature(item.description, item.amount);

      const tx: Transaction = {
        id: crypto.randomUUID(),
        externalId: item.externalId,
        scopeId: scope.scopeId,
        date: item.date,
        description: item.description,
        amount: roundToTwo(Math.abs(item.amount)),
        categoryId: suggestion?.categoryId || undefined,
        subcategoryId: suggestion?.subcategoryId || undefined,
        payerShare: undefined,
        isConfirmed: false,
        isSuggested: !!(suggestion && suggestion.categoryId),
        isAutoConfirmed: false,
        isRecurring: !!(suggestion?.payerShare),
        classificationStatus: suggestion?.categoryId ? 'auto' : 'pending',
        transactionNature: nature
      };

      (tx as any)._originalAmount = item.amount;

      if (scope.scopeType === 'shared') {
        const totalCents = toCents(tx.amount);
        const splitA = suggestion?.payerShare?.A ?? scope.defaultSplit?.A ?? 50;
        const centsA = Math.round((totalCents * splitA) / 100);
        const centsB = totalCents - centsA;
        tx.payerShare = { A: (centsA / 100), B: (centsB / 100) };
      }

      const newIdx = initialTxs.push(tx) - 1;
      if (!amountMap.has(absCents)) amountMap.set(absCents, []);
      amountMap.get(absCents)!.push(newIdx);
      
      currentFileProcessedCount.set(fingerprint, (currentFileProcessedCount.get(fingerprint) || 0) + 1);
    });

    // Lógica de Neutralização (Estornos pareados)
    amountMap.forEach((indices) => {
      if (indices.length < 2) return;
      for (let i = 0; i < indices.length; i++) {
        const idxA = indices[i];
        const txA = initialTxs[idxA];
        const valA = (txA as any)._originalAmount;
        
        for (let j = 0; j < indices.length; j++) {
          if (i === j) continue;
          const idxB = indices[j];
          const txB = initialTxs[idxB];
          const valB = (txB as any)._originalAmount;
          
          if (valA + valB === 0) {
            const dateA = new Date(txA.date).getTime();
            const dateB = new Date(txB.date).getTime();
            const dayDiff = Math.abs(dateA - dateB) / (1000 * 3600 * 24);
            
            if (dayDiff <= 15) {
              const descA = normalizeDescription(txA.description);
              const descB = normalizeDescription(txB.description);
              
              if (descA.includes(descB) || descB.includes(descA) || descA.substring(0, 10) === descB.substring(0, 10)) {
                txA.isNeutralized = true;
                txB.isNeutralized = true;
                if (valA < 0) txA.transactionNature = TransactionNatures.REFUND;
                if (valB < 0) txB.transactionNature = TransactionNatures.REFUND;
                break;
              }
            }
          }
        }
      }
    });

    initialTxs.forEach(t => delete (t as any)._originalAmount);
    return { transactions: initialTxs, isDuplicateFile };
  }
};
