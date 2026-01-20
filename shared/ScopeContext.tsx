
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Scope } from '../types/finance';

interface ScopeContextType {
  currentScope: Scope;
  setScope: (scope: Scope) => void;
  updateScopeSettings: (scopeId: string, settings: Partial<Scope>) => void;
  availableScopes: Scope[];
}

const STORAGE_KEY = 'fc_scope_settings';

const DEFAULT_SCOPES: Scope[] = [
  { scopeId: 'pessoal-1', scopeType: 'individual', name: 'Minha Conta' },
  { scopeId: 'casal-1', scopeType: 'shared', name: 'Conjunta (Casal)', defaultSplit: { A: 50, B: 50 } },
];

const ScopeContext = createContext<ScopeContextType | undefined>(undefined);

export const ScopeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [availableScopes, setAvailableScopes] = useState<Scope[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return DEFAULT_SCOPES;
    
    // Merge saved settings with default structure to ensure consistency
    const savedScopes: Scope[] = JSON.parse(saved);
    return DEFAULT_SCOPES.map(def => {
      const match = savedScopes.find(s => s.scopeId === def.scopeId);
      return match ? { ...def, ...match } : def;
    });
  });

  const [currentScopeId, setCurrentScopeId] = useState(availableScopes[0].scopeId);

  const currentScope = availableScopes.find(s => s.scopeId === currentScopeId)!;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(availableScopes));
  }, [availableScopes]);

  const updateScopeSettings = (scopeId: string, settings: Partial<Scope>) => {
    setAvailableScopes(prev => prev.map(s => 
      s.scopeId === scopeId ? { ...s, ...settings } : s
    ));
  };

  const setScope = (scope: Scope) => {
    setCurrentScopeId(scope.scopeId);
  };

  return (
    <ScopeContext.Provider value={{ currentScope, setScope, updateScopeSettings, availableScopes }}>
      {children}
    </ScopeContext.Provider>
  );
};

export const useScope = () => {
  const context = useContext(ScopeContext);
  if (!context) throw new Error('useScope must be used within ScopeProvider');
  return context;
};
