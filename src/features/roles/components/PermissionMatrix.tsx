import { Fragment, useState } from 'react';
import SearchInput from '../../../shared/components/SearchInput';
import type { ModulePermission, PermissionModule, RolePermissions } from '../../../types/index';
import { pluralize } from '../../../utils/plural';
import { matchesSearch } from '../../../utils/search';
import { ACTION_COLUMNS, PERMISSION_MODULES, type PermissionModuleDefinition } from '../permissionModules';
import { countActivePermissions } from '../roleForm';
import PermissionRow from './PermissionRow';

interface PermissionMatrixProps {
  isReadOnly: boolean;
  onChange: (module: PermissionModule, permission: ModulePermission) => void;
  permissions: RolePermissions;
}

const GROUPS: PermissionModuleDefinition['group'][] = ['Académico', 'Finanzas', 'Configuración', 'Seguridad'];
const COLUMN_COUNT = ACTION_COLUMNS.length + 2;

// Matriz de permisos: una fila por módulo (todos los de PERMISSION_MODULES) y una columna por acción.
// Las casillas que no aplican a un módulo salen como "—".
const PermissionMatrix = ({ isReadOnly, onChange, permissions }: PermissionMatrixProps) => {
  const [filter, setFilter] = useState('');
  const isFiltering = Boolean(filter.trim());
  const visibleModules = PERMISSION_MODULES.filter((definition) =>
    matchesSearch([definition.label, definition.description], filter),
  );
  const activeCount = countActivePermissions(permissions);

  const renderRow = (definition: PermissionModuleDefinition) => (
    <PermissionRow
      definition={definition}
      isReadOnly={isReadOnly}
      key={definition.key}
      onChange={(permission) => onChange(definition.key, permission)}
      permission={permissions[definition.key]}
    />
  );

  return (
    <div className="permission-matrix">
      <div className="permission-toolbar">
        <SearchInput label="Filtrar módulos" onChange={setFilter} placeholder="Filtrar módulos…" value={filter} />
        <span className="permission-count">{pluralize(activeCount, 'permiso activo', 'permisos activos')}</span>
      </div>
      <div className="permission-scroll">
        <table className="permission-table">
          <thead>
            <tr>
              <th className="permission-module-head" scope="col">
                Módulo
              </th>
              <th scope="col">Ver</th>
              {ACTION_COLUMNS.map(({ action, hint, label }) => (
                <th className="permission-action" key={action} scope="col" title={hint}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isFiltering && visibleModules.map(renderRow)}
            {isFiltering && visibleModules.length === 0 && (
              <tr>
                <td className="permission-empty" colSpan={COLUMN_COUNT}>
                  Ningún módulo coincide.
                </td>
              </tr>
            )}
            {!isFiltering &&
              GROUPS.map((group) => (
                <Fragment key={group}>
                  <tr className="permission-group-row">
                    <th colSpan={COLUMN_COUNT} scope="colgroup">
                      {group}
                    </th>
                  </tr>
                  {visibleModules.filter((definition) => definition.group === group).map(renderRow)}
                </Fragment>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PermissionMatrix;
