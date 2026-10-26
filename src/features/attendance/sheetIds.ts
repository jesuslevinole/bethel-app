// Ids fijos de las planillas: se pueden abrir y guardar sin buscar (una lectura por planilla).
export const getAttendanceSheetId = (assignmentId: string, subjectId: string, date: string) =>
  `${assignmentId}_${subjectId}_${date}`;

export const getGradeSheetId = (assignmentId: string, subjectId: string) => `${assignmentId}_${subjectId}`;
