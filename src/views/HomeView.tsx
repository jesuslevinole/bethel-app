import { NAVIGATION_ITEMS } from '../components/layout/navigation';
import { useSessionRoleKind, useVisibleNavigation } from '../components/layout/useVisibleNavigation';
import { useAppSession } from '../features/auth/appSessionContext';
import { useAppSettings } from '../features/customization/appSettingsContext';
import { getNavigationLabel } from '../features/customization/navigationLayout';
import PendingList from '../features/home/components/PendingList';
import QuickActions from '../features/home/components/QuickActions';
import { describeNextClass, getFirstName, getGreeting, sortForHome } from '../features/home/homeContent';
import { useNotifications } from '../features/notifications/hooks/useNotifications';
import { formatLongDate, todayIso } from '../utils/dateFormat';
import '../features/home/components/Home.css';

// Inicio de todos: saludo, el día de clase y accesos grandes a lo que cada quien usa.
const HomeView = () => {
  const { appUser, owner } = useAppSession();
  const roleKind = useSessionRoleKind();
  const navigation = useVisibleNavigation();
  const { settings } = useAppSettings();
  const notifications = useNotifications();
  const visiblePaths = new Set(navigation.flatMap((group) => group.items.map((item) => item.path)));
  const links = sortForHome(
    NAVIGATION_ITEMS.filter((item) => visiblePaths.has(item.path)),
    roleKind,
  ).map((item) => ({ item, label: getNavigationLabel(item, settings) }));
  const firstName = getFirstName(owner?.name ?? appUser?.name ?? '');
  const today = todayIso();

  return (
    <div className="view home-view">
      <header className="home-hero">
        <p className="home-date">{formatLongDate(today)}</p>
        <h1 className="home-greeting">
          {getGreeting()}
          {firstName && `, ${firstName}`}
        </h1>
        <p className="home-class-day">{describeNextClass(today)}</p>
      </header>
      <div className={notifications.length > 0 ? 'home-body has-pending' : 'home-body'}>
        <section className="home-actions">
          <h2 className="home-section-title">¿Qué quieres hacer?</h2>
          <QuickActions links={links} />
        </section>
        {notifications.length > 0 && <PendingList notifications={notifications.slice(0, 5)} />}
      </div>
    </div>
  );
};

export default HomeView;
