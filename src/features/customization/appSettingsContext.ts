import { createContext, useContext } from 'react';
import type { AppSettings } from '../../types/index';

export const APP_SETTINGS_DOC_ID = 'config';

export interface AppSettingsState {
  isLoading: boolean;
  settings: AppSettings | null;
}

export const AppSettingsContext = createContext<AppSettingsState>({ isLoading: true, settings: null });

// Personalización de la app (menú y columnas) en vivo. La da AppSettingsProvider (en AppLayout).
export const useAppSettings = () => useContext(AppSettingsContext);
