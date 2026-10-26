import { KeyRound, UserMinus } from 'lucide-react';
import EmptyState from '../../../shared/components/EmptyState';
import ListSkeleton from '../../../shared/components/ListSkeleton';
import type { TeacherUser } from '../../../types/index';

interface TeacherAccessListProps {
  accesses: TeacherUser[];
  isLoading: boolean;
  onRemove: (access: TeacherUser) => void;
}

const TeacherAccessList = ({ accesses, isLoading, onRemove }: TeacherAccessListProps) => {
  if (isLoading) return <ListSkeleton />;
  if (accesses.length === 0) {
    return (
      <EmptyState
        icon={KeyRound}
        text="Crea el acceso de cada maestro para que pase asistencia y ponga notas desde su propio portal."
        title="Ningún maestro tiene acceso todavía"
      />
    );
  }

  return (
    <ul className="record-cards">
      {accesses.map((access) => (
        <li className="record-card" key={access.id}>
          <div className="record-card-header">
            <div>
              <h3 className="record-card-title">{access.name}</h3>
              <span className="cell-muted">{access.email}</span>
            </div>
            <button
              aria-label={`Quitar acceso a ${access.name}`}
              className="btn btn-icon is-danger"
              onClick={() => onRemove(access)}
              title="Quitar acceso"
              type="button"
            >
              <UserMinus size={18} />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default TeacherAccessList;
