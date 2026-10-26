import { Bell, CircleAlert, CircleCheck, Info } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import Popover from '../../../shared/components/Popover';
import type { AppNotification } from '../../../types/index';
import { useAppSession } from '../../auth/appSessionContext';
import { useNotifications } from '../hooks/useNotifications';
import { useSeenNotifications } from '../hooks/useSeenNotifications';
import './Notifications.css';

const MAX_BADGE = 9;

// Campana de la barra superior: avisos calculados para el rol actual; el número cuenta los no vistos.
const NotificationsMenu = () => {
  const { appUser, uid } = useAppSession();
  const notifications = useNotifications();
  const { isUnseen, markAllSeen, unseenCount } = useSeenNotifications(appUser?.id ?? uid ?? 'anon', notifications);
  // Los que eran nuevos al abrir: se marcan vistos enseguida, pero se siguen resaltando mientras el panel está abierto.
  const [newIds, setNewIds] = useState<Set<string>>(new Set());

  const handleOpen = () => {
    setNewIds(new Set(notifications.filter(isUnseen).map((notification) => notification.id)));
    markAllSeen();
  };

  const renderNotification = (notification: AppNotification, close: () => void) => {
    const Icon = notification.tone === 'warning' ? CircleAlert : Info;
    const content: ReactNode = (
      <>
        <span aria-hidden="true" className={`notification-icon is-${notification.tone}`}>
          <Icon size={17} />
        </span>
        <span className="popover-option-text">
          <span className="popover-option-title">{notification.title}</span>
          <span className="popover-option-detail">{notification.detail}</span>
        </span>
        {newIds.has(notification.id) && <span aria-label="Nuevo" className="notification-new-dot" />}
      </>
    );
    if (!notification.path) {
      return (
        <div className="popover-option notification-item" key={notification.id}>
          {content}
        </div>
      );
    }
    return (
      <Link className="popover-option notification-item" key={notification.id} onClick={close} to={notification.path}>
        {content}
      </Link>
    );
  };

  const badgeText = unseenCount > MAX_BADGE ? `${MAX_BADGE}+` : String(unseenCount);

  return (
    <Popover
      label={unseenCount > 0 ? `Notificaciones, ${unseenCount} sin ver` : 'Notificaciones'}
      onOpen={handleOpen}
      trigger={
        <>
          <Bell size={20} />
          {unseenCount > 0 && <span className="notification-badge">{badgeText}</span>}
        </>
      }
      triggerClassName="btn btn-icon topbar-icon-button notification-trigger"
    >
      {(close) => (
        <>
          <div className="popover-header">
            <h2 className="popover-title">Notificaciones</h2>
            {notifications.length > 0 && <span className="badge badge-muted">{notifications.length}</span>}
          </div>
          <div className="popover-body">
            {notifications.length === 0 ? (
              <div className="notification-empty">
                <CircleCheck size={28} />
                <span className="popover-option-title">Todo en orden</span>
                <span className="popover-option-detail">No hay nada pendiente por ahora.</span>
              </div>
            ) : (
              notifications.map((notification) => renderNotification(notification, close))
            )}
          </div>
        </>
      )}
    </Popover>
  );
};

export default NotificationsMenu;
