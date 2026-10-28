import { COLLECTIONS } from '../lib/firebase/collections';
import type { AdmissionApplication } from '../types/index';
import { createCollectionService } from './createCollectionService';

export const admissionApplicationsService = createCollectionService<AdmissionApplication>(COLLECTIONS.admissionApplications);
