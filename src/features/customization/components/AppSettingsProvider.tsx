import { useMemo, type ReactNode } from 'react';
import { COLLECTIONS } from '../../../lib/firebase/collections';
import { useLiveDocument } from '../../../shared/data/useLiveDocument';
import type { AppSettings } from '../../../types/index';
import { APP_SETTINGS_DOC_ID, AppSettingsContext } from '../appSettingsContext';

interface AppSettingsProviderProps {
  children: ReactNode;
}

// Un solo listener de app_settings/config para toda la app (menú lateral, encabezados de tablas).
const AppSettingsProvider = ({ children }: AppSettingsProviderProps) => {
  const { data, isLoading } = useLiveDocument<AppSettings>(COLLECTIONS.appSettings, APP_SETTINGS_DOC_ID);
  const value = useMemo(() => ({ isLoading, settings: data }), [data, isLoading]);

  return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>;
};

export default AppSettingsProvider;
