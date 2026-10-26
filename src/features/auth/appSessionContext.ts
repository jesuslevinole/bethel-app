import { createContext, useContext } from 'react';
import type { AppSession } from '../../types/index';

export const INITIAL_SESSION: AppSession = {
  accessIssue: null,
  appUser: null,
  email: null,
  isOwner: false,
  owner: null,
  role: null,
  status: 'loading',
  uid: null,
};

export const AppSessionContext = createContext<AppSession>(INITIAL_SESSION);

export const useAppSession = () => useContext(AppSessionContext);
