import { useCallback, useState } from 'react';

const STORAGE_KEY = 'bethel.selectedPeriodId';

const readStoredId = () => {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

// Recuerda en este navegador el período que eligió el usuario (solo comodidad; si falla, se usa el vigente).
export const useStoredPeriodId = () => {
  const [storedId, setStoredId] = useState<string | null>(readStoredId);

  const storePeriodId = useCallback((periodId: string) => {
    setStoredId(periodId);
    try {
      window.localStorage.setItem(STORAGE_KEY, periodId);
    } catch {
      // Navegación privada o almacenamiento bloqueado: se queda solo en memoria.
    }
  }, []);

  return { storePeriodId, storedId };
};
