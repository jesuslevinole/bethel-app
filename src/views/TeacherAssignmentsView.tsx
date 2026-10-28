import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useAcademicPeriod } from '../features/academic-periods/academicPeriodContext';
import { usePermissions, useRowPermissions } from '../features/auth/hooks/usePermissions';
import { findRepeatedSubjects } from '../features/teacher-assignments/assignmentForm';
import { toAssignmentRows } from '../features/teacher-assignments/assignmentRows';
import AssignmentForm from '../features/teacher-assignments/components/AssignmentForm';
import RefreshRostersButton from '../features/teacher-assignments/components/RefreshRostersButton';
import AssignmentList from '../features/teacher-assignments/components/AssignmentList';
import { deleteAssignment } from '../features/teacher-assignments/services/assignmentRecords';
import { useAssignmentLookups } from '../features/teacher-assignments/hooks/useAssignmentLookups';
import ConfirmDialog from '../shared/components/ConfirmDialog';
import FilterChips from '../shared/components/FilterChips';
import NoPeriodState from '../shared/components/NoPeriodState';
import SearchInput from '../shared/components/SearchInput';
import ViewHeader from '../shared/components/ViewHeader';
import { useScopedPeriodCollection } from '../shared/data/useScopedData';
import { useCrudScreen } from '../shared/hooks/useCrudScreen';
import { exportToExcel } from '../shared/export/exportToExcel';
import ExportButton from '../shared/components/ExportButton';
import { ASSIGNMENT_EXPORT_COLUMNS } from '../features/teacher-assignments/assignmentExport';
import type { TeacherAssignment } from '../types/index';
import { toSelectOptions } from '../utils/options';
import { pluralize } from '../utils/plural';
import { getRelationName } from '../utils/relations';
import { matchesSearch } from '../utils/search';

const TeacherAssignmentsView = () => {
  const { isLoading: isLoadingPeriods, selectedPeriod } = useAcademicPeriod();
  const { data: assignments, isLoading } = useScopedPeriodCollection('teacherAssignments', selectedPeriod?.id ?? null);
  const { classNames, classes, subjectNames, subjects, teacherNames, teachers } = useAssignmentLookups();
  const permissions = usePermissions();
  const rowPermissions = useRowPermissions('teacherAssignments');
  const canCreate = permissions.can('teacherAssignments', 'create');
  const canRefreshRosters = permissions.scope('enrollments') === 'all' && permissions.can('teacherAssignments', 'edit');
  const { askDelete, cancelDelete, closeEditor, editingRecord, editor, openEdit, openNew, recordToDelete } =
    useCrudScreen<TeacherAssignment>();
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');

  const visibleRows = toAssignmentRows(assignments, { classNames, subjectNames, teacherNames }).filter(
    (row) =>
      (!classFilter || row.assignment.classId === classFilter) &&
      matchesSearch([row.teacherName, ...row.subjectNames], search),
  );
  const repeatedSubjects = findRepeatedSubjects(assignments).map(
    ([subjectId, teacherIds]) =>
      `${getRelationName(subjectNames, subjectId)} (${teacherIds.map((teacherId) => getRelationName(teacherNames, teacherId)).join(' y ')})`,
  );
  const teacherCount = new Set(assignments.map((assignment) => assignment.teacherId)).size;
  const subtitle = selectedPeriod
    ? `${pluralize(teacherCount, 'maestro', 'maestros')} con materias en ${selectedPeriod.name}`
    : 'Sin período académico';
  const hasFilters = Boolean(classFilter || search.trim());
  const showNoPeriod = !isLoadingPeriods && !selectedPeriod;

  return (
    <div className="view">
      <ViewHeader subtitle={subtitle} title="Materias por maestro">
        <SearchInput label="Buscar" onChange={setSearch} placeholder="Maestro o materia…" value={search} />
        {canRefreshRosters && <RefreshRostersButton assignments={assignments} />}
        {permissions.can('teacherAssignments', 'export') && selectedPeriod && (
          <ExportButton
            disabled={visibleRows.length === 0}
            onExport={() =>
              exportToExcel(`Materias por maestro ${selectedPeriod.name}`, ASSIGNMENT_EXPORT_COLUMNS, visibleRows)
            }
          />
        )}
        {canCreate && (
          <button className="btn btn-primary" disabled={!selectedPeriod} onClick={openNew} type="button">
            <Plus size={18} />
            Asignar materias
          </button>
        )}
      </ViewHeader>
      {showNoPeriod && <NoPeriodState />}
      {selectedPeriod && (
        <>
          {repeatedSubjects.length > 0 && (
            <p className="form-alert">
              Materias con más de un maestro en este período: {repeatedSubjects.join(', ')}. Edita los registros y deja
              cada materia con un solo maestro.
            </p>
          )}
          <FilterChips
            allLabel="Todas las clases"
            label="Filtrar por clase"
            onChange={setClassFilter}
            options={toSelectOptions(classes)}
            value={classFilter}
          />
          <section className="panel panel-body-flush">
            <AssignmentList
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
        <AssignmentForm
          assignment={editingRecord}
          classes={classes}
          key={editingRecord?.id ?? 'new'}
          onClose={closeEditor}
          period={selectedPeriod}
          periodAssignments={assignments}
          subjectNames={subjectNames}
          subjects={subjects}
          teacherNames={teacherNames}
          teachers={teachers}
        />
      )}
      {recordToDelete && (
        <ConfirmDialog
          confirmLabel="Eliminar registro"
          description={`Se eliminarán las materias asignadas a ${getRelationName(teacherNames, recordToDelete.teacherId)} en este período.`}
          item={recordToDelete}
          onCancel={cancelDelete}
          onConfirm={deleteAssignment}
          title="Eliminar materias del maestro"
        />
      )}
    </div>
  );
};

export default TeacherAssignmentsView;
