import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  action?: ReactNode;
  icon: LucideIcon;
  text: string;
  title: string;
}

const EmptyState = ({ action, icon: Icon, text, title }: EmptyStateProps) => (
  <div className="empty-state">
    <span className="empty-state-icon">
      <Icon size={24} />
    </span>
    <h3 className="empty-state-title">{title}</h3>
    <p className="empty-state-text">{text}</p>
    {action}
  </div>
);

export default EmptyState;
