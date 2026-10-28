import { COLLECTIONS } from '../lib/firebase/collections';
import type { Expense } from '../types/index';
import { createCollectionService } from './createCollectionService';

export const expensesService = createCollectionService<Expense>(COLLECTIONS.expenses);
