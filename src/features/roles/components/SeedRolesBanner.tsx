import { useAsyncAction } from '../../../shared/hooks/useAsyncAction';
import { DEFAULT_ROLES } from '../defaultRoles';
import { seedDefaultRoles } from '../services/roleRecords';

interface SeedRolesBannerProps {
  existingRoleIds: string[];
}

// Ofrece crear los roles predeterminados que falten (Administración, Director, Maestro, Estudiante).
const SeedRolesBanner = ({ existingRoleIds }: SeedRolesBannerProps) => {
  const { error, isRunning, run } = useAsyncAction();
  const missingNames = DEFAULT_ROLES.filter((role) => !existingRoleIds.includes(role.id))
    .map((role) => role.name)
    .join(', ');

  return (
    <div className="seed-banner">
      <div className="seed-banner-text">
        <span className="seed-banner-title">Crea los roles predeterminados</span>
        <span className="seed-banner-detail">
          Faltan: {missingNames}. Vienen con permisos sugeridos que puedes ajustar después.
        </span>
        {error && <span className="field-error">{error}</span>}
      </div>
      <button className="btn btn-primary" disabled={isRunning} onClick={() => run(() => seedDefaultRoles(existingRoleIds))} type="button">
        {isRunning ? 'Creando…' : 'Crear roles'}
      </button>
    </div>
  );
};

export default SeedRolesBanner;
