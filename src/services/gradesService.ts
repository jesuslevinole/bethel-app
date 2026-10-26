import { COLLECTIONS } from '../lib/firebase/collections';
import type { GradeSheet } from '../types/index';
import { createCollectionService } from './createCollectionService';

export const gradesService = createCollectionService<GradeSheet>(COLLECTIONS.grades);
