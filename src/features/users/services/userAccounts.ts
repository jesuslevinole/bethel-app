import { deleteApp, initializeApp } from 'firebase/app';
import { createUserWithEmailAndPassword, initializeAuth, inMemoryPersistence, signOut } from 'firebase/auth';
import { firebaseConfig } from '../../../config/firebase';
import { appUsersService } from '../../../services/appUsersService';
import type { AppUser, NewRecord } from '../../../types/index';
import { UserFacingError } from '../../../utils/userFacingError';

export type UserProfileFields = Omit<NewRecord<AppUser>, 'email'>;

export interface NewUserAccount extends Omit<UserProfileFields, 'isTest' | 'studentId' | 'teacherId'> {
  email: string;
  isTest: boolean;
  password: string;
}

export type ResolvePersonLink = () => Promise<Pick<UserProfileFields, 'studentId' | 'teacherId'>>;

const AUTH_ERRORS: Record<string, string> = {
  'auth/email-already-in-use': 'Ese correo ya tiene una cuenta. Usa otro correo para este usuario.',
  'auth/invalid-email': 'Escribe un correo válido.',
  'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
};

// La cuenta se crea en una instancia aparte de Firebase (en memoria) para que quien la crea
// NO pierda su sesión: createUserWithEmailAndPassword inicia sesión con la cuenta nueva.
const createAuthAccount = async (email: string, password: string) => {
  const creatorApp = initializeApp(firebaseConfig, `account-creator-${Date.now()}`);
  try {
    const creatorAuth = initializeAuth(creatorApp, { persistence: inMemoryPersistence });
    const credential = await createUserWithEmailAndPassword(creatorAuth, email, password);
    await signOut(creatorAuth);
    return credential.user.uid;
  } catch (error) {
    const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
    const message = AUTH_ERRORS[code];
    if (message) throw new UserFacingError(message);
    throw error;
  } finally {
    await deleteApp(creatorApp);
  }
};

// Dominio reservado para pruebas (.test nunca existe en internet): el correo sirve solo para entrar a la app.
export const TEST_LOGIN_DOMAIN = 'bethel.test';

// Correo interno para un usuario de prueba sin correo: nombre + 4 caracteres al azar (ej. gigi.esparza.k7m2@bethel.test).
export const buildTestLogin = (name: string) => {
  const slug = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '');
  const suffix = generateTemporaryPassword(4).toLowerCase();
  return `${slug || 'prueba'}.${suffix}@${TEST_LOGIN_DOMAIN}`;
};

// Primero la cuenta (si el correo ya existe, no se crea nada más); después el maestro o alumno; al final el perfil.
// Devuelve el correo con el que entra (el generado, si es de prueba y vino vacío).
export const createUserAccount = async (
  { email, isTest, password, ...profile }: NewUserAccount,
  resolveLink: ResolvePersonLink,
) => {
  const typedEmail = email.trim().toLowerCase();
  const loginEmail = typedEmail || (isTest ? buildTestLogin(profile.name) : typedEmail);
  const uid = await createAuthAccount(loginEmail, password);
  const link = await resolveLink();
  await appUsersService.set(uid, { ...profile, ...link, email: loginEmail, ...(isTest ? { isTest: true } : {}) });
  return loginEmail;
};

export const updateUserProfile = async (userId: string, profile: UserProfileFields) => {
  await appUsersService.update(userId, profile);
};

// Borra el usuario de la app: la cuenta de Auth queda, pero ya no puede entrar a nada
// (borrar la cuenta de Auth requiere el Admin SDK). Para pausar a alguien, mejor desactivarlo.
export const deleteUserProfile = async (user: AppUser) => {
  await appUsersService.delete(user.id);
};

// Contraseña temporal legible (sin caracteres que se confunden, como 0/O o 1/l).
const PASSWORD_ALPHABET = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export const generateTemporaryPassword = (length = 10) => {
  const randomValues = crypto.getRandomValues(new Uint32Array(length));
  return Array.from(randomValues, (value) => PASSWORD_ALPHABET[value % PASSWORD_ALPHABET.length]).join('');
};
