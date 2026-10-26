import type { CatalogItem } from '../types/index';

export const DELETED_LABEL = 'Eliminado';

export const buildNameMap = (items: CatalogItem[]) => new Map(items.map((item) => [item.id, item.name]));

// Nunca muestres el id crudo de un registro borrado: se ve como "Eliminado".
export const getRelationName = (nameMap: Map<string, string>, id: string) => nameMap.get(id) ?? DELETED_LABEL;
