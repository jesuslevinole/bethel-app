import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useAcademicPeriod } from '../features/academic-periods/academicPeriodContext';
import { usePermissions, useRowPermissions } from '../features/auth/hooks/usePermissions';
import EnrollmentForm from '../features/enrollments/components/EnrollmentForm';
import EnrollmentList from '../features/enrollments/components/EnrollmentList';
import { toEnrollmentRows } from '../features/enrollments/enrollmentRows';
import { deleteEnrollment } from '../features/enrollments/services/enrollmentRecords';
import { useEnrollmentLookups } from '../features/enrollments/hooks/useEnrollmentLookups';
import ConfirmDialog from '../shared/components/ConfirmDialog';
import FilterChips from '../shared/components/FilterChips';
import NoPeriodState from '../shared/components/NoPeriodState';
import SearchInput from '../shared/components/SearchInput';
import ViewHeader from '../shared/components/ViewHeader';
import { useScopedPeriodCollection } from '../shared/data/useScopedData';
import { useCrudScreen } from '../shared/hooks/useCrudScreen';
import { exportToExcel } from '../shared/export/exportToExcel';
import ExportButton from '../shared/components/ExportButton';
import { ENROLLMENT_EXPORT_COLUMNS } from '../features/enrollments/enrollmentExport';
import type { Enrollment } from '../types/index';
import { toSelectOptions } from '../utils/options';
import { pluralize } from '../utils/plural';
import { matchesSearch } from '../utils/search';

const EnrollmentsView = () => {
  const { isLoading: isLoadingPeriods, selectedPeriod } = useAcademicPeriod();
  const periodId = selectedPeriod?.id ?? null;
  const { data: enrollments, isLoading } = useScopedPeriodCollection('enrollments', periodId);
  const { classNames, classes, students, studentsById } = useEnrollmentLookups();
  const permissions = usePermissions();
  const rowPermissions = useRowPermissions('enrollments');
  const canCreate = permissions.can('enrollments', 'create');
  const { askDelete, cancelDelete, closeEditor, editingRecord, editor, openEdit, openNew, recordToDelete } =
    useCrudScreen<Enrollment>();
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');

  const visibleRows = toEnrollmentRows(enrollments, studentsById, classNames).filter(
    (row) =>
      (!classFilter || row.enrollment.classId === classFilter) &&
      matchesSearch([row.studentName, row.studentCode], search),
  );
  const subtitle = selectedPeriod
    ? `${pluralize(enrollments.length, 'alumno inscrito', 'alumnos inscritos')} en ${selectedPeriod.name}`
    : 'Sin período académico';
  const hasFilters = Boolean(classFilter || search.trim());
  const showNoPeriod = !isLoadingPeriods && !selectedPeriod;

  return (
    <div className="view">
      <ViewHeader subtitle={subtitle} title="Inscripciones">
        <SearchInput label="Buscar inscripción" onChange={setSearch} placeholder="Alumno o código…" value={search} />
        {permissions.can('enrollments', 'export') && selectedPeriod && (
          <ExportButton
            disabled={visibleRows.length === 0}
            onExport={() => exportToExcel(`Inscripciones ${selectedPeriod.name}`, ENROLLMENT_EXPORT_COLUMNS, visibleRows)}
          />
        )}
        {canCreate && (
          <button className="btn btn-primary" disabled={!selectedPeriod} onClick={openNew} type="button">
            <Plus size={18} />
            Inscribir alumno
          </button>
        )}
      </ViewHeader>
      {showNoPeriod && <NoPeriodState />}
      {selectedPeriod && (
        <>
          <FilterChips
            allLabel="Todas las clases"
            label="Filtrar por clase"
            onChange={setClassFilter}
            options={toSelectOptions(classes)}
            value={classFilter}
          />
          <section className="panel panel-body-flush">
            <EnrollmentList
              hasFilters={hasFilters}
              isLoading={isLoading}
              onDelete={askDelete}
              onEdit={openEdit}
              rowPermissions={rowPermissions}
              rows={visibleRows}
            />
          </section>
        </>
      )}
      {selectedPeriod && editor.mode !== 'closed' && (
        <EnrollmentForm
          classNames={classNames}
          classes={classes}
          enrollment={editingRecord}
          key={editingRecord?.id ?? 'new'}
          onClose={closeEditor}
          period={selectedPeriod}
          periodEnrollments={enrollments}
          students={students}
        />
      )}
      {recordToDelete && (
        <ConfirmDialog
          confirmLabel="Eliminar inscripción"
          description={`Se eliminará la inscripción de ${studentsById.get(recordToDelete.studentId)?.name ?? 'este alumno'}. El alumno sigue registrado.`}
          item={recordToDelete}
          onCancel={cancelDelete}
          onConfirm={deleteEnrollment}
          title="Eliminar inscripción"
        />
      )}
    </div>
  );
};

export default EnrollmentsView;
