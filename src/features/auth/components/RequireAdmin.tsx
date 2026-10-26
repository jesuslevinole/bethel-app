import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { PATHS } from '../../../routes/paths';
import FullPageLoader from '../../../shared/components/FullPageLoader';
import { useAdminSession } from '../adminSessionContext';
import NoAccessNotice from './NoAccessNotice';

interface RequireAdminProps {
  children: ReactNode;
}

const RequireAdmin = ({ children }: RequireAdminProps) => {
  const { status } = useAdminSession();

  if (status === 'loading') return <FullPageLoader />;
  if (status === 'signedOut') return <Navigate replace to={PATHS.login} />;
  if (status === 'noAccess') return <NoAccessNotice />;
  return children;
};

export default RequireAdmin;
