import { UserCog } from 'lucide-react';
import EmptyState from '../../../shared/components/EmptyState';
import ListSkeleton from '../../../shared/components/ListSkeleton';
import { PHONE_QUERY, useMediaQuery } from '../../../shared/hooks/useMediaQuery';
import type { AppUser, RowPermissions, UserRow } from '../../../types/index';
import UserCards from './UserCards';
import UserTable from './UserTable';

interface UserListProps {
  isLoading: boolean;
  onDelete: (user: AppUser) => void;
  onEdit: (user: AppUser) => void;
  rowPermissions: RowPermissions;
  rows: UserRow[];
}

const UserList = ({ isLoading, onDelete, onEdit, rowPermissions, rows }: UserListProps) => {
  const isPhone = useMediaQuery(PHONE_QUERY);

  if (isLoading) return <ListSkeleton />;
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={UserCog}
        text="Crea el usuario de cada maestro, director, estudiante o persona de administración y asígnale un rol."
        title="Sin usuarios todavía"
      />
    );
  }
  if (isPhone) return <UserCards onDelete={onDelete} onEdit={onEdit} rowPermissions={rowPermissions} rows={rows} />;
  return <UserTable onDelete={onDelete} onEdit={onEdit} rowPermissions={rowPermissions} rows={rows} />;
};

export default UserList;
