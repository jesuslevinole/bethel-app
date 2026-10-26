import { useCallback, useSyncExternalStore } from 'react';

// Teléfono: dibuja SOLO las tarjetas; escritorio SOLO la tabla. Nunca las dos escondiendo una por CSS.
export const PHONE_QUERY = '(max-width: 760px)';

export const useMediaQuery = (query: string) => {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mediaList = window.matchMedia(query);
      mediaList.addEventListener('change', onChange);
      return () => mediaList.removeEventListener('change', onChange);
    },
    [query],
  );
  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);
  return useSyncExternalStore(subscribe, getSnapshot);
};
