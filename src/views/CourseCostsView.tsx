import { Plus } from 'lucide-react';
import { useMemo } from 'react';
import { useAcademicPeriod } from '../features/academic-periods/academicPeriodContext';
import { usePermissions, useRowPermissions } from '../features/auth/hooks/usePermissions';
import CourseCostForm from '../features/course-costs/components/CourseCostForm';
import CourseCostList from '../features/course-costs/components/CourseCostList';
import { courseCostsService } from '../services/courseCostsService';
import ConfirmDialog from '../shared/components/ConfirmDialog';
import NoPeriodState from '../shared/components/NoPeriodState';
import ViewHeader from '../shared/components/ViewHeader';
import { useLiveData } from '../shared/data/liveCollections';
import { useScopedPeriodCollection } from '../shared/data/useScopedData';
import { useCrudScreen } from '../shared/hooks/useCrudScreen';
import { exportToExcel } from '../shared/export/exportToExcel';
import ExportButton from '../shared/components/ExportButton';
import { getCourseCostExportColumns } from '../features/course-costs/courseCostExport';
import type { CourseCost } from '../types/index';
import { buildNameMap, getRelationName } from '../utils/relations';

const CourseCostsView = () => {
  const { isLoading: isLoadingPeriods, selectedPeriod } = useAcademicPeriod();
  const { data: costs, isLoading } = useScopedPeriodCollection('courseCosts', selectedPeriod?.id ?? null);
  const classes = useLiveData('classes');
  const classNames = useMemo(() => buildNameMap(classes), [classes]);
  const permissions = usePermissions();
  const rowPermissions = useRowPermissions('courseCosts');
  const canCreate = permissions.can('courseCosts', 'create');
  const { askDelete, cancelDelete, closeEditor, editingRecord, editor, openEdit, openNew, recordToDelete } =
    useCrudScreen<CourseCost>();

  const subtitle = selectedPeriod
    ? `Inscripción, libros, curso, mensualidad y graduación por clase en ${selectedPeriod.name}.`
    : 'Sin período académico';
  const showNoPeriod = !isLoadingPeriods && !selectedPeriod;

  const handleDelete = (cost: CourseCost) => courseCostsService.delete(cost.id);

  return (
    <div className="view">
      <ViewHeader subtitle={subtitle} title="Costos del curso">
        {permissions.can('courseCosts', 'export') && selectedPeriod && (
          <ExportButton
            disabled={costs.length === 0}
            onExport={() =>
              exportToExcel(`Costos del curso ${selectedPeriod.name}`, getCourseCostExportColumns(classNames), costs)
            }
          />
        )}
        {canCreate && (
          <button className="btn btn-primary" disabled={!selectedPeriod} onClick={openNew} type="button">
            <Plus size={18} />
            Nuevos costos
          </button>
        )}
      </ViewHeader>
      {showNoPeriod && <NoPeriodState />}
      {selectedPeriod && (
        <section className="panel panel-body-flush">
          <CourseCostList
            classNames={classNames}
            costs={costs}
            isLoading={isLoading}
            onDelete={askDelete}
            onEdit={openEdit}
            rowPermissions={rowPermissions}
          />
        </section>
      )}
      {selectedPeriod && editor.mode !== 'closed' && (
        <CourseCostForm
          classNames={classNames}
          classes={classes}
          cost={editingRecord}
          key={editingRecord?.id ?? 'new'}
          onClose={closeEditor}
          period={selectedPeriod}
          periodCosts={costs}
        />
      )}
      {recordToDelete && (
        <ConfirmDialog
          confirmLabel="Eliminar costos"
          description={`Se eliminarán los costos de ${getRelationName(classNames, recordToDelete.classId)} en este período.`}
          item={recordToDelete}
          onCancel={cancelDelete}
          onConfirm={handleDelete}
          title="Eliminar costos del curso"
        />
      )}
    </div>
  );
};

export default CourseCostsView;
