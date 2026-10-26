import { useCallback, useState } from 'react';
import type { AppNotification } from '../../../types/index';

const STORAGE_PREFIX = 'bethel.seenNotifications.';

// Firma de un aviso: si cambia su detalle (p. ej. otra clase sin costos), vuelve a contar como nuevo.
const getSignature = (notification: AppNotification) => `${notification.id}|${notification.title}|${notification.detail}`;

const readSeen = (storageKey: string) => {
  try {
    const storedValue = window.localStorage.getItem(storageKey);
    return new Set<string>(storedValue ? (JSON.parse(storedValue) as string[]) : []);
  } catch {
    return new Set<string>();
  }
};

// Qué avisos ya vio este usuario en este navegador (solo para el contador de la campana).
export const useSeenNotifications = (userKey: string, notifications: AppNotification[]) => {
  const storageKey = `${STORAGE_PREFIX}${userKey}`;
  const [seenState, setSeenState] = useState(() => ({ seen: readSeen(storageKey), storageKey }));
  const seen = seenState.storageKey === storageKey ? seenState.seen : readSeen(storageKey);

  const unseenCount = notifications.filter((notification) => !seen.has(getSignature(notification))).length;

  const markAllSeen = useCallback(() => {
    const signatures = notifications.map(getSignature);
    setSeenState({ seen: new Set(signatures), storageKey });
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(signatures));
    } catch {
      // Almacenamiento bloqueado: el contador se reinicia al recargar.
    }
  }, [notifications, storageKey]);

  return { isUnseen: (notification: AppNotification) => !seen.has(getSignature(notification)), markAllSeen, unseenCount };
};
