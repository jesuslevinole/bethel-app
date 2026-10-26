import type {
  DocumentData,
  FirestoreDataConverter,
  PartialWithFieldValue,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from 'firebase/firestore';

// Tipa una colección una sola vez: el id del documento viaja como campo `id` al leer
// y se quita al escribir (nunca se guarda dentro del documento).
export const typedConverter = <T extends { id: string }>(): FirestoreDataConverter<T, DocumentData> => ({
  fromFirestore: (snapshot: QueryDocumentSnapshot<DocumentData>, options?: SnapshotOptions) =>
    ({ ...snapshot.data(options), id: snapshot.id }) as T,
  toFirestore: (model: PartialWithFieldValue<T>) => {
    const { id, ...data } = model as Record<string, unknown>;
    return data;
  },
});
