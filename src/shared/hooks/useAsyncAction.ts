import { useCallback, useState } from 'react';
import { getErrorMessage } from '../../utils/firebaseErrors';

// Envuelve una escritura: marca "guardando", traduce el error y devuelve si salió bien.
export const useAsyncAction = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async (action: () => Promise<void>, fallbackMessage?: string) => {
    setIsRunning(true);
    setError(null);
    try {
      await action();
      return true;
    } catch (caughtError) {
      console.error(caughtError);
      setError(getErrorMessage(caughtError, fallbackMessage));
      return false;
    } finally {
      setIsRunning(false);
    }
  }, []);

  return { error, isRunning, run, setError };
};
