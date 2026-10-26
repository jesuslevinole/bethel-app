import type { ReactNode } from 'react';

interface ViewHeaderProps {
  children?: ReactNode;
  subtitle?: string;
  title: string;
}

const ViewHeader = ({ children, subtitle, title }: ViewHeaderProps) => (
  <header className="view-header">
    <div className="view-header-title-group">
      <div>
        <h1 className="view-title">{title}</h1>
        {subtitle && <p className="view-subtitle">{subtitle}</p>}
      </div>
    </div>
    {children && <div className="view-actions">{children}</div>}
  </header>
);

export default ViewHeader;
