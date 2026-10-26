import { createContext, useContext } from 'react';

interface SidebarControls {
  closeSidebar: () => void;
  openSidebar: () => void;
}

export const SidebarContext = createContext<SidebarControls>({
  closeSidebar: () => undefined,
  openSidebar: () => undefined,
});

export const useSidebar = () => useContext(SidebarContext);
