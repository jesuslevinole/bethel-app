// Usuario de la app: app_users/{uid de Auth}. Lo crea quien tenga permiso en Usuarios.
// teacherId / studentId lo ligan a su registro: con eso "ver solo los propios" sabe qué es suyo.
export interface AppUser {
  active: boolean;
  email: string;
  id: string;
  // Usuario de prueba: se puede crear sin correo (se le genera uno interno @bethel.test para entrar).
  isTest?: boolean;
  name: string;
  roleId: string;
  // Cuenta creada por el propio estudiante desde "Crear mi cuenta" (rol Estudiante, sin alumno hasta que
  // Administración apruebe su solicitud de admisión).
  selfRegistered?: boolean;
  studentId: string | null;
  teacherId: string | null;
}
