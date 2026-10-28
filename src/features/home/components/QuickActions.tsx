import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { NavigationLink } from '../../customization/navigationLayout';

interface QuickActionsProps {
  links: NavigationLink[];
}

// Tarjetas grandes para llegar a cada sección con un toque (pensado para quien usa poco la computadora).
const QuickActions = ({ links }: QuickActionsProps) => (
  <ul className="quick-actions">
    {links.map(({ item, label }) => {
      const Icon = item.icon;
      return (
        <li key={item.path}>
          <Link className="quick-action" to={item.path}>
            <span className="quick-action-icon">
              <Icon size={24} />
            </span>
            <span className="quick-action-text">
              <span className="quick-action-title">{label}</span>
              <span className="quick-action-description">{item.description}</span>
            </span>
            <ChevronRight aria-hidden="true" className="quick-action-arrow" size={20} />
          </Link>
        </li>
      );
    })}
  </ul>
);

export default QuickActions;
