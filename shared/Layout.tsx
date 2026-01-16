
import React from 'react';
import { LayoutDashboard, Receipt, Settings, Wallet } from 'lucide-react';
import { ViewType } from '../types';
import { useScope } from './ScopeContext';

interface LayoutProps {
  children: React.ReactNode;
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeView, onViewChange }) => {
  const { currentScope, setScope, availableScopes } = useScope();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Lançamentos', icon: Receipt },
    { id: 'settings', label: 'Ajustes', icon: Settings },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex-shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-2 text-indigo-600 mb-8">
            <Wallet size={28} />
            <h1 className="text-xl font-bold tracking-tight">FinanceConnect</h1>
          </div>

          <div className="mb-8">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Escopo Atual</label>
            <select 
              value={currentScope.scopeId}
              onChange={(e) => {
                const s = availableScopes.find(x => x.scopeId === e.target.value);
                if (s) setScope(s);
              }}
              className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {availableScopes.map(s => (
                <option key={s.scopeId} value={s.scopeId}>{s.name}</option>
              ))}
            </select>
          </div>

          <nav className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const active = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id as ViewType)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                    active 
                      ? 'bg-indigo-50 text-indigo-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} className={active ? 'text-indigo-600' : 'text-gray-400'} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
