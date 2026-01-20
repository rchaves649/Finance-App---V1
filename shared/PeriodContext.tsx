
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Period } from '../types/finance';

interface PeriodContextType {
  period: Period;
  setPeriod: (period: Period) => void;
}

const PeriodContext = createContext<PeriodContextType | undefined>(undefined);

export const PeriodProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [period, setPeriod] = useState<Period>(() => {
    const now = new Date();
    return {
      kind: 'month',
      year: now.getFullYear(),
      month: now.getMonth() + 1
    };
  });

  return (
    <PeriodContext.Provider value={{ period, setPeriod }}>
      {children}
    </PeriodContext.Provider>
  );
};

export const usePeriod = () => {
  const context = useContext(PeriodContext);
  if (!context) {
    throw new Error('usePeriod must be used within a PeriodProvider');
  }
  return context;
};
