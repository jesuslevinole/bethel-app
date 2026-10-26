import { COLLECTIONS } from '../lib/firebase/collections';
import type { Student } from '../types/index';
import { createCollectionService } from './createCollectionService';

export const studentsService = createCollectionService<Student>(COLLECTIONS.students);
