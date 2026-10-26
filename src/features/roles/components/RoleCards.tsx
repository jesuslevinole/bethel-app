import type { Role, RoleRow, RowPermissions } from '../../../types/index';
import { inferRoleKind, ROLE_KIND_LABELS } from '../defaultRoles';
import { PERMISSION_MODULES } from '../permissionModules';

interface RoleCardsProps {
  onDelete: (role: Role) => void;
  onOpen: (role: Role) => void;
  rowPermissions: RowPermissions;
  rows: RoleRow[];
}

const RoleCards = ({ onDelete, onOpen, rowPermissions, rows }: RoleCardsProps) => (
  <ul className="record-cards">
    {rows.map(({ role, userCount, visibleModules }) => (
      <li className="record-card" key={role.id}>
        <div>
          <h3 className="record-card-title">{role.name}</h3>
          <span className="cell-muted">{role.description || '—'}</span>
        </div>
        <dl className="record-card-meta">
          <dt>Tipo</dt>
          <dd>{ROLE_KIND_LABELS[inferRoleKind(role)]}</dd>
          <dt>Módulos</dt>
          <dd>
            {visibleModules} / {PERMISSION_MODULES.length}
          </dd>
          <dt>Usuarios</dt>
          <dd>{userCount ?? '—'}</dd>
        </dl>
        <div className="role-table-actions">
          <button className="btn btn-secondary btn-compact" onClick={() => onOpen(role)} type="button">
            {rowPermissions.canEdit ? 'Editar' : 'Ver'}
          </button>
          {rowPermissions.canDelete && (
            <button className="btn btn-compact btn-danger-outline" onClick={() => onDelete(role)} type="button">
              Eliminar
            </button>
          )}
        </div>
      </li>
    ))}
  </ul>
);

export default RoleCards;
