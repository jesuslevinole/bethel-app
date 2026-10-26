import { Suspense, useMemo, useState } from 'react';
import { Outlet } from 'react-router-dom';
import ListSkeleton from '../../shared/components/ListSkeleton';
import Sidebar from './Sidebar';
import { SidebarContext } from './sidebarContext';
import './AdminLayout.css';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const sidebarControls = useMemo(
    () => ({
      closeSidebar: () => setIsSidebarOpen(false),
      openSidebar: () => setIsSidebarOpen(true),
    }),
    [],
  );

  return (
    <SidebarContext.Provider value={sidebarControls}>
      <div className={`admin-layout${isSidebarOpen ? ' is-sidebar-open' : ''}`}>
        <Sidebar />
        {isSidebarOpen && (
          <button
            aria-label="Cerrar menú"
            className="admin-backdrop"
            onClick={sidebarControls.closeSidebar}
            type="button"
          />
        )}
        <main className="admin-main">
          <Suspense fallback={<ListSkeleton rows={8} />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </SidebarContext.Provider>
  );
};

export default AdminLayout;
