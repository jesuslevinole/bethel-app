import PeriodSelector from '../../features/academic-periods/components/PeriodSelector';
import { usePermissions } from '../../features/auth/hooks/usePermissions';
import NotificationsMenu from '../../features/notifications/components/NotificationsMenu';
import ViewAsMenu from '../../features/view-as/components/ViewAsMenu';
import { PATHS } from '../../routes/paths';
import MenuButton from '../../shared/components/MenuButton';
import './Topbar.css';

// Barra superior de todas las vistas: período académico, notificaciones y "ver como" (propietario).
const Topbar = () => {
  const permissions = usePermissions();
  const managePeriodsPath = permissions.can('academicPeriods', 'create') ? PATHS.academicPeriods : undefined;

  return (
    <div className="topbar">
      <MenuButton />
      <div className="topbar-period">
        <PeriodSelector managePath={managePeriodsPath} />
      </div>
      <div className="topbar-actions">
        <NotificationsMenu />
        <ViewAsMenu />
      </div>
    </div>
  );
};

export default Topbar;
