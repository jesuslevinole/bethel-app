import { CalendarRange } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePermissions } from '../../features/auth/hooks/usePermissions';
import { PATHS } from '../../routes/paths';
import EmptyState from './EmptyState';

// Lo que ve un módulo cuando todavía no existe ningún período académico.
// El botón para crearlo solo aparece si el rol puede agregar períodos.
const NoPeriodState = () => {
  const permissions = usePermissions();
  const canCreatePeriod = permissions.can('academicPeriods', 'create');
  const text = canCreatePeriod
    ? 'Este módulo trabaja por período académico. Crea el primero (por ejemplo, julio 2026 a abril 2027).'
    : 'Este módulo trabaja por período académico y todavía no hay ninguno. Pide a Administración que lo cree.';

  return (
    <section className="panel">
      <EmptyState
        action={
          canCreatePeriod && (
            <Link className="btn btn-primary" to={PATHS.academicPeriods}>
              Crear período académico
            </Link>
          )
        }
        icon={CalendarRange}
        text={text}
        title="Falta el período académico"
      />
    </section>
  );
};

export default NoPeriodState;
