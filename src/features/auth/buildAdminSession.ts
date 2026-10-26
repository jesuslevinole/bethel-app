import type { User } from 'firebase/auth';
import type { AdminAccessIssue, AdminSession, AdminUser, TeacherUser } from '../../types/index';

export interface ProfileLookup {
  adminProfile: AdminUser | null;
  issue: AdminAccessIssue | null;
  teacherProfile: TeacherUser | null;
  uid: string;
}

const EMPTY_SESSION: Omit<AdminSession, 'status'> = {
  accessIssue: null,
  email: null,
  profile: null,
  role: null,
  teacherProfile: null,
  uid: null,
};

// undefined = Firebase aún no responde si hay sesión; null = no hay sesión.
// Un perfil en admin_users da rol de administrador; uno en teacher_users, de maestro.
export const buildAdminSession = (authUser: User | null | undefined, profileLookup: ProfileLookup | null): AdminSession => {
  if (authUser === undefined) return { ...EMPTY_SESSION, status: 'loading' };
  if (authUser === null) return { ...EMPTY_SESSION, status: 'signedOut' };

  const signedInSession = { ...EMPTY_SESSION, email: authUser.email, uid: authUser.uid };
  if (profileLookup?.uid !== authUser.uid) return { ...signedInSession, status: 'loading' };
  if (profileLookup.adminProfile) {
    return { ...signedInSession, profile: profileLookup.adminProfile, role: 'admin', status: 'ready' };
  }
  if (profileLookup.teacherProfile) {
    return { ...signedInSession, role: 'teacher', status: 'ready', teacherProfile: profileLookup.teacherProfile };
  }
  return { ...signedInSession, accessIssue: profileLookup.issue, status: 'noAccess' };
};
