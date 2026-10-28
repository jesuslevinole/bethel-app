import { ChevronDown, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAppSettings } from '../../features/customization/appSettingsContext';
import { buildNavigationLayout, type NavigationLink } from '../../features/customization/navigationLayout';
import { PATHS } from '../../routes/paths';
import Crest from '../../shared/components/Crest';
import OliveBranch from './OliveBranch';
import { useSidebar } from './sidebarContext';
import UserCard from './UserCard';
import { useVisibleNavigation } from './useVisibleNavigation';
import './Sidebar.css';

interface SidebarLinkProps {
  link: NavigationLink;
  onNavigate: () => void;
}

const SidebarLink = ({ link, onNavigate }: SidebarLinkProps) => {
  const { icon: Icon, path } = link.item;
  return (
    <NavLink className="sidebar-link" onClick={onNavigate} to={path}>
      <Icon size={20} />
      <span className="sidebar-link-label">{link.label}</span>
    </NavLink>
  );
};

// Menú lateral. El orden, los nombres y las listas desplegables salen de Personalizar (si se cambiaron).
const Sidebar = () => {
  const { closeSidebar } = useSidebar();
  const navigation = useVisibleNavigation();
  const { settings } = useAppSettings();
  const { pathname } = useLocation();
  const entries = buildNavigationLayout(navigation, settings);
  // Listas que la persona abrió o cerró a mano; las demás se abren solas si tienen la pantalla actual.
  const [toggledGroups, setToggledGroups] = useState<Record<string, boolean>>({});

  const isGroupOpen = (groupId: string, links: NavigationLink[]) =>
    toggledGroups[groupId] ?? links.some((link) => pathname.startsWith(link.item.path));

  const handleToggleGroup = (groupId: string, isOpen: boolean) =>
    setToggledGroups((current) => ({ ...current, [groupId]: !isOpen }));

  return (
    <aside aria-label="Menú principal" className="sidebar">
      <div className="sidebar-top">
        <Link className="sidebar-brand" onClick={closeSidebar} to={PATHS.app}>
          <Crest inverted size={44} />
          <span>
            <span className="sidebar-brand-name">Bethel</span>
            <span className="sidebar-brand-area">Bible Institute</span>
          </span>
        </Link>
        <button aria-label="Cerrar menú" className="btn btn-icon sidebar-close" onClick={closeSidebar} type="button">
          <X size={20} />
        </button>
      </div>
      <nav className="sidebar-nav">
        {entries.map((entry) => {
          if (entry.kind === 'separator') return <hr className="sidebar-separator" key={entry.id} />;
          if (entry.kind === 'link') {
            return <SidebarLink key={entry.link.item.path} link={entry.link} onNavigate={closeSidebar} />;
          }
          const isOpen = isGroupOpen(entry.group.id, entry.links);
          return (
            <div className={`sidebar-group${isOpen ? ' is-open' : ''}`} key={entry.group.id}>
              <button
                aria-expanded={isOpen}
                className="sidebar-group-toggle"
                onClick={() => handleToggleGroup(entry.group.id, isOpen)}
                type="button"
              >
                <span className="sidebar-link-label">{entry.group.label}</span>
                <ChevronDown aria-hidden="true" className="sidebar-group-chevron" size={18} />
              </button>
              {isOpen && (
                <div className="sidebar-group-links">
                  {entry.links.map((link) => (
                    <SidebarLink key={link.item.path} link={link} onNavigate={closeSidebar} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      <OliveBranch />
      <UserCard />
    </aside>
  );
};

export default Sidebar;
