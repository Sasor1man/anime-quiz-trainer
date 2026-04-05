import { useState, useEffect } from 'react';

/**
 * Возвращает отложенное значение. Полезно для оптимизации API-запросов.
 * @param value Исходное значение
 * @param delay Задержка в мс (по умолчанию 500)
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}