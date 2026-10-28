import { NAVIGATION_ITEMS } from '../../components/layout/navigation';
import type { AppSettings } from '../../types/index';
import type { NavigationSettings } from './services/appSettingsRecords';

// Una fila del editor del menú: un ítem (ruta) o una lista desplegable.
export interface MenuRow {
  defaultLabel: string;
  key: string;
  kind: 'group' | 'item';
  label: string;
  // Lista desplegable donde va el ítem ('' = menú principal). Las listas siempre van en el menú principal.
  parent: string;
}

export const NEW_GROUP_LABEL = 'Lista nueva';

// Filas en el orden guardado (lo que no está en el orden va al final, en el orden original).
export const toMenuRows = (settings: AppSettings | null): MenuRow[] => {
  const groupIds = new Set((settings?.navGroups ?? []).map((group) => group.id));
  const itemRows: MenuRow[] = NAVIGATION_ITEMS.map((item) => ({
    defaultLabel: item.label,
    key: item.path,
    kind: 'item',
    label: settings?.navLabels?.[item.path] ?? item.label,
    parent: groupIds.has(settings?.navParents?.[item.path] ?? '') ? (settings?.navParents?.[item.path] ?? '') : '',
  }));
  const groupRows: MenuRow[] = (settings?.navGroups ?? []).map((group) => ({
    defaultLabel: group.label,
    key: group.id,
    kind: 'group',
    label: group.label,
    parent: '',
  }));
  const rows = [...itemRows, ...groupRows];
  const order = settings?.navOrder ?? [];
  const rankOf = (row: MenuRow) => {
    const savedIndex = order.indexOf(row.key);
    return savedIndex >= 0 ? savedIndex : order.length + rows.indexOf(row);
  };
  return [...rows].sort((first, second) => rankOf(first) - rankOf(second));
};

// Lo que se guarda: el orden de todas las filas, los nombres cambiados, las listas y qué va en cada una.
export const toNavigationSettings = (rows: MenuRow[]): NavigationSettings => {
  const groupRows = rows.filter((row) => row.kind === 'group');
  const groupIds = new Set(groupRows.map((row) => row.key));
  const itemRows = rows.filter((row) => row.kind === 'item');
  return {
    navGroups: groupRows.map((row) => ({ id: row.key, label: row.label.trim() || NEW_GROUP_LABEL })),
    navLabels: Object.fromEntries(
      itemRows
        .filter((row) => row.label.trim() && row.label.trim() !== row.defaultLabel)
        .map((row) => [row.key, row.label.trim()]),
    ),
    navOrder: rows.map((row) => row.key),
    navParents: Object.fromEntries(
      itemRows.filter((row) => groupIds.has(row.parent)).map((row) => [row.key, row.parent]),
    ),
  };
};

export const createGroupRow = (): MenuRow => ({
  defaultLabel: NEW_GROUP_LABEL,
  key: `lista-${Date.now().toString(36)}`,
  kind: 'group',
  label: NEW_GROUP_LABEL,
  parent: '',
});

// Mueve una fila de una posición a otra.
export const moveRow = (rows: MenuRow[], fromIndex: number, toIndex: number) => {
  if (fromIndex === toIndex || toIndex < 0 || toIndex >= rows.length) return rows;
  const nextRows = [...rows];
  const [movedRow] = nextRows.splice(fromIndex, 1);
  nextRows.splice(toIndex, 0, movedRow);
  return nextRows;
};

// Al borrar una lista, sus ítems vuelven al menú principal.
export const removeGroupRow = (rows: MenuRow[], groupKey: string) =>
  rows.filter((row) => row.key !== groupKey).map((row) => (row.parent === groupKey ? { ...row, parent: '' } : row));

// Pone un ítem dentro de una lista (y lo mueve justo debajo de ella y de sus otros ítems, para que se vea junto)
// o lo saca al menú principal (se queda donde está).
export const setRowParent = (rows: MenuRow[], key: string, parent: string) => {
  const updatedRows = rows.map((row) => (row.key === key ? { ...row, parent } : row));
  if (!parent) return updatedRows;
  const movingRow = updatedRows.find((row) => row.key === key);
  if (!movingRow) return updatedRows;
  const otherRows = updatedRows.filter((row) => row.key !== key);
  const groupIndex = otherRows.findIndex((row) => row.key === parent);
  let insertIndex = groupIndex + 1;
  while (insertIndex < otherRows.length && otherRows[insertIndex].parent === parent) insertIndex += 1;
  return [...otherRows.slice(0, insertIndex), movingRow, ...otherRows.slice(insertIndex)];
};
