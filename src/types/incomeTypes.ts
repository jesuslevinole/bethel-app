import type { CatalogItem } from './catalogItem';

// Tipo de ingreso: Cash, Check, Deposit Direct… `usesBank` indica si pide banco al registrar.
export interface IncomeType extends CatalogItem {
  usesBank: boolean;
}
