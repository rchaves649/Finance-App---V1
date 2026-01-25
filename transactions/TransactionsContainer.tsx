
import React, { useState, useCallback, useMemo } from 'react';
import { useScope } from '../shared/ScopeContext';
import { useToast } from '../shared/ToastContext';
import { DemoSeedService } from '../services/demoSeed';
import { TransactionService } from '../services/transactionService';
import { SummaryService } from '../services/summaryService';
import { Transaction, Period } from '../types/finance';
import { TransactionsView } from './TransactionsView';
import { Loader2 } from 'lucide-react';
import { useTransactionData } from './hooks/useTransactionData';
import { useTransactionOperations } from './hooks/useTransactionOperations';
import { formatMonthYear, parseMonthYearString } from '../shared/dateUtils';

export const TransactionsContainer: React.FC = () => {
  const { currentScope } = useScope();
  const { showToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewTransactions, setPreviewTransactions] = useState<Transaction[] | null>(null);
  const [currentImportFileName, setCurrentImportFileName] = useState<string | undefined>();

  const data = useTransactionData(currentScope);
  const ops = useTransactionOperations(currentScope, data.setTransactions, data.loadData);

  const natureSummary = useMemo(() => {
    if (!data.selectedMonth) return { expenses: 0, installments: 0, refunds: 0, credits: 0, transfers: 0, invoiceTotal: 0 };
    
    const parsed = parseMonthYearString(data.selectedMonth);
    if (!parsed) return { expenses: 0, installments: 0, refunds: 0, credits: 0, transfers: 0, invoiceTotal: 0 };
    
    const period: Period = { kind: 'month', month: parsed.month, year: parsed.year };
    // Fix: Pass the required rawData object as the third argument to SummaryService.getSummary
    const summary = SummaryService.getSummary(currentScope.scopeId, period, {
      allTransactions: data.transactions,
      categories: data.categories,
      subcategories: data.subcategories
    });
    return summary.natureTotals;
  }, [data.selectedMonth, currentScope.scopeId, data.transactions, data.categories, data.subcategories]);

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileName = file.name;
    setIsProcessing(true);
    try {
      const text = await file.text();
      if (!text || text.trim().length < 5) {
        showToast('O arquivo selecionado parece estar vazio.', 'error');
        setIsProcessing(false);
        return;
      }
      
      setTimeout(() => {
        const { transactions: prepared, isDuplicateFile } = TransactionService.prepareCSVTransactions(text, currentScope, fileName);
        if (isDuplicateFile && !window.confirm(`O arquivo "${fileName}" já foi importado anteriormente. Continuar?`)) {
          setIsProcessing(false);
          return;
        }
        if (prepared.length === 0) {
          showToast('Nenhuma nova transação encontrada ou colunas não reconhecidas.', 'info');
        } else {
          setPreviewTransactions(prepared);
          setCurrentImportFileName(fileName);
        }
        setIsProcessing(false);
      }, 50); 
    } catch (error) {
      showToast('Falha crítica ao ler o arquivo.', 'error');
      setIsProcessing(false);
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  const handleConfirmImport = useCallback(() => {
    if (!previewTransactions || previewTransactions.length === 0) return;
    setIsProcessing(true);
    const fileName = currentImportFileName;
    
    const targetMonth = formatMonthYear(previewTransactions[0].date);
    
    setTimeout(() => {
      try {
        TransactionService.saveTransactions(previewTransactions, fileName);
        setPreviewTransactions(null);
        setCurrentImportFileName(undefined);
        
        // Atualiza o mês selecionado para o mês do arquivo importado
        data.setSelectedMonth(targetMonth);
        
        // Força o recarregamento dos dados para garantir que apareçam
        // especialmente se o targetMonth for igual ao selecionado anteriormente
        data.loadData();
        
        showToast('Extrato importado com sucesso!', 'success');
      } catch (error) {
        showToast('Falha ao salvar os lançamentos.', 'error');
      } finally {
        setIsProcessing(false);
      }
    }, 100);
  }, [previewTransactions, currentImportFileName, data, showToast]);

  const handleCancelImport = useCallback(() => {
    setPreviewTransactions(null);
    setCurrentImportFileName(undefined);
    showToast('Importação descartada.', 'info');
  }, [showToast]);

  const handleLoadDemo = useCallback(() => {
    setIsProcessing(true);
    setTimeout(() => {
      DemoSeedService.seed(currentScope.scopeId);
      data.loadData();
      setIsProcessing(false);
      showToast('Dados de exemplo carregados.', 'success');
    }, 100);
  }, [currentScope.scopeId, data, showToast]);

  return (
    <>
      {isProcessing && (
        <div className="fixed inset-0 z-[200] bg-white/60 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 flex flex-col items-center gap-4">
            <Loader2 size={40} className="text-indigo-600 animate-spin" />
            <p className="text-gray-900 font-bold">Processando dados...</p>
          </div>
        </div>
      )}
      <TransactionsView 
        transactions={data.transactions}
        categories={data.categories}
        subcategories={data.subcategories}
        scopeType={currentScope.scopeType}
        currentScopeId={currentScope.scopeId}
        defaultSplit={currentScope.defaultSplit}
        summary={natureSummary}
        onImport={handleImportCSV}
        onUpdate={ops.handleUpdate}
        onConfirm={ops.handleConfirm}
        onDelete={ops.handleDelete}
        onMoveToIndividual={ops.handleMoveToIndividual}
        onRevertToShared={ops.handleRevertToShared}
        onLoadDemo={handleLoadDemo}
        onSaveManual={ops.handleSaveManual}
        selectedMonth={data.selectedMonth}
        setSelectedMonth={data.setSelectedMonth}
        availableMonths={data.availableMonths}
        previewTransactions={previewTransactions}
        onConfirmImport={handleConfirmImport}
        onCancelImport={handleCancelImport}
      />
    </>
  );
};
