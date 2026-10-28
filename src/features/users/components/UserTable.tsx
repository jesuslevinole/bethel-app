import RowActions from '../../../shared/components/RowActions';
import type { AppUser, RowPermissions, UserRow } from '../../../types/index';
import { useColumnLabels } from '../../customization/useColumnLabels';

interface UserTableProps {
  onDelete: (user: AppUser) => void;
  onEdit: (user: AppUser) => void;
  rowPermissions: RowPermissions;
  rows: UserRow[];
}

// Nadie edita ni borra su propio usuario (evita quitarse el acceso o subirse el rol por error).
const UserTable = ({ onDelete, onEdit, rowPermissions, rows }: UserTableProps) => {
  const columnLabel = useColumnLabels('users');

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th scope="col">{columnLabel('name')}</th>
            <th scope="col">{columnLabel('email')}</th>
            <th scope="col">{columnLabel('role')}</th>
            <th scope="col">{columnLabel('link')}</th>
            <th scope="col">{columnLabel('status')}</th>
            <th scope="col">
              <span className="visually-hidden">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ isCurrentUser, linkLabel, roleName, user }) => (
            <tr key={user.id}>
              <td className="cell-strong">
                {user.name}
                {user.isTest && <span className="badge badge-warning test-data-badge">Prueba</span>}
              </td>
              <td className="cell-muted">{user.email}</td>
              <td>
                <span className="chip">{roleName}</span>
              </td>
              <td className="user-link">{linkLabel}</td>
              <td>
                <span className={user.active ? 'badge badge-success' : 'badge badge-muted'}>
                  {user.active ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td className="cell-actions">
                {isCurrentUser ? (
                  <span className="badge badge-muted">Tú</span>
                ) : (
                  <RowActions
                    canDelete={rowPermissions.canDelete}
                    canEdit={rowPermissions.canEdit}
                    itemLabel={user.name}
                    onDelete={() => onDelete(user)}
                    onEdit={() => onEdit(user)}
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
