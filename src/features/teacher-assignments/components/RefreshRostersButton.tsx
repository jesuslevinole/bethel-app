import { RefreshCw } from 'lucide-react';
import { useAsyncAction } from '../../../shared/hooks/useAsyncAction';
import type { TeacherAssignment } from '../../../types/index';
import { syncPeriodRosters } from '../services/rosterSync';

interface RefreshRostersButtonProps {
  assignments: TeacherAssignment[];
}

// Vuelve a armar las listas de alumnos de todos los maestros del período (por si se inscribió antes de esta función).
const RefreshRostersButton = ({ assignments }: RefreshRostersButtonProps) => {
  const { error, isRunning, run } = useAsyncAction();

  return (
    <button
      className="btn btn-secondary"
      disabled={isRunning || assignments.length === 0}
      onClick={() => run(() => syncPeriodRosters(assignments))}
      title={error ?? 'Vuelve a cargar los alumnos inscritos en la lista de cada maestro'}
      type="button"
    >
      <RefreshCw size={17} />
      {isRunning ? 'Actualizando…' : 'Actualizar listas de alumnos'}
    </button>
  );
};

export default RefreshRostersButton;
