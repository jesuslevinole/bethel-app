import { Trash2 } from 'lucide-react';
import type { FormEvent } from 'react';
import Field from '../../../shared/components/Field';
import { useAsyncAction } from '../../../shared/hooks/useAsyncAction';
import { useFormFields } from '../../../shared/hooks/useFormFields';
import type { ModulePermission, PermissionModule, Role } from '../../../types/index';
import { toRoleData, toRoleFormValues, validateRole, type RoleFormValues } from '../roleForm';
import { saveRole } from '../services/roleRecords';
import PermissionMatrix from './PermissionMatrix';

interface RoleEditorProps {
  canDelete: boolean;
  canSave: boolean;
  onAskDelete: (role: Role) => void;
  onCancelNew: () => void;
  onSaved: (roleId: string) => void;
  role: Role | null;
  roles: Role[];
}

// Nombre, descripción y matriz de permisos de un rol. Se monta de nuevo (key) por cada rol.
const RoleEditor = ({ canDelete, canSave, onAskDelete, onCancelNew, onSaved, role, roles }: RoleEditorProps) => {
  const { setField, setValues, values } = useFormFields<RoleFormValues>(toRoleFormValues(role));
  const { error, isRunning, run, setError } = useAsyncAction();
  const isReadOnly = !canSave;
  const title = role ? role.name : 'Nuevo rol';

  const handlePermissionChange = (module: PermissionModule, permission: ModulePermission) => {
    setValues((currentValues) => ({
      ...currentValues,
      permissions: { ...currentValues.permissions, [module]: permission },
    }));
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validateRole(values, roles, role?.id);
    if (validationError) {
      setError(validationError);
      return;
    }
    let savedId = role?.id ?? '';
    const persistRole = async () => {
      savedId = await saveRole(role?.id ?? null, toRoleData(values));
    };
    if (await run(persistRole)) onSaved(savedId);
  };

  return (
    <form className="panel" noValidate onSubmit={handleSave}>
      <header className="panel-header">
        <h2 className="panel-title">{title}</h2>
      </header>
      <div className="role-editor-fields">
        <Field htmlFor="role-name" label="Nombre del rol">
          <input
            className="input"
            id="role-name"
            onChange={(event) => setField('name', event.target.value)}
            readOnly={isReadOnly}
            value={values.name}
          />
        </Field>
        <Field htmlFor="role-description" label="Descripción">
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
      <div className="panel-body-flush">
        <PermissionMatrix isReadOnly={isReadOnly} onChange={handlePermissionChange} permissions={values.permissions} />
      </div>
      <footer className="role-editor-footer">
        {isReadOnly && <p className="role-editor-note">Solo lectura: tu rol no puede cambiar roles.</p>}
        {error && <p className="form-alert">{error}</p>}
        <div className="role-editor-actions">
          {role && canDelete && (
            <button className="btn btn-secondary" disabled={isRunning} onClick={() => onAskDelete(role)} type="button">
              <Trash2 size={17} />
              Eliminar rol
            </button>
          )}
          {!role && (
            <button className="btn btn-secondary" disabled={isRunning} onClick={onCancelNew} type="button">
              Cancelar
            </button>
          )}
          {canSave && (
            <button className="btn btn-primary" disabled={isRunning} type="submit">
              {isRunning ? 'Guardando…' : 'Guardar rol'}
            </button>
          )}
        </div>
      </footer>
    </form>
  );
};

export default RoleEditor;
