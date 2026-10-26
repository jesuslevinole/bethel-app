import {
  Banknote,
  BookMarked,
  CalendarRange,
  ClipboardCheck,
  ClipboardList,
  IdCard,
  LayoutDashboard,
  Library,
  ReceiptText,
  ShieldCheck,
  UserCog,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { PATHS } from '../../routes/paths';
import type { PermissionModule, ViewScope } from '../../types/index';

export interface NavigationItem {
  icon: LucideIcon;
  label: string;
  // Se muestra si el rol ve CUALQUIERA de estos módulos (con el alcance exacto, si se indica).
  modules: PermissionModule[];
  path: string;
  scope?: ViewScope;
}

// title solo identifica el grupo (no se muestra: el menú separa los grupos con una línea).
export interface NavigationGroup {
  items: NavigationItem[];
  title: string;
}

// Menú completo. Cada rol ve solo lo que sus permisos permiten (useVisibleNavigation).
export const NAVIGATION: NavigationGroup[] = [
  {
    items: [
      { icon: LayoutDashboard, label: 'Resumen', modules: ['dashboard'], path: PATHS.dashboard },
      { icon: IdCard, label: 'Mi ficha', modules: ['students'], path: PATHS.myProfile, scope: 'own' },
      { icon: Users, label: 'Alumnos', modules: ['students'], path: PATHS.students, scope: 'all' },
      { icon: ClipboardList, label: 'Inscripciones', modules: ['enrollments'], path: PATHS.enrollments },
      { icon: BookMarked, label: 'Materias por maestro', modules: ['teacherAssignments'], path: PATHS.teacherAssignments },
      { icon: ClipboardCheck, label: 'Asistencia y notas', modules: ['attendance', 'grades'], path: PATHS.attendance },
    ],
    title: 'Académico',
  },
  {
    items: [
      { icon: Banknote, label: 'Pagos', modules: ['payments'], path: PATHS.payments, scope: 'all' },
      { icon: Banknote, label: 'Mis pagos', modules: ['payments'], path: PATHS.myPayments, scope: 'own' },
    ],
    title: 'Finanzas',
  },
  {
    items: [
      { icon: CalendarRange, label: 'Períodos académicos', modules: ['academicPeriods'], path: PATHS.academicPeriods },
      { icon: ReceiptText, label: 'Costos del curso', modules: ['courseCosts'], path: PATHS.courseCosts },
      { icon: Library, label: 'Catálogos', modules: ['catalogs'], path: PATHS.catalogs },
    ],
    title: 'Configuración',
  },
  {
    items: [
      { icon: UserCog, label: 'Usuarios', modules: ['users'], path: PATHS.users },
      { icon: ShieldCheck, label: 'Roles', modules: ['roles'], path: PATHS.roles },
    ],
    title: 'Seguridad',
  },
];
