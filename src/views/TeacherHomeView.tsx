import { useAcademicPeriod } from '../features/academic-periods/academicPeriodContext';
import AttendanceWorkspace from '../features/attendance/components/AttendanceWorkspace';
import { useAdminSession } from '../features/auth/adminSessionContext';
import ListSkeleton from '../shared/components/ListSkeleton';
import NoPeriodState from '../shared/components/NoPeriodState';
import ViewHeader from '../shared/components/ViewHeader';
import { useLivePeriodCollection } from '../shared/data/liveCollections';

// Portal del maestro: solo sus grupos del período elegido.
const TeacherHomeView = () => {
  const { teacherProfile } = useAdminSession();
  const { isLoading: isLoadingPeriods, selectedPeriod } = useAcademicPeriod();
  const { data: assignments, isLoading } = useLivePeriodCollection('teacherAssignments', selectedPeriod?.id ?? null);
  const ownAssignments = assignments.filter((assignment) => assignment.teacherId === teacherProfile?.teacherId);
  const showNoPeriod = !isLoadingPeriods && !selectedPeriod;
  const greeting = teacherProfile ? `Hola, ${teacherProfile.name}` : 'Asistencia y notas';

  return (
    <div className="view">
      <ViewHeader subtitle={selectedPeriod?.name ?? 'Sin período académico'} title={greeting} />
      {showNoPeriod && <NoPeriodState />}
      {selectedPeriod && isLoading && <ListSkeleton />}
      {selectedPeriod && !isLoading && (
        <AttendanceWorkspace
          assignments={ownAssignments}
          emptyText="Todavía no tienes materias asignadas en este período. Pide a Administración que te las asigne."
          showTeacherPicker={false}
        />
      )}
    </div>
  );
};

export default TeacherHomeView;
