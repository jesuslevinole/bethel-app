import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import type { CollectionName } from '../../lib/firebase/collections';
import { UserFacingError } from '../../utils/userFacingError';

export interface ReferenceCheck {
  collectionName: CollectionName;
  field: string;
  label: string;
  operator: '==' | 'array-contains';
}

// Busca si algún registro apunta al id (lee como máximo 1 documento por revisión).
const findFirstReference = async (checks: ReferenceCheck[], id: string) => {
  for (const check of checks) {
    const referenceQuery = query(collection(db, check.collectionName), where(check.field, check.operator, id), limit(1));
    const snapshot = await getDocs(referenceQuery);
    if (!snapshot.empty) return check.label;
  }
  return null;
};

// Antes de borrar algo que otros registros usan: avisa dónde está en uso en vez de dejarlos huérfanos.
export const assertNotReferenced = async (checks: ReferenceCheck[], id: string) => {
  const usedIn = await findFirstReference(checks, id);
  if (usedIn) throw new UserFacingError(`No se puede eliminar porque está en uso en ${usedIn}. Quítalo de ahí primero.`);
};
