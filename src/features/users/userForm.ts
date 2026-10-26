import type { AppUser } from '../../types/index';
import { generateTemporaryPassword } from './services/userAccounts';

export interface UserFormValues {
  active: boolean;
  email: string;
  isTest: boolean;
  name: string;
  password: string;
  roleId: string;
}

export const toUserFormValues = (user: AppUser | null): UserFormValues => ({
  active: user?.active ?? true,
  email: user?.email ?? '',
  isTest: user?.isTest ?? false,
  name: user?.name ?? '',
  password: user ? '' : generateTemporaryPassword(),
  roleId: user?.roleId ?? '',
});

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateUser = (values: UserFormValues, isNew: boolean) => {
  if (!values.name.trim()) return 'Escribe el nombre del usuario.';
  if (!values.roleId) return 'Elige el rol.';
  const email = values.email.trim();
  const emailIsOptional = values.isTest && !email;
  if (isNew && !emailIsOptional && !EMAIL_PATTERN.test(email)) {
    return values.isTest ? 'Escribe un correo válido o déjalo vacío.' : 'Escribe un correo válido.';
  }
  if (isNew && values.password.length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
  return null;
};
