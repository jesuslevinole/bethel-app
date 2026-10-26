import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { db } from '../../config/firebase';
import type { CollectionName } from '../../lib/firebase/collections';
import { typedConverter } from '../../lib/firebase/typedConverter';

interface LiveDocumentState<T> {
  data: T | null;
  documentKey: string | null;
  error: string | null;
}

// Un documento puntual en vivo (planilla de asistencia del día, planilla de notas, foto de un alumno).
// documentId null = no escuchar nada.
export const useLiveDocument = <T extends { id: string }>(collectionName: CollectionName, documentId: string | null) => {
  const [state, setState] = useState<LiveDocumentState<T>>({ data: null, documentKey: null, error: null });
  const documentKey = documentId ? `${collectionName}/${documentId}` : null;

  useEffect(() => {
    if (!documentId) return undefined;
    const documentRef = doc(db, collectionName, documentId).withConverter(typedConverter<T>());
    return onSnapshot(
      documentRef,
      (snapshot) => {
        setState({ data: snapshot.exists() ? snapshot.data() : null, documentKey: `${collectionName}/${documentId}`, error: null });
      },
      (error) => {
        console.error(`Documento ${collectionName}/${documentId}:`, error);
        setState({ data: null, documentKey: `${collectionName}/${documentId}`, error: error.code });
      },
    );
  }, [collectionName, documentId]);

  // Mientras llega el documento nuevo no se muestra el anterior (otro día u otra materia).
  // Objeto estable entre renders: quien lo use en dependencias (useMemo, contextos) no recalcula de más.
  const isCurrent = state.documentKey === documentKey;
  return useMemo(
    () => ({
      data: isCurrent ? state.data : null,
      error: isCurrent ? state.error : null,
      isLoading: Boolean(documentKey) && !isCurrent,
    }),
    [documentKey, isCurrent, state.data, state.error],
  );
};
