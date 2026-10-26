import { ChevronRight, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import './PortalOption.css';

interface PortalOptionProps {
  description: string;
  icon: LucideIcon;
  title: string;
  to?: string;
}

// Una puerta del portal. Sin `to` se muestra como "Próximamente".
const PortalOption = ({ description, icon: Icon, title, to }: PortalOptionProps) => {
  const content = (
    <>
      <span className="portal-option-icon">
        <Icon size={20} />
      </span>
      <span className="portal-option-text">
        <span className="portal-option-title">{title}</span>
        <span className="portal-option-description">{description}</span>
      </span>
    </>
  );

  if (!to) {
    return (
      <div aria-disabled="true" className="portal-option is-disabled">
        {content}
        <span className="badge badge-muted">Próximamente</span>
      </div>
    );
  }

  return (
    <Link className="portal-option" to={to}>
      {content}
      <ChevronRight aria-hidden="true" className="portal-option-arrow" size={20} />
    </Link>
  );
};

export default PortalOption;
