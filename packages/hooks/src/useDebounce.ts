import { useEffect, useRef, useState } from "react";

export const useDebounce = (value: string, delay = 500): string => {
  const [debouncedValue, setDebouncedValue] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => setDebouncedValue(value), delay);

    return () => {
      timerRef.current && clearTimeout(timerRef.current);
    };
  }, [value, delay]);

  return debouncedValue;
};
