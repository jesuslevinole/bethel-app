import { COLLECTIONS } from '../lib/firebase/collections';
import type { TeacherUser } from '../types/index';
import { createCollectionService } from './createCollectionService';

export const teacherUsersService = createCollectionService<TeacherUser>(COLLECTIONS.teacherUsers);
