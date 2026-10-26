// Foto del alumno comprimida (JPEG en data URL, ~30 KB) en student_photos/{studentId}.
// Va aparte de `students` para que la lista de alumnos no descargue las fotos.
export interface StudentPhoto {
  dataUrl: string;
  id: string;
}
