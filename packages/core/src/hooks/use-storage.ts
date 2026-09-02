"use client";

import { useCallback, useMemo } from "react";
import { StorageManager } from "../engines/storage-manager";

export function useStorage(
  prefix = "itsjust",
  options: { onQuotaExceeded?: (key: string) => void } = {},
) {
  const { onQuotaExceeded } = options;
  const manager = useMemo(
    () => new StorageManager(prefix, "1.0.0", 2048, { onQuotaExceeded }),
    [prefix, onQuotaExceeded],
  );

  const save = useCallback(
    <T>(key: string, data: T) => manager.save(key, data),
    [manager],
  );

  const load = useCallback(<T>(key: string) => manager.load<T>(key), [manager]);

  const clear = useCallback((key: string) => manager.remove(key), [manager]);

  return { save, load, clear };
}
