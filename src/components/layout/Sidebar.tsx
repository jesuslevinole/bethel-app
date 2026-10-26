import { X } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { PATHS } from '../../routes/paths';
import Crest from '../../shared/components/Crest';
import { useSidebar } from './sidebarContext';
import UserCard from './UserCard';
import { useVisibleNavigation } from './useVisibleNavigation';
import './Sidebar.css';

const Sidebar = () => {
  const { closeSidebar } = useSidebar();
  const navigation = useVisibleNavigation();

  return (
    <aside aria-label="Menú principal" className="sidebar">
      <div className="sidebar-top">
        <Link className="sidebar-brand" onClick={closeSidebar} to={PATHS.app}>
          <Crest size={42} />
          <span>
            <span className="sidebar-brand-name">Bethel Bible Institute</span>
            <span className="sidebar-brand-area">Portal académico</span>
          </span>
        </Link>
        <button aria-label="Cerrar menú" className="btn btn-icon sidebar-close" onClick={closeSidebar} type="button">
          <X size={20} />
        </button>
      </div>
      <nav className="sidebar-nav">
        {navigation.map((group) => (
          <div className="sidebar-group" key={group.title}>
            {group.items.map(({ icon: Icon, label, path }) => (
              <NavLink className="sidebar-link" key={path} onClick={closeSidebar} to={path}>
                <Icon size={19} />
                {label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
      <UserCard />
    </aside>
  );
};

export default Sidebar;
