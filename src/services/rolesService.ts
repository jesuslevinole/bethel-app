import { COLLECTIONS } from '../lib/firebase/collections';
import type { Role } from '../types/index';
import { createCollectionService } from './createCollectionService';

export const rolesService = createCollectionService<Role>(COLLECTIONS.roles);
