
import React, { useState, useEffect } from 'react';
import { Filter, Check, AlertCircle } from 'lucide-react';
import { Period } from '../../types/finance';
import { clampRange } from '../../shared/dateUtils';

interface PeriodSelectorProps {
  period: Period;
  onPeriodChange: (p: Period) => void;
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({ period, onPeriodChange }) => {
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');
  const [rangeError, setRangeError] = useState(false);

  useEffect(() => {
    if (period.kind === 'range') {
      setRangeStart(period.startISO);
      setRangeEnd(period.endISO);
    }
  }, [period]);

  const handleModeChange = (kind: 'month' | 'year' | 'range') => {
    const now = new Date();
    setRangeError(false);
    if (kind === 'month') {
      onPeriodChange({ kind: 'month', year: now.getFullYear(), month: now.getMonth() + 1 });
    } else if (kind === 'year') {
      onPeriodChange({ kind: 'year', year: now.getFullYear() });
    } else {
      const today = now.toISOString().split('T')[0];
      const thirtyDaysAgo = new Date(new Date().setDate(now.getDate() - 30)).toISOString().split('T')[0];
      setRangeStart(thirtyDaysAgo);
      setRangeEnd(today);
      onPeriodChange({ kind: 'range', startISO: thirtyDaysAgo, endISO: today });
    }
  };

  const handleApplyRange = () => {
    if (!rangeStart || !rangeEnd) {
      setRangeError(true);
      return;
    }
    setRangeError(false);
    const clamped = clampRange(rangeStart, rangeEnd);
    onPeriodChange({ kind: 'range', ...clamped });
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 px-3 border-r border-gray-100 mr-2">
          <Filter size={16} className="text-gray-400" />
          <select 
            value={period.kind}
            onChange={(e) => handleModeChange(e.target.value as any)}
            className="text-sm font-semibold text-gray-700 bg-transparent outline-none cursor-pointer"
          >
            <option value="month">Mês</option>
            <option value="year">Ano</option>
            <option value="range">Período</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          {period.kind === 'month' && (
            <>
              <select 
                value={period.month}
                onChange={(e) => onPeriodChange({ ...period, month: parseInt(e.target.value) })}
                className="text-sm p-1.5 bg-gray-50 rounded-lg outline-none border border-transparent focus:border-indigo-200"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString('pt-BR', { month: 'long' })}
                  </option>
                ))}
              </select>
              <input 
                type="number"
                value={period.year}
                onChange={(e) => onPeriodChange({ ...period, year: parseInt(e.target.value) })}
                className="text-sm w-20 p-1.5 bg-gray-50 rounded-lg outline-none border border-transparent focus:border-indigo-200"
              />
            </>
          )}

          {period.kind === 'year' && (
            <input 
              type="number"
              value={period.year}
              onChange={(e) => onPeriodChange({ ...period, year: parseInt(e.target.value) })}
              className="text-sm w-24 p-1.5 bg-gray-50 rounded-lg outline-none border border-transparent focus:border-indigo-200"
            />
          )}

          {period.kind === 'range' && (
            <div className="flex items-center gap-2">
              <input 
                type="date"
                value={rangeStart}
                onChange={(e) => { setRangeStart(e.target.value); setRangeError(false); }}
                className={`text-sm p-1.5 bg-gray-50 rounded-lg outline-none border ${rangeError && !rangeStart ? 'border-red-300' : 'border-transparent'} focus:border-indigo-200`}
              />
              <span className="text-gray-400 text-xs">até</span>
              <input 
                type="date"
                value={rangeEnd}
                onChange={(e) => { setRangeEnd(e.target.value); setRangeError(false); }}
                className={`text-sm p-1.5 bg-gray-50 rounded-lg outline-none border ${rangeError && !rangeEnd ? 'border-red-300' : 'border-transparent'} focus:border-indigo-200`}
              />
              <button 
                onClick={handleApplyRange}
                className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm ml-1"
                title="Aplicar Período"
              >
                <Check size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
      {rangeError && (
        <span className="text-[10px] font-bold text-red-500 mr-2 animate-pulse flex items-center gap-1">
          <AlertCircle size={10} /> Informe as duas datas
        </span>
      )}
    </div>
  );
};
