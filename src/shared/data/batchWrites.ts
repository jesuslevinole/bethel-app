import { collection, doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '../../config/firebase';
import type { CollectionName } from '../../lib/firebase/collections';

const BATCH_LIMIT = 500;

export interface CreateOperation {
  collectionName: CollectionName;
  data: Record<string, unknown>;
  // Id ya generado (con newDocumentId) cuando otro documento del mismo lote necesita apuntarle.
  id?: string;
}

export interface UpdateOperation {
  collectionName: CollectionName;
  data: Record<string, unknown>;
  id: string;
}

// Id de Firestore generado en el cliente, antes de escribir.
export const newDocumentId = (collectionName: CollectionName) => doc(collection(db, collectionName)).id;

// Crea muchos documentos en tandas de 500 (límite de Firestore por batch).
export const createInChunks = async (operations: CreateOperation[]) => {
  for (let start = 0; start < operations.length; start += BATCH_LIMIT) {
    const batch = writeBatch(db);
    operations.slice(start, start + BATCH_LIMIT).forEach(({ collectionName, data, id }) => {
      const documentRef = id ? doc(db, collectionName, id) : doc(collection(db, collectionName));
      batch.set(documentRef, { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    });
    await batch.commit();
  }
};

// Actualiza muchos documentos en tandas de 500.
export const updateInChunks = async (operations: UpdateOperation[]) => {
  for (let start = 0; start < operations.length; start += BATCH_LIMIT) {
    const batch = writeBatch(db);
    operations.slice(start, start + BATCH_LIMIT).forEach(({ collectionName, data, id }) => {
      batch.update(doc(db, collectionName, id), { ...data, updatedAt: serverTimestamp() });
    });
    await batch.commit();
  }
};

export interface DeleteOperation {
  collectionName: CollectionName;
  id: string;
}

// Borra muchos documentos en tandas de 500.
export const deleteInChunks = async (operations: DeleteOperation[]) => {
  for (let start = 0; start < operations.length; start += BATCH_LIMIT) {
    const batch = writeBatch(db);
    operations.slice(start, start + BATCH_LIMIT).forEach(({ collectionName, id }) => {
      batch.delete(doc(db, collectionName, id));
    });
    await batch.commit();
  }
};
