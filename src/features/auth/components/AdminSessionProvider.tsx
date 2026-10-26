import { onAuthStateChanged, type User } from 'firebase/auth';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { auth } from '../../../config/firebase';
import { AdminSessionContext } from '../adminSessionContext';
import { buildAdminSession, type ProfileLookup } from '../buildAdminSession';
import { lookUpProfile } from '../services/profileLookup';

interface AdminSessionProviderProps {
  children: ReactNode;
}

// Sesión de Firebase Auth + perfil (admin_users o teacher_users). Sin perfil no hay acceso aunque la cuenta exista.
const AdminSessionProvider = ({ children }: AdminSessionProviderProps) => {
  const [authUser, setAuthUser] = useState<User | null | undefined>(undefined);
  const [profileLookup, setProfileLookup] = useState<ProfileLookup | null>(null);

  useEffect(() => onAuthStateChanged(auth, setAuthUser), []);

  useEffect(() => {
    if (!authUser) return undefined;
    let isCurrentUser = true;
    const loadProfile = async () => {
      const lookup = await lookUpProfile(authUser.uid);
      if (isCurrentUser) setProfileLookup(lookup);
    };
    void loadProfile();
    return () => {
      isCurrentUser = false;
    };
  }, [authUser]);

  const session = useMemo(() => buildAdminSession(authUser, profileLookup), [authUser, profileLookup]);

  return <AdminSessionContext.Provider value={session}>{children}</AdminSessionContext.Provider>;
};

export default AdminSessionProvider;
