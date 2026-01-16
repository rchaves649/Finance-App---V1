
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Scope } from '../types';

interface ScopeContextType {
  currentScope: Scope;
  setScope: (scope: Scope) => void;
  availableScopes: Scope[];
}

const DEFAULT_SCOPES: Scope[] = [
  { scopeId: 'pessoal-1', scopeType: 'individual', name: 'Minha Conta' },
  { scopeId: 'casal-1', scopeType: 'shared', name: 'Conjunta (Casal)' },
];

const ScopeContext = createContext<ScopeContextType | undefined>(undefined);

export const ScopeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentScope, setCurrentScope] = useState<Scope>(DEFAULT_SCOPES[0]);

  return (
    <ScopeContext.Provider value={{ currentScope, setScope: setCurrentScope, availableScopes: DEFAULT_SCOPES }}>
      {children}
    </ScopeContext.Provider>
  );
};

export const useScope = () => {
  const context = useContext(ScopeContext);
  if (!context) throw new Error('useScope must be used within ScopeProvider');
  return context;
};
