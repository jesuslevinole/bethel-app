import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { PATHS } from '../../../routes/paths';
import FullPageLoader from '../../../shared/components/FullPageLoader';
import type { AppRole } from '../../../types/index';
import { getHomePath, useAdminSession } from '../adminSessionContext';
import NoAccessNotice from './NoAccessNotice';

interface RequireRoleProps {
  children: ReactNode;
  role: AppRole;
}

// Guardia de cada área: sin sesión va al login; con otro rol, a su propia área.
const RequireRole = ({ children, role }: RequireRoleProps) => {
  const session = useAdminSession();

  if (session.status === 'loading') return <FullPageLoader />;
  if (session.status === 'signedOut') return <Navigate replace to={PATHS.login} />;
  if (session.status === 'noAccess') return <NoAccessNotice />;
  if (session.role !== role) return <Navigate replace to={getHomePath(session.role)} />;
  return children;
};

export default RequireRole;
