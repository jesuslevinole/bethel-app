import { COLLECTIONS } from '../lib/firebase/collections';
import type { Teacher } from '../types/index';
import { createCollectionService } from './createCollectionService';

export const teachersService = createCollectionService<Teacher>(COLLECTIONS.teachers);
