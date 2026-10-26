import { COLLECTIONS } from '../lib/firebase/collections';
import type { Payment } from '../types/index';
import { createCollectionService } from './createCollectionService';

export const paymentsService = createCollectionService<Payment>(COLLECTIONS.payments);
