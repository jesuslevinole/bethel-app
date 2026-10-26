import type { CatalogItem, SelectOption } from '../types/index';

export const toSelectOptions = (items: CatalogItem[]): SelectOption[] =>
  items.map((item) => ({ label: item.name, value: item.id }));
