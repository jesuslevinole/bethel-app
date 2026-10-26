import type { AppUser } from './appUsers';
import type { Role } from './roles';

// Propietario del sistema: admin_users/{uid}, se crea a mano en la consola de Firebase.
// Tiene todos los permisos siempre, aunque se borren o cambien los roles (nunca queda nadie fuera).
export interface AdminUser {
  email: string;
  id: string;
  name: string;
}

export type SessionStatus = 'loading' | 'noAccess' | 'ready' | 'signedOut';

// Por qué no hay acceso:
// missingProfile = la cuenta no tiene usuario en la app; inactive = usuario desactivado;
// missingRole = su rol ya no existe; rulesBlocked = Firestore negó la lectura (reglas sin publicar).
export type AccessIssue = 'inactive' | 'missingProfile' | 'missingRole' | 'rulesBlocked';

export interface AppSession {
  accessIssue: AccessIssue | null;
  appUser: AppUser | null;
  email: string | null;
  isOwner: boolean;
  owner: AdminUser | null;
  role: Role | null;
  status: SessionStatus;
  uid: string | null;
}
