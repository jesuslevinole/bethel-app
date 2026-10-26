import { BookOpen, ClipboardList, GraduationCap, UserRound } from 'lucide-react';
import { useMemo } from 'react';
import { useAcademicPeriod } from '../features/academic-periods/academicPeriodContext';
import { usePermissions } from '../features/auth/hooks/usePermissions';
import GettingStarted from '../features/dashboard/components/GettingStarted';
import LoadPanel from '../features/dashboard/components/LoadPanel';
import RecentEnrollments from '../features/dashboard/components/RecentEnrollments';
import { buildDashboardData } from '../features/dashboard/dashboardData';
import { toEnrollmentRows } from '../features/enrollments/enrollmentRows';
import { useEnrollmentLookups } from '../features/enrollments/hooks/useEnrollmentLookups';
import StatCard from '../shared/components/StatCard';
import ViewHeader from '../shared/components/ViewHeader';
import { useLiveCollection, useLiveData } from '../shared/data/liveCollections';
import { useScopedPeriodData } from '../shared/data/useScopedData';
import { formatDate, todayIso } from '../utils/dateFormat';
import { pluralize } from '../utils/plural';
import '../features/dashboard/components/Dashboard.css';

const DashboardView = () => {
  const { isLoading: isLoadingPeriods, periods, selectedPeriod } = useAcademicPeriod();
  const periodId = selectedPeriod?.id ?? null;
  const permissions = usePermissions();
  const { classNames, classes, students, studentsById } = useEnrollmentLookups();
  const periodEnrollments = useScopedPeriodData('enrollments', periodId);
  const periodAssignments = useScopedPeriodData('teacherAssignments', periodId);
  const teachers = useLiveData('teachers');
  const { data: subjects, isLoading: isLoadingSubjects } = useLiveCollection('subjects');

  const dashboard = useMemo(
    () => buildDashboardData({ classes, periodAssignments, periodEnrollments, subjects, teachers }),
    [classes, periodAssignments, periodEnrollments, subjects, teachers],
  );
  const recentRows = toEnrollmentRows(dashboard.recentEnrollments, studentsById, classNames);
  const needsCatalogs = !isLoadingSubjects && (subjects.length === 0 || classes.length === 0);
  const needsPeriod = !isLoadingPeriods && periods.length === 0;
  const canSetUp = permissions.can('catalogs', 'create') && permissions.can('academicPeriods', 'create');
  const subtitle = selectedPeriod ? `${selectedPeriod.name}. Hoy, ${formatDate(todayIso())}` : `Hoy, ${formatDate(todayIso())}`;

  return (
    <div className="view">
      <ViewHeader subtitle={subtitle} title="Resumen" />
      {canSetUp && (needsCatalogs || needsPeriod) && <GettingStarted needsCatalogs={needsCatalogs} />}
      <div className="dashboard-stats">
        <StatCard
          detail={`de ${pluralize(students.length, 'alumno registrado', 'alumnos registrados')}`}
          icon={GraduationCap}
          label="Inscritos en el período"
          value={String(periodEnrollments.length)}
        />
        <StatCard
          detail="con al menos un alumno"
          icon={ClipboardList}
          label="Clases activas"
          value={String(dashboard.studentsByClass.filter((bar) => bar.value > 0).length)}
        />
        <StatCard
          detail={`de ${teachers.length} en el catálogo`}
          icon={UserRound}
          label="Maestros con materias"
          value={String(dashboard.activeTeacherCount)}
        />
        <StatCard
          detail={`de ${subjects.length} materias del catálogo`}
          icon={BookOpen}
          label="Materias sin maestro"
          value={String(dashboard.subjectsWithoutTeacher)}
        />
      </div>
      <div className="dashboard-grid">
        <RecentEnrollments rows={recentRows} />
        <div className="dashboard-side">
          <LoadPanel
            bars={dashboard.studentsByClass}
            emptyText="Sin alumnos inscritos en este período."
            title="Alumnos por clase"
            unitLabel={(value) => pluralize(value, 'alumno', 'alumnos')}
          />
          <LoadPanel
            bars={dashboard.subjectsByTeacher}
            emptyText="Ningún maestro tiene materias en este período."
            title="Materias por maestro"
            unitLabel={(value) => pluralize(value, 'materia', 'materias')}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
