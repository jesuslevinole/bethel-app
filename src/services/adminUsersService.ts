import { COLLECTIONS } from '../lib/firebase/collections';
import type { AdminUser } from '../types/index';
import { createCollectionService } from './createCollectionService';

export const adminUsersService = createCollectionService<AdminUser>(COLLECTIONS.adminUsers);
