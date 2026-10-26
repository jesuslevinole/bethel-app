import { RotateCcw } from 'lucide-react';
import type { FormEvent } from 'react';
import Field from '../../../shared/components/Field';
import Modal from '../../../shared/components/Modal';
import { useAsyncAction } from '../../../shared/hooks/useAsyncAction';
import { useFormFields } from '../../../shared/hooks/useFormFields';
import type { ModulePermission, PermissionModule, Role, RoleKind } from '../../../types/index';
import { getDefaultRole, ROLE_KIND_HINTS, ROLE_KIND_LABELS } from '../defaultRoles';
import { completePermissions } from '../permissions';
import { toRoleData, toRoleFormValues, validateRole, type RoleFormValues } from '../roleForm';
import { saveRole } from '../services/roleRecords';
import PermissionMatrix from './PermissionMatrix';

interface RoleEditorDialogProps {
  canSave: boolean;
  onClose: () => void;
  role: Role | null;
  roles: Role[];
}

const ROLE_KINDS: RoleKind[] = ['staff', 'teacher', 'student'];

// Nombre, descripción, tipo de usuario y matriz de permisos de un rol, en un formulario grande.
const RoleEditorDialog = ({ canSave, onClose, role, roles }: RoleEditorDialogProps) => {
  const { setField, setValues, values } = useFormFields<RoleFormValues>(toRoleFormValues(role));
  const { error, isRunning, run, setError } = useAsyncAction();
  const isReadOnly = !canSave;
  const defaultRole = role ? getDefaultRole(role.id) : null;
  const title = role ? `Editar rol: ${role.name}` : 'Nuevo rol';
  const subtitle = isReadOnly ? 'Solo lectura: tu rol no puede cambiar roles.' : 'Qué puede ver y hacer quien tenga este rol.';

  const handlePermissionChange = (module: PermissionModule, permission: ModulePermission) => {
    setValues((currentValues) => ({
      ...currentValues,
      permissions: { ...currentValues.permissions, [module]: permission },
    }));
  };

  const handleRestoreDefaults = () => {
    if (!defaultRole) return;
    setValues((currentValues) => ({
      ...currentValues,
      kind: defaultRole.kind,
      permissions: completePermissions(defaultRole.permissions),
    }));
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validateRole(values, roles, role?.id);
    if (validationError) {
      setError(validationError);
      return;
    }
    const persistRole = async () => {
      await saveRole(role?.id ?? null, toRoleData(values));
    };
    if (await run(persistRole)) onClose();
  };

  return (
    <Modal onClose={onClose} size="full" subtitle={subtitle} title={title}>
      <form className="modal-form" noValidate onSubmit={handleSave}>
        <div className="modal-body">
          <div className="role-editor-fields">
            <Field htmlFor="role-name" label="Nombre del rol">
              <input
                autoFocus
                className="input"
                id="role-name"
                onChange={(event) => setField('name', event.target.value)}
                readOnly={isReadOnly}
                value={values.name}
              />
            </Field>
            <Field hint={ROLE_KIND_HINTS[values.kind]} htmlFor="role-kind" label="Tipo de usuario">
              <select
                className="input input-select"
                disabled={isReadOnly}
                id="role-kind"
                onChange={(event) => setField('kind', event.target.value as RoleKind)}
                value={values.kind}
              >
                {ROLE_KINDS.map((kind) => (
                  <option key={kind} value={kind}>
                    {ROLE_KIND_LABELS[kind]}
                  </option>
                ))}
              </select>
            </Field>
            <Field className="span-all" htmlFor="role-description" label="Descripción">
              <input
                className="input"
                id="role-description"
                onChange={(event) => setField('description', event.target.value)}
                placeholder="Para qué sirve este rol"
                readOnly={isReadOnly}
                value={values.description}
              />
            </Field>
          </div>
          <PermissionMatrix isReadOnly={isReadOnly} onChange={handlePermissionChange} permissions={values.permissions} />
          {error && <p className="form-alert">{error}</p>}
        </div>
        <footer className="modal-footer">
          {defaultRole && canSave && (
            <button className="btn btn-ghost role-editor-restore" onClick={handleRestoreDefaults} type="button">
              <RotateCcw size={17} />
              Restaurar permisos sugeridos
            </button>
          )}
          <button className="btn btn-secondary" disabled={isRunning} onClick={onClose} type="button">
            {canSave ? 'Cancelar' : 'Cerrar'}
          </button>
          {canSave && (
            <button className="btn btn-primary" disabled={isRunning} type="submit">
              {isRunning ? 'Guardando…' : 'Guardar rol'}
            </button>
          )}
        </footer>
      </form>
    </Modal>
  );
};

export default RoleEditorDialog;
