import { COLLECTIONS } from '../lib/firebase/collections';
import type { ExpenseCategory } from '../types/index';
import { createCollectionService } from './createCollectionService';

export const expenseCategoriesService = createCollectionService<ExpenseCategory>(COLLECTIONS.expenseCategories);
