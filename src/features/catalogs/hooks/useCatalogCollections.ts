import { useLiveCollection, type LiveCollectionState } from '../../../shared/data/liveCollections';
import type { CatalogKey, CatalogRecord } from '../../../types/index';

// Todos los catálogos en vivo (son listas cortas). Sirve para los contadores y para saber cuáles están vacíos.
export const useCatalogCollections = (): Record<CatalogKey, LiveCollectionState<CatalogRecord>> => {
  const banks = useLiveCollection('banks');
  const books = useLiveCollection('books');
  const classes = useLiveCollection('classes');
  const expenseCategories = useLiveCollection('expenseCategories');
  const incomeTypes = useLiveCollection('incomeTypes');
  const paymentTypes = useLiveCollection('paymentTypes');
  const subjects = useLiveCollection('subjects');
  const teachers = useLiveCollection('teachers');

  return { banks, books, classes, expenseCategories, incomeTypes, paymentTypes, subjects, teachers };
};
