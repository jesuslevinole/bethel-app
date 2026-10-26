import type { Role, RoleRow, RowPermissions } from '../../../types/index';
import { inferRoleKind, ROLE_KIND_LABELS } from '../defaultRoles';
import { PERMISSION_MODULES } from '../permissionModules';

interface RoleTableProps {
  onDelete: (role: Role) => void;
  onOpen: (role: Role) => void;
  rowPermissions: RowPermissions;
  rows: RoleRow[];
}

const RoleTable = ({ onDelete, onOpen, rowPermissions, rows }: RoleTableProps) => {
  const openLabel = rowPermissions.canEdit ? 'Editar' : 'Ver';

  return (
    <div className="table-wrap">
      <table className="role-table table">
        <thead>
          <tr>
            <th scope="col">Acciones</th>
            <th scope="col">Rol</th>
            <th scope="col">Descripción</th>
            <th scope="col">Tipo</th>
            <th className="cell-num" scope="col">Módulos visibles</th>
            <th className="cell-num" scope="col">Usuarios</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ role, userCount, visibleModules }) => (
            <tr key={role.id}>
              <td className="cell-actions">
                <div className="role-table-actions">
                  <button className="btn btn-secondary btn-compact" onClick={() => onOpen(role)} type="button">
                    {openLabel}
                  </button>
                  {rowPermissions.canDelete && (
                    <button className="btn btn-compact btn-danger-outline" onClick={() => onDelete(role)} type="button">
                      Eliminar
                    </button>
                  )}
                </div>
              </td>
              <td className="cell-strong role-table-name">{role.name}</td>
              <td className="cell-muted">{role.description || '—'}</td>
              <td>
                <span className="chip">{ROLE_KIND_LABELS[inferRoleKind(role)]}</span>
              </td>
              <td className="cell-num">
                {visibleModules} / {PERMISSION_MODULES.length}
              </td>
              <td className="cell-num">{userCount ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RoleTable;
