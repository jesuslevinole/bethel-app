import { adminUsersService } from '../../../services/adminUsersService';
import type { OwnerLookup } from '../buildAppSession';

// ¿La cuenta es propietaria del sistema (admin_users/{uid})?
// permission-denied aquí casi siempre significa que las reglas de security/ no están publicadas.
export const lookUpOwner = async (uid: string): Promise<OwnerLookup> => {
  try {
    const owner = await adminUsersService.getOne(uid);
    return { failed: false, owner, uid };
  } catch (error) {
    console.error('No se pudo leer el perfil de propietario:', error);
    return { failed: true, owner: null, uid };
  }
};
