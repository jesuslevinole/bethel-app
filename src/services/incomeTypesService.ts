import { COLLECTIONS } from '../lib/firebase/collections';
import type { IncomeType } from '../types/index';
import { createCollectionService } from './createCollectionService';

export const incomeTypesService = createCollectionService<IncomeType>(COLLECTIONS.incomeTypes);
