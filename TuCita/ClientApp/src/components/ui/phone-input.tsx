import * as React from 'react';
import { Input } from './input';
import { cn } from './utils';

export interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
  value?: string;
  onChange?: (value: string) => void;
  countryCode?: string;
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, value = '', onChange, countryCode = '+506', disabled, ...props }, ref) => {
    // Remover el prefijo del valor para mostrarlo limpio en el input
    const getPhoneWithoutPrefix = (phone: string) => {
      if (!phone) return '';
      const prefix = countryCode + ' ';
      return phone.startsWith(prefix) ? phone.slice(prefix.length) : phone.replace(countryCode, '').trim();
    };

    // Formatear el número mientras se escribe (####-####)
    const formatPhoneNumber = (phone: string) => {
      // Remover todo excepto números
      const numbers = phone.replace(/\D/g, '');
      
      // Limitar a 8 dígitos
      const limitedNumbers = numbers.slice(0, 8);
      
      // Formatear como ####-####
      if (limitedNumbers.length <= 4) {
        return limitedNumbers;
      }
      
      return `${limitedNumbers.slice(0, 4)}-${limitedNumbers.slice(4)}`;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const formatted = formatPhoneNumber(inputValue);
      const fullPhone = formatted ? `${countryCode} ${formatted}` : '';
      
      if (onChange) {
        onChange(fullPhone);
      }
    };

    const displayValue = getPhoneWithoutPrefix(value);

    return (
      <div className="relative">
        <div className={cn(
          "absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none",
          disabled && "opacity-50"
        )}>
          <span className="text-sm font-medium text-gray-700">{countryCode}</span>
          <span className="text-gray-400">|</span>
        </div>
        <Input
          ref={ref}
          type="tel"
          value={displayValue}
          onChange={handleChange}
          className={cn("pl-[4.5rem]", className)}
          placeholder="8888-8888"
          disabled={disabled}
          {...props}
        />
      </div>
    );
  }
);

PhoneInput.displayName = 'PhoneInput';

export { PhoneInput };
