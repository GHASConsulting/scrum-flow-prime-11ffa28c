import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';

interface DebouncedInputProps {
  value: string;
  onChange: (value: string) => void;
  delay?: number;
  className?: string;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}

export function DebouncedInput({
  value: externalValue,
  onChange,
  delay = 500,
  className,
  placeholder,
  type = 'text',
  disabled = false,
}: DebouncedInputProps) {
  const [internalValue, setInternalValue] = useState(externalValue);

  // Sync internal value when external value changes (e.g., from server)
  useEffect(() => {
    setInternalValue(externalValue);
  }, [externalValue]);

  // Debounced save
  useEffect(() => {
    if (internalValue === externalValue) return;
    
    const timer = setTimeout(() => {
      onChange(internalValue);
    }, delay);

    return () => clearTimeout(timer);
  }, [internalValue, delay, onChange, externalValue]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(e.target.value);
  }, []);

  const handleBlur = useCallback(() => {
    // Save immediately on blur
    if (internalValue !== externalValue) {
      onChange(internalValue);
    }
  }, [internalValue, externalValue, onChange]);

  return (
    <Input
      type={type}
      value={internalValue}
      onChange={handleChange}
      onBlur={handleBlur}
      className={className}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
}
