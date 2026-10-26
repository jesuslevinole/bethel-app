import type { Role } from '../../../types/index';

interface RoleListProps {
  onSelect: (roleId: string) => void;
  roles: Role[];
  selectedRoleId: string | null;
}

const RoleList = ({ onSelect, roles, selectedRoleId }: RoleListProps) => (
  <nav aria-label="Roles" className="panel">
    <ul className="role-list">
      {roles.map((role) => (
        <li key={role.id}>
          <button
            aria-current={role.id === selectedRoleId}
            className={`role-list-item${role.id === selectedRoleId ? ' is-active' : ''}`}
            onClick={() => onSelect(role.id)}
            type="button"
          >
            <span className="role-list-name">{role.name}</span>
            <span className="role-list-description">{role.description || 'Sin descripción'}</span>
          </button>
        </li>
      ))}
    </ul>
  </nav>
);

export default RoleList;
