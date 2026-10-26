import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
  type DocumentData,
  type UpdateData,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { CollectionName } from '../lib/firebase/collections';
import { typedConverter } from '../lib/firebase/typedConverter';
import type { NewRecord } from '../types/index';

// Métodos con sintaxis de método a propósito: así un CollectionService<Bank> se puede usar donde
// se espera un CollectionService<CatalogRecord> (pantalla genérica de catálogos).
export interface CollectionService<T extends { id: string }> {
  create(data: NewRecord<T>): Promise<string>;
  delete(id: string): Promise<void>;
  getAll(): Promise<T[]>;
  getOne(id: string): Promise<T | null>;
  // Crea o reemplaza el documento con un id conocido (planillas de asistencia y notas, perfiles por uid).
  set(id: string, data: NewRecord<T>): Promise<void>;
  update(id: string, changes: Partial<NewRecord<T>>): Promise<void>;
}

// Fábrica de services: cada colección tiene el suyo en services/<colección>Service.ts
// y lo crea con una línea. Las lecturas van tipadas con typedConverter.
export const createCollectionService = <T extends { id: string }>(
  collectionName: CollectionName,
): CollectionService<T> => {
  const rawCollection = collection(db, collectionName);
  const typedCollection = rawCollection.withConverter(typedConverter<T>());

  return {
    create: async (data) => {
      const createdDoc = await addDoc(rawCollection, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return createdDoc.id;
    },
    delete: async (id) => {
      await deleteDoc(doc(rawCollection, id));
    },
    getAll: async () => {
      const snapshot = await getDocs(typedCollection);
      return snapshot.docs.map((document) => document.data());
    },
    getOne: async (id) => {
      const snapshot = await getDoc(doc(typedCollection, id));
      return snapshot.exists() ? snapshot.data() : null;
    },
    set: async (id, data) => {
      await setDoc(doc(rawCollection, id), { ...data, updatedAt: serverTimestamp() });
    },
    update: async (id, changes) => {
      await updateDoc(doc(rawCollection, id), {
        ...changes,
        updatedAt: serverTimestamp(),
      } as UpdateData<DocumentData>);
    },
  };
};
