// Mitad de un período académico (primer y segundo semestre).
export interface AcademicSemester {
  endDate: string;
  startDate: string;
}

// Período académico (p. ej. "Julio 2026 – Abril 2027") con sus dos semestres. Costos, materias,
// inscripciones, asistencia y notas pertenecen a uno por su `periodId`.
// semesters puede faltar en períodos creados antes: se usa el período completo (getPeriodRanges).
export interface AcademicPeriod {
  endDate: string;
  id: string;
  name: string;
  semesters?: AcademicSemester[];
  startDate: string;
}
