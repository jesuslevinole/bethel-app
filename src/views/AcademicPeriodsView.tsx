import { CalendarRange, Plus } from 'lucide-react';
import { useAcademicPeriod } from '../features/academic-periods/academicPeriodContext';
import { usePermissions, useRowPermissions } from '../features/auth/hooks/usePermissions';
import PeriodForm from '../features/academic-periods/components/PeriodForm';
import PeriodList from '../features/academic-periods/components/PeriodList';
import { deleteAcademicPeriod } from '../features/academic-periods/services/periodRecords';
import ConfirmDialog from '../shared/components/ConfirmDialog';
import EmptyState from '../shared/components/EmptyState';
import ListSkeleton from '../shared/components/ListSkeleton';
import ViewHeader from '../shared/components/ViewHeader';
import { useCrudScreen } from '../shared/hooks/useCrudScreen';
import type { AcademicPeriod } from '../types/index';

const AcademicPeriodsView = () => {
  const { isLoading, periods, selectPeriod, selectedPeriod } = useAcademicPeriod();
  const { askDelete, cancelDelete, closeEditor, editingRecord, editor, openEdit, openNew, recordToDelete } =
    useCrudScreen<AcademicPeriod>();
  const permissions = usePermissions();
  const rowPermissions = useRowPermissions('academicPeriods');
  const canCreate = permissions.can('academicPeriods', 'create');

  const handleSaved = (periodId: string) => {
    if (!selectedPeriod) selectPeriod(periodId);
    closeEditor();
  };

  const isEmpty = !isLoading && periods.length === 0;

  return (
    <div className="view">
      <ViewHeader subtitle="El período elegido en el menú filtra todos los módulos." title="Períodos académicos">
        {canCreate && (
          <button className="btn btn-primary" onClick={openNew} type="button">
            <Plus size={18} />
            Nuevo período
          </button>
        )}
      </ViewHeader>
      {isLoading && <ListSkeleton />}
      {isEmpty && (
        <section className="panel">
          <EmptyState
            action={
              canCreate && (
                <button className="btn btn-primary" onClick={openNew} type="button">
                  Crear el primer período
                </button>
              )
            }
            icon={CalendarRange}
            text="Costos, materias, inscripciones, asistencia y notas se organizan por período académico."
            title="Sin períodos académicos"
          />
        </section>
      )}
      <PeriodList
        onDelete={askDelete}
        onEdit={openEdit}
        onSelect={selectPeriod}
        periods={periods}
        rowPermissions={rowPermissions}
        selectedPeriodId={selectedPeriod?.id ?? null}
      />
      {editor.mode !== 'closed' && (
        <PeriodForm
          key={editingRecord?.id ?? 'new'}
          onClose={closeEditor}
          onSaved={handleSaved}
          period={editingRecord}
          periods={periods}
        />
      )}
      {recordToDelete && (
        <ConfirmDialog
          confirmLabel="Eliminar período"
          description={`Se eliminará "${recordToDelete.name}". Si ya tiene inscripciones, materias, costos o notas no se podrá eliminar.`}
          item={recordToDelete}
          onCancel={cancelDelete}
          onConfirm={deleteAcademicPeriod}
          title="Eliminar período académico"
        />
      )}
    </div>
  );
};

export default AcademicPeriodsView;
