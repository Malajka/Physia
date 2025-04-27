import { useCallback, useState } from "react";

/**
 * Manages a single selectable value with max-one constraint.
 */
export function useSingleSelection<T>() {
  const [selected, setSelected] = useState<T | null>(null);

  const toggle = useCallback((value: T) => {
    // Just update the selected value, always allowing only one selection
    setSelected((prev) => (prev === value ? null : value));
  }, []);

  return { selected, toggle };
}
