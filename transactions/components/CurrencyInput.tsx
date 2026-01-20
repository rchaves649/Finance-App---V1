
import React, { useState, useEffect } from 'react';
import { formatCurrency, parseCurrency } from '../../shared/formatUtils';

interface CurrencyInputProps {
  value: number;
  disabled: boolean;
  isValid: boolean;
  onChange: (val: number) => void;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({ value, disabled, isValid, onChange }) => {
  const [displayValue, setDisplayValue] = useState(formatCurrency(value));

  // Sincroniza com a prop se mudar externamente
  useEffect(() => {
    setDisplayValue(formatCurrency(value));
  }, [value]);

  const handleBlur = () => {
    const parsed = parseCurrency(displayValue);
    onChange(parsed);
    setDisplayValue(formatCurrency(parsed));
  };

  return (
    <input 
      type="text" 
      disabled={disabled}
      value={displayValue}
      onFocus={(e) => {
        // Mostra o número puro ao focar para facilitar a edição
        if (!disabled) setDisplayValue(value > 0 ? value.toString() : '');
      }}
      onChange={(e) => setDisplayValue(e.target.value)}
      onBlur={handleBlur}
      placeholder="R$ 0,00"
      className={`w-32 p-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
        !isValid && !disabled ? 'border-red-300 ring-1 ring-red-100' : ''
      } ${disabled ? 'bg-gray-50 opacity-60 cursor-not-allowed' : ''}`}
    />
  );
};
