import { deleteField, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { COLLECTIONS } from '../../../lib/firebase/collections';
import type { NavGroup } from '../../../types/index';
import { APP_SETTINGS_DOC_ID } from '../appSettingsContext';

const settingsRef = () => doc(db, COLLECTIONS.appSettings, APP_SETTINGS_DOC_ID);

export interface NavigationSettings {
  navGroups: NavGroup[];
  navLabels: Record<string, string>;
  navOrder: string[];
  navParents: Record<string, string>;
}

const NAVIGATION_FIELDS = ['navGroups', 'navLabels', 'navOrder', 'navParents', 'updatedAt'];

// Guarda el menú completo de una vez (orden, nombres, listas y qué va dentro de cada una).
// mergeFields reemplaza esos campos enteros: un nombre borrado no se queda del guardado anterior.
export const saveNavigationSettings = async (navigation: NavigationSettings) => {
  await setDoc(settingsRef(), { ...navigation, updatedAt: serverTimestamp() }, { mergeFields: NAVIGATION_FIELDS });
};

// Vuelve al menú original (sin borrar los nombres de columnas).
export const resetNavigationSettings = async () => {
  await setDoc(
    settingsRef(),
    {
      navGroups: deleteField(),
      navLabels: deleteField(),
      navOrder: deleteField(),
      navParents: deleteField(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
};

// Nombres de las columnas de UNA tabla (las vacías vuelven al nombre original).
export const saveColumnLabels = async (tableId: string, labels: Record<string, string>) => {
  const cleanLabels = Object.fromEntries(
    Object.entries(labels)
      .map(([columnKey, label]) => [columnKey, label.trim()])
      .filter(([, label]) => label),
  );
  const tableField = `columnLabels.${tableId}`;
  await setDoc(
    settingsRef(),
    {
      columnLabels: { [tableId]: Object.keys(cleanLabels).length > 0 ? cleanLabels : deleteField() },
      updatedAt: serverTimestamp(),
    },
    { mergeFields: [tableField, 'updatedAt'] },
  );
};
