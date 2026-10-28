import { COLLECTIONS } from '../lib/firebase/collections';
import type { EnrollmentRequest } from '../types/index';
import { createCollectionService } from './createCollectionService';

export const enrollmentRequestsService = createCollectionService<EnrollmentRequest>(COLLECTIONS.enrollmentRequests);
