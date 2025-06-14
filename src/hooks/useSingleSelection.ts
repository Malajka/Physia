import { useCallback, useState } from "react";

export function useSingleSelection<T>() {
  const [selected, setSelected] = useState<T | null>(null);

  const toggle = useCallback((value: T) => {
    setSelected((prev) => (prev === value ? null : value));
  }, []);

  return { selected, toggle };
}
