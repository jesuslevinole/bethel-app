import { Lock } from 'lucide-react';
import type { ReactNode } from 'react';
import EmptyState from '../../../shared/components/EmptyState';
import { useSessionRoleKind } from '../../../components/layout/useVisibleNavigation';
import type { PermissionModule, RoleKind, ViewScope } from '../../../types/index';
import { usePermissions } from '../hooks/usePermissions';

interface RequirePermissionProps {
  children: ReactNode;
  // La vista se muestra si el rol ve CUALQUIERA de estos módulos. Vacío = cualquiera (o el tipo de rol de roleKinds).
  modules: PermissionModule[];
  roleKinds?: RoleKind[];
  // Si la vista necesita un alcance exacto (p. ej. "Mi ficha" solo con "propios").
  scope?: ViewScope;
}

// Guardia de cada vista según el rol. Si el rol no la ve, muestra un aviso en vez de la pantalla.
const RequirePermission = ({ children, modules, roleKinds, scope }: RequirePermissionProps) => {
  const permissions = usePermissions();
  const roleKind = useSessionRoleKind();
  const fitsRoleKind = !roleKinds || roleKinds.includes(roleKind);
  const seesModule =
    modules.length === 0 ||
    modules.some((module) => (scope ? permissions.scope(module) === scope : permissions.canView(module)));
  const isAllowed = fitsRoleKind && seesModule;

  if (!isAllowed) {
    return (
      <div className="view">
        <section className="panel">
          <EmptyState
            icon={Lock}
            text="Tu rol no incluye esta sección. Si la necesitas, pide a Administración que ajuste tu rol."
            title="Sin permiso para ver esto"
          />
        </section>
      </div>
    );
  }
  return children;
};

export default RequirePermission;
