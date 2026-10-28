import { useAsyncAction } from '../../../shared/hooks/useAsyncAction';
import type { Role } from '../../../types/index';
import { addMissingModulePermissions, findRolesMissingModules } from '../services/roleRecords';

interface NewModulesBannerProps {
  roles: Role[];
}

// Los roles predeterminados guardados antes de los módulos nuevos no los ven hasta agregarles el permiso.
const NewModulesBanner = ({ roles }: NewModulesBannerProps) => {
  const { error, isRunning, run } = useAsyncAction();
  const pending = findRolesMissingModules(roles);
  const moduleNames = [...new Set(pending.flatMap(({ missingModules }) => missingModules.map(({ label }) => label)))];
  const roleNames = pending.map(({ role }) => role.name).join(', ');

  return (
    <div className="seed-banner">
      <div className="seed-banner-text">
        <span className="seed-banner-title">Hay módulos nuevos: {moduleNames.join(', ')}</span>
        <span className="seed-banner-detail">
          Agrega los permisos sugeridos a {roleNames}. Lo que ya ajustaste en esos roles no cambia.
        </span>
        {error && <span className="field-error">{error}</span>}
      </div>
      <button
        className="btn btn-primary"
        disabled={isRunning}
        onClick={() => run(() => addMissingModulePermissions(roles))}
        type="button"
      >
        {isRunning ? 'Agregando…' : 'Agregar permisos'}
      </button>
    </div>
  );
};

export default NewModulesBanner;
