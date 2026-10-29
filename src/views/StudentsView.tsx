import { FileUp, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAcademicPeriod } from '../features/academic-periods/academicPeriodContext';
import ImportStudentsDialog from '../features/students/components/ImportStudentsDialog';
import StudentForm from '../features/students/components/StudentForm';
import TestDataBanner from '../features/students/components/TestDataBanner';
import StudentList from '../features/students/components/StudentList';
import { usePermissions, useRowPermissions } from '../features/auth/hooks/usePermissions';
import { deleteStudent } from '../features/students/services/studentRecords';
import { buildStudentDetailPath } from '../routes/paths';
import ConfirmDialog from '../shared/components/ConfirmDialog';
import SearchInput from '../shared/components/SearchInput';
import ViewHeader from '../shared/components/ViewHeader';
import { useStudentDirectory } from '../shared/data/useScopedData';
import { exportToExcel } from '../shared/export/exportToExcel';
import ExportButton from '../shared/components/ExportButton';
import { STUDENT_EXPORT_COLUMNS } from '../features/students/studentExport';
import { useCrudScreen } from '../shared/hooks/useCrudScreen';
import type { Student } from '../types/index';
import { matchesSearch } from '../utils/search';

const StudentsView = () => {
  const { data: students, isLoading } = useStudentDirectory();
  const permissions = usePermissions();
  const rowPermissions = useRowPermissions('students');
  const { askDelete, cancelDelete, closeEditor, editingRecord, editor, openEdit, openNew, recordToDelete } =
    useCrudScreen<Student>();
  const [search, setSearch] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const { selectedPeriod } = useAcademicPeriod();
  const testStudents = students.filter((student) => student.isTest);
  const navigate = useNavigate();

  const visibleStudents = students.filter((student) =>
    matchesSearch([student.name, student.code, student.church, student.city, student.pastor], search),
  );
  const handleSaved = (studentId: string) => {
    const isNewStudent = !editingRecord;
    closeEditor();
    if (isNewStudent) navigate(buildStudentDetailPath(studentId));
  };

  const subtitle = `${students.length} alumnos registrados`;

  return (
    <div className="view">
      <ViewHeader subtitle={subtitle} title="Alumnos">
        <SearchInput label="Buscar alumno" onChange={setSearch} placeholder="Nombre, código, iglesia…" value={search} />
        {permissions.can('students', 'export') && (
          <ExportButton
            disabled={visibleStudents.length === 0}
            onExport={() => exportToExcel('Alumnos', STUDENT_EXPORT_COLUMNS, visibleStudents)}
          />
        )}
        {permissions.can('students', 'create') && (
          <button className="btn btn-secondary" onClick={() => setIsImporting(true)} type="button">
            <FileUp size={18} />
            Importar alumnos
          </button>
        )}
        {permissions.can('students', 'create') && (
          <button className="btn btn-primary" onClick={openNew} type="button">
            <UserPlus size={18} />
            Registro
          </button>
        )}
      </ViewHeader>
      {testStudents.length > 0 && (
        <TestDataBanner canDelete={permissions.can('students', 'delete')} testStudents={testStudents} />
      )}
      <section className="panel panel-body-flush">
        <StudentList
          hasSearch={search.trim().length > 0}
          isLoading={isLoading}
          onDelete={askDelete}
          onEdit={openEdit}
          rowPermissions={rowPermissions}
          students={visibleStudents}
        />
      </section>
      {isImporting && (
        <ImportStudentsDialog onClose={() => setIsImporting(false)} period={selectedPeriod} students={students} />
      )}
      {editor.mode !== 'closed' && (
        <StudentForm
          key={editingRecord?.id ?? 'new'}
          onClose={closeEditor}
          onSaved={handleSaved}
          student={editingRecord}
          students={students}
        />
      )}
      {recordToDelete && (
        <ConfirmDialog
          confirmLabel="Eliminar alumno"
          description={`Se eliminará a ${recordToDelete.name} (${recordToDelete.code}). Si tiene inscripciones no se podrá eliminar.`}
          item={recordToDelete}
          onCancel={cancelDelete}
          onConfirm={deleteStudent}
          title="Eliminar alumno"
        />
      )}
    </div>
  );
};

export default StudentsView;
