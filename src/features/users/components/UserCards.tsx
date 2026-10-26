import RowActions from '../../../shared/components/RowActions';
import type { AppUser, RowPermissions, UserRow } from '../../../types/index';

interface UserCardsProps {
  onDelete: (user: AppUser) => void;
  onEdit: (user: AppUser) => void;
  rowPermissions: RowPermissions;
  rows: UserRow[];
}

const UserCards = ({ onDelete, onEdit, rowPermissions, rows }: UserCardsProps) => (
  <ul className="record-cards">
    {rows.map(({ isCurrentUser, linkLabel, roleName, user }) => (
      <li className="record-card" key={user.id}>
        <div className="record-card-header">
          <div>
            <h3 className="record-card-title">
              {user.name}
              {user.isTest && <span className="badge badge-warning test-data-badge">Prueba</span>}
            </h3>
            <span className="cell-muted">{user.email}</span>
          </div>
          {!isCurrentUser && (
            <RowActions
              canDelete={rowPermissions.canDelete}
              canEdit={rowPermissions.canEdit}
              itemLabel={user.name}
              onDelete={() => onDelete(user)}
              onEdit={() => onEdit(user)}
            />
          )}
        </div>
        <dl className="record-card-meta">
          <dt>Rol</dt>
          <dd>{roleName}</dd>
          <dt>Registrado como</dt>
          <dd>{linkLabel}</dd>
          <dt>Estado</dt>
          <dd>{user.active ? 'Activo' : 'Inactivo'}</dd>
        </dl>
      </li>
    ))}
  </ul>
);

export default UserCards;
