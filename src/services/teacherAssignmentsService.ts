import { COLLECTIONS } from '../lib/firebase/collections';
import type { TeacherAssignment } from '../types/index';
import { createCollectionService } from './createCollectionService';

export const teacherAssignmentsService = createCollectionService<TeacherAssignment>(COLLECTIONS.teacherAssignments);
