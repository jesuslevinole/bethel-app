import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  where,
  writeBatch,
  type QueryConstraint,
} from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { COLLECTIONS } from '../../../lib/firebase/collections';
import { typedConverter } from '../../../lib/firebase/typedConverter';
import { attendanceService } from '../../../services/attendanceService';
import { gradesService } from '../../../services/gradesService';
import type { AttendanceSheet, SessionDraft, StudentScores, TeachingGroup } from '../../../types/index';
import { getAttendanceSheetId, getGradeSheetId } from '../sheetIds';

// El teacherId viaja en cada planilla: las reglas solo dejan a un maestro escribir las suyas.
const getGroupFields = (group: TeachingGroup) => ({
  assignmentId: group.assignment.id,
  classId: group.assignment.classId,
  periodId: group.assignment.periodId,
  subjectId: group.subjectId,
  teacherId: group.assignment.teacherId,
});

// Todas las clases (fechas) de un grupo, en vivo. Con "propios" la consulta lleva el teacherId del maestro:
// sin ese filtro las reglas la rechazan.
export const listenToGroupSessions = (
  assignmentId: string,
  subjectId: string,
  ownTeacherId: string | null,
  onChange: (sessions: AttendanceSheet[]) => void,
  onError: (code: string) => void,
) => {
  const constraints: QueryConstraint[] = [
    where('assignmentId', '==', assignmentId),
    where('subjectId', '==', subjectId),
  ];
  if (ownTeacherId) constraints.push(where('teacherId', '==', ownTeacherId));
  const sessionsQuery = query(
    collection(db, COLLECTIONS.attendance).withConverter(typedConverter<AttendanceSheet>()),
    ...constraints,
  );
  return onSnapshot(
    sessionsQuery,
    (snapshot) => onChange(snapshot.docs.map((document) => document.data()).sort((first, second) => first.date.localeCompare(second.date))),
    (error) => {
      console.error('Hoja de asistencia:', error);
      onError(error.code);
    },
  );
};

// Guarda varias clases de la hoja de una vez (todo o nada).
export const saveAttendanceSessions = async (group: TeachingGroup, drafts: Record<string, SessionDraft>) => {
  const batch = writeBatch(db);
  Object.entries(drafts).forEach(([date, draft]) => {
    const sheetRef = doc(db, COLLECTIONS.attendance, getAttendanceSheetId(group.assignment.id, group.subjectId, date));
    batch.set(sheetRef, { ...getGroupFields(group), ...draft, date, updatedAt: serverTimestamp() });
  });
  await batch.commit();
};

export const deleteAttendanceSession = async (group: TeachingGroup, date: string) => {
  await attendanceService.delete(getAttendanceSheetId(group.assignment.id, group.subjectId, date));
};

export const saveGrades = async (group: TeachingGroup, scores: Record<string, StudentScores>) => {
  await gradesService.set(getGradeSheetId(group.assignment.id, group.subjectId), {
    ...getGroupFields(group),
    scores,
  });
};
