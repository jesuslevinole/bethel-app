import { COLLECTIONS } from '../lib/firebase/collections';
import type { BookMovement } from '../types/index';
import { createCollectionService } from './createCollectionService';

export const bookMovementsService = createCollectionService<BookMovement>(COLLECTIONS.bookMovements);
