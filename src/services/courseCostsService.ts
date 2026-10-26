import { COLLECTIONS } from '../lib/firebase/collections';
import type { CourseCost } from '../types/index';
import { createCollectionService } from './createCollectionService';

export const courseCostsService = createCollectionService<CourseCost>(COLLECTIONS.courseCosts);
