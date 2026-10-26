import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { PATHS } from '../../../routes/paths';
import FullPageLoader from '../../../shared/components/FullPageLoader';
import { useAppSession } from '../appSessionContext';
import NoAccessNotice from './NoAccessNotice';

interface RequireSignedInProps {
  children: ReactNode;
}

// Guardia del área interna: sin sesión va al login; sin usuario o rol válido, al aviso de acceso.
const RequireSignedIn = ({ children }: RequireSignedInProps) => {
  const { status } = useAppSession();

  if (status === 'loading') return <FullPageLoader />;
  if (status === 'signedOut') return <Navigate replace to={PATHS.login} />;
  if (status === 'noAccess') return <NoAccessNotice />;
  return children;
};

export default RequireSignedIn;
