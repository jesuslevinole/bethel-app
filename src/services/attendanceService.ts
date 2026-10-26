import { COLLECTIONS } from '../lib/firebase/collections';
import type { AttendanceSheet } from '../types/index';
import { createCollectionService } from './createCollectionService';

export const attendanceService = createCollectionService<AttendanceSheet>(COLLECTIONS.attendance);
