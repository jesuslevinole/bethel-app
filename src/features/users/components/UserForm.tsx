import { RefreshCw } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import CopyableValue from '../../../shared/components/CopyableValue';
import Field from '../../../shared/components/Field';
import Modal from '../../../shared/components/Modal';
import { useAsyncAction } from '../../../shared/hooks/useAsyncAction';
import { useFormFields } from '../../../shared/hooks/useFormFields';
import type { AppUser, Role, Student, Teacher } from '../../../types/index';
import { inferRoleKind } from '../../roles/defaultRoles';
import { previewPersonLink } from '../personLink';
import { ensurePersonRecord } from '../services/personRecords';
import { createUserAccount, generateTemporaryPassword, updateUserProfile } from '../services/userAccounts';
import { toUserFormValues, validateUser, type UserFormValues } from '../userForm';
import PersonLinkNotice from './PersonLinkNotice';
import './Users.css';

interface UserFormProps {
  onClose: () => void;
  roles: Role[];
  students: Student[];
  teachers: Teacher[];
  user: AppUser | null;
}

interface CreatedAccess {
  email: string;
  isTest: boolean;
  password: string;
}

// El rol decide qué es la persona: con rol de Maestro se registra como maestro, con Estudiante como alumno.
const UserForm = ({ onClose, roles, students, teachers, user }: UserFormProps) => {
  const { setField, values } = useFormFields<UserFormValues>(toUserFormValues(user));
  const { error, isRunning, run, setError } = useAsyncAction();
  const [createdAccess, setCreatedAccess] = useState<CreatedAccess | null>(null);
  const isNew = !user;

  const selectedRole = roles.find((role) => role.id === values.roleId) ?? null;
  const roleKind = selectedRole ? inferRoleKind(selectedRole) : 'staff';
  const linkSources = { currentUser: user, students, teachers };
  const linkPreview = previewPersonLink(roleKind, values.name, linkSources);

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validateUser(values, isNew);
    if (validationError) {
      setError(validationError);
      return;
    }
    const baseProfile = { active: values.active, name: values.name.trim(), roleId: values.roleId };
    const isTest = isNew && values.isTest;
    const resolveLink = () => ensurePersonRecord(roleKind, values.name, linkSources, isTest);
    let loginEmail = values.email.trim().toLowerCase();
    const saveUser = async () => {
      if (user) {
        await updateUserProfile(user.id, { ...baseProfile, ...(await resolveLink()) });
        return;
      }
      loginEmail = await createUserAccount(
        { ...baseProfile, email: values.email, isTest, password: values.password },
        resolveLink,
      );
    };
    if (!(await run(saveUser))) return;
    if (user) onClose();
    else setCreatedAccess({ email: loginEmail, isTest, password: values.password });
  };

  if (createdAccess) {
    return (
      <Modal onClose={onClose} subtitle="Entrégale estos datos." title={`Usuario listo: ${values.name.trim()}`}>
        <div className="modal-body">
          <p className="modal-text">
            {createdAccess.isTest
              ? 'Usuario de prueba. Para entrar con él, usa este correo y la contraseña en la pantalla de entrada (o pruébalo con "Ver como").'
              : 'Entra desde el portal. Si quiere su propia contraseña, en la pantalla de entrada toca "Olvidé mi contraseña".'}
          </p>
          <CopyableValue label={createdAccess.isTest ? 'Correo para entrar' : 'Correo'} value={createdAccess.email} />
          <CopyableValue label="Contraseña temporal" value={createdAccess.password} />
        </div>
        <footer className="modal-footer">
          <button className="btn btn-primary" onClick={onClose} type="button">
            Listo
          </button>
        </footer>
      </Modal>
    );
  }

  const title = isNew ? 'Nuevo usuario' : `Editar a ${user.name}`;
  const subtitle = isNew
    ? 'Crea su cuenta de acceso. El rol define qué puede ver y hacer.'
    : 'El correo y la contraseña los cambia el propio usuario desde la pantalla de entrada.';

  return (
    <Modal onClose={onClose} subtitle={subtitle} title={title}>
      <form className="modal-form" noValidate onSubmit={handleSave}>
        <div className="modal-body">
          <div className="form-grid">
            <Field
              hint="Tal como aparece en Maestros o Alumnos, si es maestro o alumno."
              htmlFor="user-name"
              label="Nombre completo"
            >
              <input
                autoFocus
                className="input"
                id="user-name"
                onChange={(event) => setField('name', event.target.value)}
                value={values.name}
              />
            </Field>
            <Field htmlFor="user-role" label="Rol">
              <select
                className="input input-select"
                id="user-role"
                onChange={(event) => setField('roleId', event.target.value)}
                value={values.roleId}
              >
                <option value="">Elige un rol</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </Field>
            {isNew && (
              <>
                <label className="span-all user-form-toggle">
                  <input
                    checked={values.isTest}
                    onChange={(event) => setField('isTest', event.target.checked)}
                    type="checkbox"
                  />
                  Usuario de prueba (no necesita correo)
                </label>
                <Field
                  hint={
                    values.isTest
                      ? 'Opcional. Si lo dejas vacío, se genera uno para entrar (…@bethel.test).'
                      : undefined
                  }
                  htmlFor="user-email"
                  label={values.isTest ? 'Correo (opcional)' : 'Correo'}
                >
                  <input
                    autoComplete="off"
                    className="input"
                    id="user-email"
                    onChange={(event) => setField('email', event.target.value)}
                    type="email"
                    value={values.email}
                  />
                </Field>
                <Field htmlFor="user-password" label="Contraseña temporal">
                  <div className="user-form-password">
                    <input
                      autoComplete="off"
                      className="input"
                      id="user-password"
                      onChange={(event) => setField('password', event.target.value)}
                      value={values.password}
                    />
                    <button
                      aria-label="Generar otra contraseña"
                      className="btn btn-icon"
                      onClick={() => setField('password', generateTemporaryPassword())}
                      title="Generar otra"
                      type="button"
                    >
                      <RefreshCw size={17} />
                    </button>
                  </div>
                </Field>
              </>
            )}
            {!isNew && (
              <label className="span-all user-form-toggle">
                <input
                  checked={values.active}
                  onChange={(event) => setField('active', event.target.checked)}
                  type="checkbox"
                />
                Usuario activo (desmarca para pausar su acceso sin borrarlo)
              </label>
            )}
          </div>
          <PersonLinkNotice preview={linkPreview} />
          {error && <p className="form-alert">{error}</p>}
        </div>
        <footer className="modal-footer">
          <button className="btn btn-secondary" disabled={isRunning} onClick={onClose} type="button">
            Cancelar
          </button>
          <button className="btn btn-primary" disabled={isRunning} type="submit">
            {isRunning ? 'Guardando…' : 'Guardar usuario'}
          </button>
        </footer>
      </form>
    </Modal>
  );
};

export default UserForm;
