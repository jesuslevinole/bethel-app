import { COLLECTIONS } from '../lib/firebase/collections';
import type { Subject } from '../types/index';
import { createCollectionService } from './createCollectionService';

export const subjectsService = createCollectionService<Subject>(COLLECTIONS.subjects);
