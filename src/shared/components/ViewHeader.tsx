import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { NAVIGATION_ITEMS } from '../../components/layout/navigation';
import { useAppSettings } from '../../features/customization/appSettingsContext';
import { getNavigationLabel } from '../../features/customization/navigationLayout';

interface ViewHeaderProps {
  children?: ReactNode;
  subtitle?: string;
  title: string;
}

// Si la pantalla es una opción del menú y en Personalizar se le cambió el nombre, el título usa ese nombre.
const useScreenTitle = (title: string) => {
  const { pathname } = useLocation();
  const { settings } = useAppSettings();
  const menuItem = NAVIGATION_ITEMS.find((item) => item.path === pathname && item.label === title);
  return menuItem ? getNavigationLabel(menuItem, settings) : title;
};

const ViewHeader = ({ children, subtitle, title }: ViewHeaderProps) => {
  const screenTitle = useScreenTitle(title);

  return (
    <header className="view-header">
      <div className="view-header-title-group">
        <div>
          <h1 className="view-title">{screenTitle}</h1>
          {subtitle && <p className="view-subtitle">{subtitle}</p>}
        </div>
      </div>
      {children && <div className="view-actions">{children}</div>}
    </header>
  );
};

export default ViewHeader;
