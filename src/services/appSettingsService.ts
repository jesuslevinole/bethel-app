import { COLLECTIONS } from '../lib/firebase/collections';
import type { AppSettings } from '../types/index';
import { createCollectionService } from './createCollectionService';

export const appSettingsService = createCollectionService<AppSettings>(COLLECTIONS.appSettings);
