import { onAuthStateChanged, type User } from 'firebase/auth';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { auth } from '../../../config/firebase';
import { COLLECTIONS } from '../../../lib/firebase/collections';
import { useLiveDocument } from '../../../shared/data/useLiveDocument';
import type { AppUser, Role } from '../../../types/index';
import { AppSessionContext } from '../appSessionContext';
import { buildAppSession, type OwnerLookup } from '../buildAppSession';
import { lookUpOwner } from '../services/ownerLookup';

interface AppSessionProviderProps {
  children: ReactNode;
}

// Sesión de Firebase Auth + propietario (admin_users) o usuario de la app (app_users) con su rol.
// Usuario y rol se escuchan en vivo: si cambian sus permisos o lo desactivan, la app lo refleja al instante.
const AppSessionProvider = ({ children }: AppSessionProviderProps) => {
  const [authUser, setAuthUser] = useState<User | null | undefined>(undefined);
  const [ownerLookup, setOwnerLookup] = useState<OwnerLookup | null>(null);

  useEffect(() => onAuthStateChanged(auth, setAuthUser), []);

  useEffect(() => {
    if (!authUser) return undefined;
    let isCurrentUser = true;
    const checkOwner = async () => {
      const lookup = await lookUpOwner(authUser.uid);
      if (isCurrentUser) setOwnerLookup(lookup);
    };
    void checkOwner();
    return () => {
      isCurrentUser = false;
    };
  }, [authUser]);

  const isOwnerChecked = Boolean(authUser) && ownerLookup?.uid === authUser?.uid;
  const appUserId = isOwnerChecked && !ownerLookup?.owner && !ownerLookup?.failed ? (authUser?.uid ?? null) : null;
  const appUser = useLiveDocument<AppUser>(COLLECTIONS.appUsers, appUserId);
  const roleId = appUser.data?.active ? appUser.data.roleId : null;
  const role = useLiveDocument<Role>(COLLECTIONS.roles, roleId);

  const session = useMemo(
    () => buildAppSession({ appUser, authUser, ownerLookup, role }),
    [appUser, authUser, ownerLookup, role],
  );

  return <AppSessionContext.Provider value={session}>{children}</AppSessionContext.Provider>;
};

export default AppSessionProvider;
