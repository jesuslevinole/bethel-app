import { COLLECTIONS } from '../lib/firebase/collections';
import type { Enrollment } from '../types/index';
import { createCollectionService } from './createCollectionService';

export const enrollmentsService = createCollectionService<Enrollment>(COLLECTIONS.enrollments);
