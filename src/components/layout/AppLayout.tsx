import { Suspense, useMemo, useState } from 'react';
import { Outlet } from 'react-router-dom';
import AcademicPeriodProvider from '../../features/academic-periods/components/AcademicPeriodProvider';
import AppSettingsProvider from '../../features/customization/components/AppSettingsProvider';
import ViewAsBanner from '../../features/view-as/components/ViewAsBanner';
import ViewAsProvider from '../../features/view-as/components/ViewAsProvider';
import ListSkeleton from '../../shared/components/ListSkeleton';
import Sidebar from './Sidebar';
import { SidebarContext } from './sidebarContext';
import Topbar from './Topbar';
import './AppLayout.css';

// Marco del portal para todos los roles: menú lateral (filtrado por rol), barra superior (período,
// notificaciones, ver como) y la vista. AppSettingsProvider da el menú y las columnas personalizadas. ViewAsProvider va por fuera: todo lo de adentro usa la sesión "vista como".
const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const sidebarControls = useMemo(
    () => ({
      closeSidebar: () => setIsSidebarOpen(false),
      openSidebar: () => setIsSidebarOpen(true),
    }),
    [],
  );

  return (
    <ViewAsProvider>
      <AppSettingsProvider>
        <AcademicPeriodProvider>
        <SidebarContext.Provider value={sidebarControls}>
          <div className={`app-layout${isSidebarOpen ? ' is-sidebar-open' : ''}`}>
            <Sidebar />
            {isSidebarOpen && (
              <button
                aria-label="Cerrar menú"
                className="app-backdrop"
                onClick={sidebarControls.closeSidebar}
                type="button"
              />
            )}
            <main className="app-main">
              <ViewAsBanner />
              <Topbar />
              <Suspense fallback={<ListSkeleton rows={8} />}>
                <Outlet />
              </Suspense>
            </main>
          </div>
        </SidebarContext.Provider>
        </AcademicPeriodProvider>
      </AppSettingsProvider>
    </ViewAsProvider>
  );
};

export default AppLayout;
