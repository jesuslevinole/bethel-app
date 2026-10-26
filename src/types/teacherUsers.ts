// Acceso de un maestro: teacher_users/{uid de Auth}. Lo crea Administración desde "Accesos de maestros".
export interface TeacherUser {
  email: string;
  id: string;
  name: string;
  teacherId: string;
}
