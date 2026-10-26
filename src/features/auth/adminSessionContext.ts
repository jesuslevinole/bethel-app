import { createContext, useContext } from 'react';
import { PATHS } from '../../routes/paths';
import type { AdminSession, AppRole } from '../../types/index';

export const AdminSessionContext = createContext<AdminSession>({
  accessIssue: null,
  email: null,
  profile: null,
  role: null,
  status: 'loading',
  teacherProfile: null,
  uid: null,
});

export const useAdminSession = () => useContext(AdminSessionContext);

// Pantalla de inicio de cada rol después de entrar.
export const getHomePath = (role: AppRole | null) => (role === 'teacher' ? PATHS.teacher : PATHS.admin);
