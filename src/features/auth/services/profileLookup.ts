import { adminUsersService } from '../../../services/adminUsersService';
import { teacherUsersService } from '../../../services/teacherUsersService';
import type { ProfileLookup } from '../buildAdminSession';

// Busca primero el perfil de administrador y, si no hay, el de maestro.
// permission-denied aquí casi siempre significa que las reglas de security/ no están publicadas.
export const lookUpProfile = async (uid: string): Promise<ProfileLookup> => {
  try {
    const adminProfile = await adminUsersService.getOne(uid);
    if (adminProfile) return { adminProfile, issue: null, teacherProfile: null, uid };
    const teacherProfile = await teacherUsersService.getOne(uid);
    return { adminProfile: null, issue: teacherProfile ? null : 'missingProfile', teacherProfile, uid };
  } catch (error) {
    console.error('No se pudo leer el perfil:', error);
    return { adminProfile: null, issue: 'rulesBlocked', teacherProfile: null, uid };
  }
};
