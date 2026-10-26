import { COLLECTIONS } from '../lib/firebase/collections';
import type { AppUser } from '../types/index';
import { createCollectionService } from './createCollectionService';

export const appUsersService = createCollectionService<AppUser>(COLLECTIONS.appUsers);
