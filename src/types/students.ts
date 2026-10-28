export interface Student {
  address: string;
  // Solicitud de admisión de la que salió (id = uid de la cuenta del estudiante).
  applicationId?: string;
  birthDate?: string;
  church: string;
  city: string;
  code: string;
  email?: string;
  id: string;
  // Alumno cargado como dato de prueba (Importar alumnos): se borra con "Eliminar datos de prueba".
  isTest?: boolean;
  name: string;
  pastor: string;
  phone?: string;
}
