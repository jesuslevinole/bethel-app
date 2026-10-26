import type { User } from 'firebase/auth';
import type { AdminUser, AppSession, AppUser, Role } from '../../types/index';
import { INITIAL_SESSION } from './appSessionContext';

export interface OwnerLookup {
  failed: boolean;
  owner: AdminUser | null;
  uid: string;
}

export interface LiveDocumentResult<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
}

interface SessionSources {
  appUser: LiveDocumentResult<AppUser>;
  authUser: User | null | undefined;
  ownerLookup: OwnerLookup | null;
  role: LiveDocumentResult<Role>;
}

// Arma la sesión paso a paso: cuenta de Auth → ¿propietario? → usuario de la app → su rol.
// authUser undefined = Firebase aún no responde si hay sesión; null = no hay sesión.
export const buildAppSession = ({ appUser, authUser, ownerLookup, role }: SessionSources): AppSession => {
  if (authUser === undefined) return INITIAL_SESSION;
  if (authUser === null) return { ...INITIAL_SESSION, status: 'signedOut' };

  const base: AppSession = { ...INITIAL_SESSION, email: authUser.email, uid: authUser.uid };
  if (ownerLookup?.uid !== authUser.uid) return base;
  if (ownerLookup.failed) return { ...base, accessIssue: 'rulesBlocked', status: 'noAccess' };
  if (ownerLookup.owner) return { ...base, isOwner: true, owner: ownerLookup.owner, status: 'ready' };

  if (appUser.isLoading) return base;
  if (appUser.error) return { ...base, accessIssue: 'rulesBlocked', status: 'noAccess' };
  if (!appUser.data) return { ...base, accessIssue: 'missingProfile', status: 'noAccess' };
  if (!appUser.data.active) return { ...base, accessIssue: 'inactive', appUser: appUser.data, status: 'noAccess' };

  if (role.isLoading) return { ...base, appUser: appUser.data };
  if (role.error) return { ...base, accessIssue: 'rulesBlocked', appUser: appUser.data, status: 'noAccess' };
  if (!role.data) return { ...base, accessIssue: 'missingRole', appUser: appUser.data, status: 'noAccess' };
  return { ...base, appUser: appUser.data, role: role.data, status: 'ready' };
};
