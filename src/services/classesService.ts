import { COLLECTIONS } from '../lib/firebase/collections';
import type { SchoolClass } from '../types/index';
import { createCollectionService } from './createCollectionService';

export const classesService = createCollectionService<SchoolClass>(COLLECTIONS.classes);
