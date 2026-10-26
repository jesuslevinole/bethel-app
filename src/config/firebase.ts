import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

// La configuración web de Firebase es pública por diseño (viaja en el bundle).
// Lo que protege los datos son las Security Rules (security/firestore.rules), no esta llave.
export const firebaseConfig = {
  apiKey: 'AIzaSyBLG6YEsJY0sOOJBIUemrGpd1gLnrfDnRY',
  authDomain: 'bethel-institute.firebaseapp.com',
  projectId: 'bethel-institute',
  storageBucket: 'bethel-institute.firebasestorage.app',
  messagingSenderId: '855451222012',
  appId: '1:855451222012:web:1e9aace7a253a62453fc79',
};

export const firebaseApp = initializeApp(firebaseConfig);

export const auth = getAuth(firebaseApp);

// Caché persistente: al recargar, los listeners reanudan y Firestore cobra solo lo que cambió.
export const db = initializeFirestore(firebaseApp, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});
