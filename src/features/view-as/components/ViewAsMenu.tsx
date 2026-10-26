import { Eye, Shield, UserRound, Undo2 } from 'lucide-react';
import { useState } from 'react';
import Popover from '../../../shared/components/Popover';
import SearchInput from '../../../shared/components/SearchInput';
import { useLiveCollection } from '../../../shared/data/liveCollections';
import { buildNameMap } from '../../../utils/relations';
import { matchesSearch } from '../../../utils/search';
import { useViewAs, type ViewAsTarget } from '../viewAsContext';
import './ViewAs.css';

const SEARCH_THRESHOLD = 6;

const isSameTarget = (first: ViewAsTarget | null, second: ViewAsTarget) =>
  first?.kind === second.kind &&
  (first.kind === 'role' ? first.roleId : first.userId) === (second.kind === 'role' ? second.roleId : second.userId);

// Botón del ojo: elige un rol (vista general) o un usuario (con su maestro o alumno) para ver la app como él.
const ViewAsMenu = () => {
  const { canViewAs, label, startViewAs, stopViewAs, target } = useViewAs();
  const [search, setSearch] = useState('');
  const { data: roles } = useLiveCollection('roles', canViewAs);
  const { data: users } = useLiveCollection('appUsers', canViewAs);

  if (!canViewAs) return null;

  const roleNames = buildNameMap(roles);
  const activeUsers = users.filter((user) => user.active);
  const visibleUsers = activeUsers.filter((user) =>
    matchesSearch([user.name, user.email, roleNames.get(user.roleId) ?? ''], search),
  );

  const renderOption = (optionTarget: ViewAsTarget, title: string, detail: string, close: () => void) => (
    <button
      className={`popover-option${isSameTarget(target, optionTarget) ? ' is-selected' : ''}`}
      key={optionTarget.kind === 'role' ? `role-${optionTarget.roleId}` : `user-${optionTarget.userId}`}
      onClick={() => {
        startViewAs(optionTarget);
        close();
      }}
      type="button"
    >
      <span aria-hidden="true" className="view-as-option-icon">
        {optionTarget.kind === 'role' ? <Shield size={16} /> : <UserRound size={16} />}
      </span>
      <span className="popover-option-text">
        <span className="popover-option-title">{title}</span>
        <span className="popover-option-detail">{detail}</span>
      </span>
    </button>
  );

  return (
    <Popover
      label="Ver como otro rol o usuario"
      onOpen={() => setSearch('')}
      trigger={<Eye size={20} />}
      triggerClassName={`btn btn-icon topbar-icon-button${label ? ' is-active' : ''}`}
    >
      {(close) => (
        <>
          <div className="popover-header">
            <div>
              <h2 className="popover-title">Ver como</h2>
              <p className="view-as-intro">Revisa lo que ve cada rol o usuario, con sus permisos.</p>
            </div>
          </div>
          <div className="popover-body">
            {label && (
              <button
                className="popover-option view-as-exit"
                onClick={() => {
                  stopViewAs();
                  close();
                }}
                type="button"
              >
                <span aria-hidden="true" className="view-as-option-icon">
                  <Undo2 size={16} />
                </span>
                <span className="popover-option-text">
                  <span className="popover-option-title">Volver a mi vista</span>
                  <span className="popover-option-detail">Ahora ves como {label}</span>
                </span>
              </button>
            )}
            <p className="popover-section-title">Roles</p>
            {roles.length === 0 && <p className="popover-empty">Todavía no hay roles.</p>}
            {roles.map((role) =>
              renderOption({ kind: 'role', roleId: role.id }, role.name, 'Vista general del rol', close),
            )}
            <p className="popover-section-title">Usuarios</p>
            {activeUsers.length > SEARCH_THRESHOLD && (
              <div className="view-as-search">
                <SearchInput label="Buscar usuario" onChange={setSearch} placeholder="Buscar usuario…" value={search} />
              </div>
            )}
            {visibleUsers.length === 0 && <p className="popover-empty">Ningún usuario activo coincide.</p>}
            {visibleUsers.map((user) =>
              renderOption(
                { kind: 'user', userId: user.id },
                user.name,
                roleNames.get(user.roleId) ?? 'Sin rol',
                close,
              ),
            )}
          </div>
        </>
      )}
    </Popover>
  );
};

export default ViewAsMenu;
