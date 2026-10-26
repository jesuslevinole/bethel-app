import { COLLECTIONS } from '../lib/firebase/collections';
import type { Bank } from '../types/index';
import { createCollectionService } from './createCollectionService';

export const banksService = createCollectionService<Bank>(COLLECTIONS.banks);
