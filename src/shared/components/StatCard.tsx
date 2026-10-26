import type { LucideIcon } from 'lucide-react';
import './StatCard.css';

interface StatCardProps {
  detail: string;
  icon: LucideIcon;
  label: string;
  value: string;
}

const StatCard = ({ detail, icon: Icon, label, value }: StatCardProps) => (
  <article className="panel stat-card">
    <div className="stat-card-top">
      <span className="stat-card-label">{label}</span>
      <span className="stat-card-icon">
        <Icon size={18} />
      </span>
    </div>
    <span className="stat-card-value">{value}</span>
    <span className="stat-card-detail">{detail}</span>
  </article>
);

export default StatCard;
