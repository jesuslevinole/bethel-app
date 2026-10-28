import { BellRing, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { AppNotification } from '../../../types/index';

interface PendingListProps {
  notifications: AppNotification[];
}

// Lo que conviene atender hoy (los mismos avisos de la campana).
const PendingList = ({ notifications }: PendingListProps) => (
  <section className="panel panel-padded pending-list">
    <h2 className="panel-title">
      <BellRing size={18} />
      Para atender
    </h2>
    <ul>
      {notifications.map((notification) => (
        <li className={`pending-item is-${notification.tone}`} key={notification.id}>
          <span className="pending-item-text">
            <span className="pending-item-title">{notification.title}</span>
            <span className="pending-item-detail">{notification.detail}</span>
          </span>
          {notification.path && (
            <Link aria-label={`Ir a ${notification.title}`} className="btn btn-icon" to={notification.path}>
              <ChevronRight size={18} />
            </Link>
          )}
        </li>
      ))}
    </ul>
  </section>
);

export default PendingList;
