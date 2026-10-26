import { COLLECTIONS } from '../lib/firebase/collections';
import type { PaymentType } from '../types/index';
import { createCollectionService } from './createCollectionService';

export const paymentTypesService = createCollectionService<PaymentType>(COLLECTIONS.paymentTypes);
