import { COLLECTIONS } from '../lib/firebase/collections';
import type { AcademicPeriod } from '../types/index';
import { createCollectionService } from './createCollectionService';

export const academicPeriodsService = createCollectionService<AcademicPeriod>(COLLECTIONS.academicPeriods);
