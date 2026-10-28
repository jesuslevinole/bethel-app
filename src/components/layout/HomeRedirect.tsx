import { Navigate } from 'react-router-dom';
import { usePermissions } from '../../features/auth/hooks/usePermissions';
import { PATHS } from '../../routes/paths';
import { useSessionRoleKind } from './useVisibleNavigation';

// /app lleva a Inicio. El estudiante que aún no es alumno (cuenta nueva) va directo a su solicitud.
const HomeRedirect = () => {
  const roleKind = useSessionRoleKind();
  const { studentId } = usePermissions();
  const homePath = roleKind === 'student' && !studentId ? PATHS.myApplication : PATHS.home;

  return <Navigate replace to={homePath} />;
};

export default HomeRedirect;
