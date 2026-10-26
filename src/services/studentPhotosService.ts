import { COLLECTIONS } from '../lib/firebase/collections';
import type { StudentPhoto } from '../types/index';
import { createCollectionService } from './createCollectionService';

export const studentPhotosService = createCollectionService<StudentPhoto>(COLLECTIONS.studentPhotos);
