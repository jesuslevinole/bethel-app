import { COLLECTIONS } from '../lib/firebase/collections';
import type { Book } from '../types/index';
import { createCollectionService } from './createCollectionService';

export const booksService = createCollectionService<Book>(COLLECTIONS.books);
