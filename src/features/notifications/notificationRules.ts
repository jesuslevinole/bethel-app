import { buildCatalogPath, PATHS } from '../../routes/paths';
import type {
  AcademicPeriod,
  AppNotification,
  CourseCost,
  Enrollment,
  Role,
  SchoolClass,
  Subject,
  Teacher,
  TeacherAssignment,
} from '../../types/index';
import { formatDate, todayIso } from '../../utils/dateFormat';
import { getPeriodStatus } from '../../utils/periodStatus';
import { pluralize } from '../../utils/plural';
import type { Permissions } from '../auth/hooks/usePermissions';

// Días antes del fin del período en que se avisa.
const PERIOD_ENDING_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

export interface NotificationSources {
  assignments: TeacherAssignment[];
  classes: SchoolClass[];
  courseCosts: CourseCost[];
  enrollments: Enrollment[];
  periods: AcademicPeriod[];
  permissions: Permissions;
  roles: Role[];
  selectedPeriod: AcademicPeriod | null;
  subjects: Subject[];
  teachers: Teacher[];
  today?: string;
}

const daysBetween = (fromIso: string, toIso: string) =>
  Math.round((new Date(`${toIso}T00:00:00`).getTime() - new Date(`${fromIso}T00:00:00`).getTime()) / DAY_MS);

const getPeriodNotifications = ({ periods, permissions, selectedPeriod, today = todayIso() }: NotificationSources) => {
  const notifications: AppNotification[] = [];
  const managesPeriods = permissions.can('academicPeriods', 'create');
  if (managesPeriods && periods.length === 0) {
    notifications.push({
      detail: 'Todos los módulos trabajan sobre un período: créalo antes de inscribir o asignar materias.',
      id: 'no-periods',
      path: PATHS.academicPeriods,
      title: 'Crea el primer período académico',
      tone: 'warning',
    });
  }
  const hasActivePeriod = periods.some((period) => getPeriodStatus(period.startDate, period.endDate, today) === 'active');
  if (managesPeriods && periods.length > 0 && !hasActivePeriod) {
    notifications.push({
      detail: 'Ningún período cubre la fecha de hoy. Crea el siguiente para seguir trabajando.',
      id: 'no-active-period',
      path: PATHS.academicPeriods,
      title: 'No hay un período vigente',
      tone: 'warning',
    });
  }
  if (selectedPeriod && getPeriodStatus(selectedPeriod.startDate, selectedPeriod.endDate, today) === 'active') {
    const daysLeft = daysBetween(today, selectedPeriod.endDate);
    if (daysLeft <= PERIOD_ENDING_DAYS) {
      notifications.push({
        detail: `Termina el ${formatDate(selectedPeriod.endDate)} (${daysLeft === 0 ? 'hoy' : `en ${pluralize(daysLeft, 'día', 'días')}`}).`,
        id: `period-ending-${selectedPeriod.id}`,
        path: permissions.canView('academicPeriods') ? PATHS.academicPeriods : undefined,
        title: `El período ${selectedPeriod.name} está por terminar`,
        tone: 'info',
      });
    }
  }
  return notifications;
};

const getCatalogNotifications = ({ classes, permissions, subjects, teachers }: NotificationSources) => {
  if (permissions.scope('catalogs') !== 'all') return [];
  const notifications: AppNotification[] = [];
  const emptyCatalogs = [
    classes.length === 0 ? 'clases' : '',
    subjects.length === 0 ? 'materias' : '',
    teachers.length === 0 ? 'maestros' : '',
  ].filter(Boolean);
  if (emptyCatalogs.length > 0) {
    notifications.push({
      detail: `Sin ${emptyCatalogs.join(', ')}. Puedes cargarlos desde la hoja de configuración.`,
      id: 'catalogs-empty',
      path: PATHS.catalogs,
      title: 'Faltan datos en Catálogos',
      tone: 'warning',
    });
  }
  const subjectsWithoutClass = subjects.filter((subject) => !subject.classId).length;
  if (subjectsWithoutClass > 0) {
    notifications.push({
      detail: 'Sin clase aparecen en todas las clases al asignar materias a un maestro.',
      id: 'subjects-without-class',
      path: buildCatalogPath('subjects'),
      title: `${pluralize(subjectsWithoutClass, 'materia', 'materias')} sin clase`,
      tone: 'warning',
    });
  }
  return notifications;
};

const getPeriodSetupNotifications = (sources: NotificationSources) => {
  const { assignments, classes, courseCosts, enrollments, permissions, selectedPeriod } = sources;
  if (!selectedPeriod) return [];
  const notifications: AppNotification[] = [];

  if (permissions.scope('courseCosts') === 'all' && classes.length > 0) {
    const costClassIds = new Set(courseCosts.map((cost) => cost.classId));
    const classesWithoutCost = classes.filter((schoolClass) => !costClassIds.has(schoolClass.id));
    if (classesWithoutCost.length > 0) {
      notifications.push({
        detail: classesWithoutCost.map((schoolClass) => schoolClass.name).join(', '),
        id: `classes-without-cost-${selectedPeriod.id}`,
        path: PATHS.courseCosts,
        title: `${pluralize(classesWithoutCost.length, 'clase', 'clases')} sin costos en ${selectedPeriod.name}`,
        tone: 'warning',
      });
    }
  }

  if (permissions.scope('teacherAssignments') === 'all' && permissions.scope('enrollments') === 'all') {
    const assignedClassIds = new Set(assignments.map((assignment) => assignment.classId));
    const classesWithoutTeacher = classes
      .filter((schoolClass) => !assignedClassIds.has(schoolClass.id))
      .map((schoolClass) => ({
        name: schoolClass.name,
        studentCount: enrollments.filter((enrollment) => enrollment.classId === schoolClass.id).length,
      }))
      .filter((entry) => entry.studentCount > 0);
    if (classesWithoutTeacher.length > 0) {
      notifications.push({
        detail: classesWithoutTeacher
          .map((entry) => `${entry.name} (${pluralize(entry.studentCount, 'alumno', 'alumnos')})`)
          .join(', '),
        id: `classes-without-teacher-${selectedPeriod.id}`,
        path: PATHS.teacherAssignments,
        title: 'Clases con alumnos y sin materias asignadas',
        tone: 'warning',
      });
    }
  }
  return notifications;
};

// Maestro: sus grupos del período que aún no tienen alumnos.
const getTeacherNotifications = ({ assignments, classes, permissions, selectedPeriod }: NotificationSources) => {
  if (permissions.scope('teacherAssignments') !== 'own' || !selectedPeriod) return [];
  const classNames = new Map(classes.map((schoolClass) => [schoolClass.id, schoolClass.name]));
  return assignments
    .filter((assignment) => (assignment.roster ?? []).length === 0)
    .map<AppNotification>((assignment) => ({
      detail: 'Cuando Administración inscriba alumnos en tu clase aparecerán en tu hoja de asistencia.',
      id: `empty-roster-${assignment.id}`,
      path: permissions.canView('attendance') ? PATHS.attendance : undefined,
      title: `Tu grupo de ${classNames.get(assignment.classId) ?? 'tu clase'} aún no tiene alumnos`,
      tone: 'info',
    }));
};

const getRoleNotifications = ({ permissions, roles }: NotificationSources) => {
  if (!permissions.can('roles', 'create') || roles.length > 0) return [];
  return [
    {
      detail: 'Sin roles no se pueden crear usuarios para maestros, alumnos ni administración.',
      id: 'no-roles',
      path: PATHS.roles,
      title: 'Crea los roles',
      tone: 'warning' as const,
    },
  ];
};

// Avisos para el usuario actual según lo que su rol puede ver. Primero lo que requiere acción.
export const buildNotifications = (sources: NotificationSources): AppNotification[] =>
  [
    ...getRoleNotifications(sources),
    ...getPeriodNotifications(sources),
    ...getCatalogNotifications(sources),
    ...getPeriodSetupNotifications(sources),
    ...getTeacherNotifications(sources),
  ].sort((first, second) => (first.tone === second.tone ? 0 : first.tone === 'warning' ? -1 : 1));
