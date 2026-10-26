import { LogOut } from 'lucide-react';
import { useAppSession } from '../../features/auth/appSessionContext';
import { signOutUser } from '../../features/auth/services/authService';
import { getInitials } from '../../utils/initials';
import './UserCard.css';

const UserCard = () => {
  const { appUser, email, owner, role } = useAppSession();
  const displayName = owner?.name ?? appUser?.name ?? email ?? 'Usuario';
  const roleName = owner ? 'Propietario del sistema' : (role?.name ?? '');

  return (
    <div className="user-card">
      <span aria-hidden="true" className="user-card-avatar">
        {getInitials(displayName)}
      </span>
      <span className="user-card-text">
        <span className="user-card-name">{displayName}</span>
        <span className="user-card-email">{roleName}</span>
      </span>
      <button aria-label="Cerrar sesión" className="btn btn-icon" onClick={signOutUser} title="Cerrar sesión" type="button">
        <LogOut size={18} />
      </button>
    </div>
  );
};

export default UserCard;
