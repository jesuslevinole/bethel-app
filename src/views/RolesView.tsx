import { Plus } from 'lucide-react';
import { usePermissions, useRowPermissions } from '../features/auth/hooks/usePermissions';
import { DEFAULT_ROLES } from '../features/roles/defaultRoles';
import RoleCards from '../features/roles/components/RoleCards';
import RoleEditorDialog from '../features/roles/components/RoleEditorDialog';
import RoleTable from '../features/roles/components/RoleTable';
import SeedRolesBanner from '../features/roles/components/SeedRolesBanner';
import { countVisibleModules } from '../features/roles/roleForm';
import { deleteRole } from '../features/roles/services/roleRecords';
import ConfirmDialog from '../shared/components/ConfirmDialog';
import ListSkeleton from '../shared/components/ListSkeleton';
import ViewHeader from '../shared/components/ViewHeader';
import { useLiveCollection } from '../shared/data/liveCollections';
import { useCrudScreen } from '../shared/hooks/useCrudScreen';
import { PHONE_QUERY, useMediaQuery } from '../shared/hooks/useMediaQuery';
import type { Role, RoleRow } from '../types/index';
import { pluralize } from '../utils/plural';
import '../features/roles/components/Roles.css';

const RolesView = () => {
  const permissions = usePermissions();
  const rowPermissions = useRowPermissions('roles');
  const isPhone = useMediaQuery(PHONE_QUERY);
  const { data: roles, isLoading } = useLiveCollection('roles');
  const canViewUsers = permissions.scope('users') === 'all';
  const { data: users } = useLiveCollection('appUsers', canViewUsers);
  const { askDelete, cancelDelete, closeEditor, editingRecord, editor, openEdit, openNew, recordToDelete } =
    useCrudScreen<Role>();

  const canCreate = permissions.can('roles', 'create');
  const existingRoleIds = roles.map((role) => role.id);
  const isMissingDefaults = DEFAULT_ROLES.some((role) => !existingRoleIds.includes(role.id));
  const canSaveEditor = editingRecord ? rowPermissions.canEdit : canCreate;
  const rows: RoleRow[] = roles.map((role) => ({
    role,
    userCount: canViewUsers ? users.filter((user) => user.roleId === role.id).length : null,
    visibleModules: countVisibleModules(role.permissions),
  }));

  return (
    <div className="view">
      <ViewHeader subtitle={pluralize(roles.length, 'rol', 'roles')} title="Roles y permisos">
        {canCreate && (
          <button className="btn btn-primary" onClick={openNew} type="button">
            <Plus size={18} />
            Nuevo rol
          </button>
        )}
      </ViewHeader>
      {!isLoading && isMissingDefaults && canCreate && <SeedRolesBanner existingRoleIds={existingRoleIds} />}
      <section className="panel panel-body-flush">
        {isLoading && <ListSkeleton />}
        {!isLoading && isPhone && (
          <RoleCards onDelete={askDelete} onOpen={openEdit} rowPermissions={rowPermissions} rows={rows} />
        )}
        {!isLoading && !isPhone && (
          <RoleTable onDelete={askDelete} onOpen={openEdit} rowPermissions={rowPermissions} rows={rows} />
        )}
      </section>
      {editor.mode !== 'closed' && (
        <RoleEditorDialog
          canSave={canSaveEditor}
          key={editingRecord?.id ?? 'new'}
          onClose={closeEditor}
          role={editingRecord}
          roles={roles}
        />
      )}
      {recordToDelete && (
        <ConfirmDialog
          confirmLabel="Eliminar rol"
          description={`Se eliminará el rol "${recordToDelete.name}". Si algún usuario lo tiene asignado, no se podrá eliminar.`}
          item={recordToDelete}
          onCancel={cancelDelete}
          onConfirm={deleteRole}
          title="Eliminar rol"
        />
      )}
    </div>
  );
};

export default RolesView;
