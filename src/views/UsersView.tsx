import { UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useAppSession } from '../features/auth/appSessionContext';
import { usePermissions, useRowPermissions } from '../features/auth/hooks/usePermissions';
import UserForm from '../features/users/components/UserForm';
import UserList from '../features/users/components/UserList';
import { deleteUserProfile } from '../features/users/services/userAccounts';
import { toUserRows } from '../features/users/userRows';
import ConfirmDialog from '../shared/components/ConfirmDialog';
import SearchInput from '../shared/components/SearchInput';
import ViewHeader from '../shared/components/ViewHeader';
import { useLiveCollection, useLiveData } from '../shared/data/liveCollections';
import { useStudentDirectory } from '../shared/data/useScopedData';
import { useCrudScreen } from '../shared/hooks/useCrudScreen';
import { exportToExcel } from '../shared/export/exportToExcel';
import ExportButton from '../shared/components/ExportButton';
import { USER_EXPORT_COLUMNS } from '../features/users/userExport';
import type { AppUser } from '../types/index';
import { pluralize } from '../utils/plural';
import { matchesSearch } from '../utils/search';

const UsersView = () => {
  const { uid } = useAppSession();
  const permissions = usePermissions();
  const rowPermissions = useRowPermissions('users');
  const { data: users, isLoading } = useLiveCollection('appUsers');
  const roles = useLiveData('roles');
  const teachers = useLiveData('teachers');
  const { data: students } = useStudentDirectory();
  const { askDelete, cancelDelete, closeEditor, editingRecord, editor, openEdit, openNew, recordToDelete } =
    useCrudScreen<AppUser>();
  const [search, setSearch] = useState('');

  const rows = toUserRows(users, { currentUid: uid, roles, students, teachers }).filter((row) =>
    matchesSearch([row.user.name, row.user.email, row.roleName, row.linkLabel], search),
  );
  const activeCount = users.filter((user) => user.active).length;
  const subtitle = `${pluralize(activeCount, 'usuario activo', 'usuarios activos')} de ${users.length}`;

  return (
    <div className="view">
      <ViewHeader subtitle={subtitle} title="Usuarios">
        <SearchInput label="Buscar usuario" onChange={setSearch} placeholder="Nombre, correo o rol…" value={search} />
        {permissions.can('users', 'export') && (
          <ExportButton disabled={rows.length === 0} onExport={() => exportToExcel('Usuarios', USER_EXPORT_COLUMNS, rows)} />
        )}
        {permissions.can('users', 'create') && (
          <button className="btn btn-primary" onClick={openNew} type="button">
            <UserPlus size={18} />
            Nuevo usuario
          </button>
        )}
      </ViewHeader>
      <section className="panel panel-body-flush">
        <UserList isLoading={isLoading} onDelete={askDelete} onEdit={openEdit} rowPermissions={rowPermissions} rows={rows} />
      </section>
      {editor.mode !== 'closed' && (
        <UserForm
          key={editingRecord?.id ?? 'new'}
          onClose={closeEditor}
          roles={roles}
          students={students}
          teachers={teachers}
          user={editingRecord}
        />
      )}
      {recordToDelete && (
        <ConfirmDialog
          confirmLabel="Eliminar usuario"
          description={`${recordToDelete.name} ya no podrá entrar. Si solo quieres pausar su acceso, edítalo y desmárcalo como activo.`}
          item={recordToDelete}
          onCancel={cancelDelete}
          onConfirm={deleteUserProfile}
          title="Eliminar usuario"
        />
      )}
    </div>
  );
};

export default UsersView;
