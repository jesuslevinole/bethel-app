// Alumno en la lista de un grupo: copia de nombre y código para que el maestro no necesite leer Alumnos.
export interface RosterStudent {
  code: string;
  id: string;
  name: string;
}

// Registro de materias: un maestro, un período académico, una clase y varias materias en un solo registro.
// roster = alumnos inscritos en esa clase y período; se actualiza solo (features/teacher-assignments/services/rosterSync.ts).
export interface TeacherAssignment {
  classId: string;
  date: string;
  id: string;
  periodId: string;
  roster?: RosterStudent[];
  subjectIds: string[];
  teacherId: string;
}
