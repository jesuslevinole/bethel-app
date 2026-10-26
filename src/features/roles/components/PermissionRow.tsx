import type { ModulePermission, PermissionAction, ViewScope } from '../../../types/index';
import { ACTION_COLUMNS, type PermissionModuleDefinition } from '../permissionModules';
import ScopeSwitch from './ScopeSwitch';

interface PermissionRowProps {
  definition: PermissionModuleDefinition;
  isReadOnly: boolean;
  onChange: (permission: ModulePermission) => void;
  permission: ModulePermission;
}

const PermissionRow = ({ definition, isReadOnly, onChange, permission }: PermissionRowProps) => {
  const isOwnScope = permission.view === 'own' && definition.ownMeaning;
  const hint = isOwnScope ? `Propios: ${definition.ownMeaning}` : definition.description;
  const isHidden = permission.view === 'none';

  const handleScopeChange = (view: ViewScope) => onChange({ ...permission, view });
  const handleActionChange = (action: PermissionAction, isChecked: boolean) =>
    onChange({ ...permission, [action]: isChecked });

  return (
    <tr className={isHidden ? 'is-hidden' : undefined}>
      <th className="permission-module" scope="row">
        <span className="permission-module-name">{definition.label}</span>
        <span className={`permission-module-hint${isOwnScope ? ' is-own' : ''}`}>{hint}</span>
      </th>
      <td>
        <ScopeSwitch
          disabled={isReadOnly}
          label={definition.label}
          onChange={handleScopeChange}
          scopes={definition.scopes}
          value={permission.view}
        />
      </td>
      {ACTION_COLUMNS.map(({ action, label }) => (
        <td className="permission-action" key={action}>
          {definition.actions.includes(action) ? (
            <input
              aria-label={`${label} en ${definition.label}`}
              checked={!isHidden && permission[action]}
              className="permission-check"
              disabled={isReadOnly || isHidden}
              onChange={(event) => handleActionChange(action, event.target.checked)}
              type="checkbox"
            />
          ) : (
            <span aria-hidden="true" className="permission-na">
              —
            </span>
          )}
        </td>
      ))}
    </tr>
  );
};

export default PermissionRow;
