import { KeyRound } from 'lucide-react';
import { useState } from 'react';
import TeacherAccessForm from '../features/teacher-access/components/TeacherAccessForm';
import TeacherAccessList from '../features/teacher-access/components/TeacherAccessList';
import { removeTeacherAccess } from '../features/teacher-access/services/teacherAccounts';
import ConfirmDialog from '../shared/components/ConfirmDialog';
import ViewHeader from '../shared/components/ViewHeader';
import { useLiveCollection, useLiveData } from '../shared/data/liveCollections';
import type { TeacherUser } from '../types/index';
import { pluralize } from '../utils/plural';

const TeacherAccessView = () => {
  const { data: accesses, isLoading } = useLiveCollection('teacherUsers');
  const teachers = useLiveData('teachers');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [accessToRemove, setAccessToRemove] = useState<TeacherUser | null>(null);

  const teacherIdsWithAccess = new Set(accesses.map((access) => access.teacherId));
  const teachersWithoutAccess = teachers.filter((teacher) => !teacherIdsWithAccess.has(teacher.id));
  const subtitle = `${pluralize(accesses.length, 'maestro con acceso', 'maestros con acceso')} de ${teachers.length}`;

  return (
    <div className="view">
      <ViewHeader subtitle={subtitle} title="Accesos de maestros">
        <button className="btn btn-primary" onClick={() => setIsFormOpen(true)} type="button">
          <KeyRound size={18} />
          Dar acceso
        </button>
      </ViewHeader>
      <section className="panel panel-body-flush">
        <TeacherAccessList accesses={accesses} isLoading={isLoading} onRemove={setAccessToRemove} />
      </section>
      {isFormOpen && (
        <TeacherAccessForm onClose={() => setIsFormOpen(false)} teachersWithoutAccess={teachersWithoutAccess} />
      )}
      {accessToRemove && (
        <ConfirmDialog
          confirmLabel="Quitar acceso"
          description={`${accessToRemove.name} ya no podrá entrar. Su asistencia y notas guardadas se conservan.`}
          item={accessToRemove}
          onCancel={() => setAccessToRemove(null)}
          onConfirm={removeTeacherAccess}
          title="Quitar acceso"
        />
      )}
    </div>
  );
};

export default TeacherAccessView;
