import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '../../../routes/paths';
import { useLiveCollection } from '../../../shared/data/liveCollections';
import { AppSessionContext, useAppSession } from '../../auth/appSessionContext';
import { completePermissions, hasAction } from '../../roles/permissions';
import { buildViewAsSession } from '../buildViewAsSession';
import { ViewAsContext, type ViewAsControls, type ViewAsTarget } from '../viewAsContext';

interface ViewAsProviderProps {
  children: ReactNode;
}

const STORAGE_KEY = 'bethel.viewAs';

// Se recuerda solo en esta pestaña: al cerrar el navegador vuelve a la vista propia.
const readStoredTarget = (): ViewAsTarget | null => {
  try {
    const storedValue = window.sessionStorage.getItem(STORAGE_KEY);
    return storedValue ? (JSON.parse(storedValue) as ViewAsTarget) : null;
  } catch {
    return null;
  }
};

const storeTarget = (target: ViewAsTarget | null) => {
  try {
    if (target) window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(target));
    else window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Almacenamiento bloqueado: se queda solo en memoria.
  }
};

// "Ver como": ver la app con los permisos de otro rol o usuario. Reemplaza la sesión para todo lo que está
// dentro (menú, guardias, permisos y filtros "propios"). Firestore sigue usando la cuenta real: por eso, si
// no es el propietario, los permisos se cruzan con los suyos (buildViewAsSession) y nunca piden de más.
const ViewAsProvider = ({ children }: ViewAsProviderProps) => {
  const realSession = useAppSession();
  const navigate = useNavigate();
  const realUsersPermission = completePermissions(realSession.role?.permissions).users;
  const canViewAs =
    realSession.isOwner || (realUsersPermission.view === 'all' && hasAction(realUsersPermission, 'viewAs'));
  const [storedTarget, setStoredTarget] = useState<ViewAsTarget | null>(readStoredTarget);
  const target = canViewAs ? storedTarget : null;
  const { data: roles } = useLiveCollection('roles', Boolean(target));
  const { data: users } = useLiveCollection('appUsers', target?.kind === 'user');

  const viewAsSession = useMemo(
    () => (target ? buildViewAsSession({ realSession, roles, target, users }) : null),
    [realSession, roles, target, users],
  );

  const changeTarget = useCallback(
    (nextTarget: ViewAsTarget | null) => {
      storeTarget(nextTarget);
      setStoredTarget(nextTarget);
      navigate(PATHS.app);
    },
    [navigate],
  );

  const controls = useMemo<ViewAsControls>(
    () => ({
      canViewAs,
      label: viewAsSession?.label ?? null,
      startViewAs: changeTarget,
      stopViewAs: () => changeTarget(null),
      target,
    }),
    [canViewAs, changeTarget, target, viewAsSession],
  );

  return (
    <ViewAsContext.Provider value={controls}>
      <AppSessionContext.Provider value={viewAsSession?.session ?? realSession}>{children}</AppSessionContext.Provider>
    </ViewAsContext.Provider>
  );
};

export default ViewAsProvider;
