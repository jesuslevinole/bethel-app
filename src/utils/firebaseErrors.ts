import { UserFacingError } from './userFacingError';

// Mensajes claros para los errores de Firebase que puede ver un administrador.
const ERROR_MESSAGES: Record<string, string> = {
  'auth/email-already-in-use': 'Ese correo ya tiene una cuenta. Entra con él o usa "Olvidé mi contraseña".',
  'auth/invalid-credential': 'El correo o la contraseña no coinciden.',
  'auth/invalid-email': 'Escribe un correo válido.',
  'auth/network-request-failed': 'Sin conexión. Revisa el internet e intenta de nuevo.',
  'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
  'auth/too-many-requests': 'Demasiados intentos. Espera unos minutos e intenta de nuevo.',
  'permission-denied': 'Tu usuario no tiene permiso para esta acción.',
  unavailable: 'Sin conexión con la base de datos. Intenta de nuevo en un momento.',
};

export const getErrorMessage = (error: unknown, fallback = 'No se pudo completar la acción. Intenta de nuevo.') => {
  if (error instanceof UserFacingError) return error.message;
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
  return ERROR_MESSAGES[code] ?? fallback;
};
