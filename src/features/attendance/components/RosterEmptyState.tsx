import { RefreshCw, Users } from 'lucide-react';
import EmptyState from '../../../shared/components/EmptyState';
import { useAsyncAction } from '../../../shared/hooks/useAsyncAction';
import type { TeachingGroup } from '../../../types/index';
import { usePermissions } from '../../auth/hooks/usePermissions';
import { syncClassRoster } from '../../teacher-assignments/services/rosterSync';

interface RosterEmptyStateProps {
  group: TeachingGroup;
}

// Grupo sin lista de alumnos: o no hay inscritos, o la lista aún no se generó (registros anteriores).
const RosterEmptyState = ({ group }: RosterEmptyStateProps) => {
  const permissions = usePermissions();
  const { error, isRunning, run } = useAsyncAction();
  const canRefresh = permissions.scope('enrollments') === 'all' && permissions.scope('students') === 'all';

  const handleRefresh = () => run(() => syncClassRoster(group.assignment.periodId, group.assignment.classId));

  return (
    <section className="panel">
      <EmptyState
        action={
          canRefresh && (
            <button className="btn btn-secondary" disabled={isRunning} onClick={handleRefresh} type="button">
              <RefreshCw size={17} />
              {isRunning ? 'Actualizando…' : 'Actualizar lista de alumnos'}
            </button>
          )
        }
        icon={Users}
        text={`No hay alumnos inscritos en ${group.className} en este período, o la lista todavía no se ha cargado.`}
        title="Sin alumnos en este grupo"
      />
      {error && <p className="form-alert sheet-alert">{error}</p>}
    </section>
  );
};

export default RosterEmptyState;
