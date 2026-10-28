import {
  Banknote,
  BookMarked,
  BookOpenCheck,
  CalendarRange,
  ClipboardCheck,
  ClipboardList,
  FileSignature,
  Home,
  IdCard,
  Inbox,
  LayoutDashboard,
  Library,
  Palette,
  ReceiptText,
  Scale,
  ShieldCheck,
  UserCog,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { PATHS } from '../../routes/paths';
import type { PermissionModule, RoleKind, ViewScope } from '../../types/index';

export interface NavigationItem {
  // Texto corto de qué se hace ahí (tarjetas de Inicio).
  description: string;
  icon: LucideIcon;
  label: string;
  // Se muestra si el rol ve CUALQUIERA de estos módulos (con el alcance exacto, si se indica).
  // Vacío = lo ve cualquiera (o, con roleKinds, cualquiera de ese tipo de rol).
  modules: PermissionModule[];
  path: string;
  roleKinds?: RoleKind[];
  scope?: ViewScope;
}

// title solo identifica el grupo (no se muestra: el menú separa los grupos con una línea).
// En Personalizar se puede cambiar el nombre y el orden de cada ítem y armar listas desplegables.
export interface NavigationGroup {
  items: NavigationItem[];
  title: string;
}

// Menú completo. Cada rol ve solo lo que sus permisos permiten (useVisibleNavigation).
export const NAVIGATION: NavigationGroup[] = [
  {
    items: [
      { description: 'Lo de hoy y accesos rápidos.', icon: Home, label: 'Inicio', modules: [], path: PATHS.home },
      {
        description: 'Números del período.',
        icon: LayoutDashboard,
        label: 'Resumen',
        modules: ['dashboard'],
        path: PATHS.dashboard,
      },
    ],
    title: 'Inicio',
  },
  {
    items: [
      {
        description: 'Llena tu solicitud de admisión y pide tu inscripción.',
        icon: FileSignature,
        label: 'Mi solicitud',
        modules: [],
        path: PATHS.myApplication,
        roleKinds: ['student'],
      },
      {
        description: 'Tu ficha, tus notas y tu carnet.',
        icon: IdCard,
        label: 'Mi ficha',
        modules: ['students'],
        path: PATHS.myProfile,
        scope: 'own',
      },
      {
        description: 'Revisa y aprueba admisiones e inscripciones.',
        icon: Inbox,
        label: 'Solicitudes',
        modules: ['admissions'],
        path: PATHS.admissions,
      },
      {
        description: 'Registro de alumnos y su ficha.',
        icon: Users,
        label: 'Alumnos',
        modules: ['students'],
        path: PATHS.students,
        scope: 'all',
      },
      {
        description: 'Alumnos inscritos en cada clase.',
        icon: ClipboardList,
        label: 'Inscripciones',
        modules: ['enrollments'],
        path: PATHS.enrollments,
      },
      {
        description: 'Qué materias da cada maestro.',
        icon: BookMarked,
        label: 'Materias por maestro',
        modules: ['teacherAssignments'],
        path: PATHS.teacherAssignments,
      },
      {
        description: 'Pasa lista y pon la nota del día.',
        icon: ClipboardCheck,
        label: 'Asistencia y notas',
        modules: ['attendance', 'grades'],
        path: PATHS.attendance,
      },
    ],
    title: 'Académico',
  },
  {
    items: [
      {
        description: 'Registra pagos e imprime el invoice.',
        icon: Banknote,
        label: 'Pagos',
        modules: ['payments'],
        path: PATHS.payments,
        scope: 'all',
      },
      {
        description: 'Tus pagos y lo que te falta.',
        icon: Banknote,
        label: 'Mis pagos',
        modules: ['payments'],
        path: PATHS.myPayments,
        scope: 'own',
      },
      {
        description: 'Entradas, salidas y existencias de libros.',
        icon: BookOpenCheck,
        label: 'Inventario de libros',
        modules: ['bookInventory'],
        path: PATHS.bookInventory,
      },
      {
        description: 'Gastos del instituto.',
        icon: Wallet,
        label: 'Gastos',
        modules: ['expenses'],
        path: PATHS.expenses,
      },
      {
        description: 'Entradas y salidas entre dos fechas.',
        icon: Scale,
        label: 'Estado de cuenta',
        modules: ['accountStatement'],
        path: PATHS.accountStatement,
      },
    ],
    title: 'Finanzas',
  },
  {
    items: [
      {
        description: 'Períodos y sus dos semestres.',
        icon: CalendarRange,
        label: 'Períodos académicos',
        modules: ['academicPeriods'],
        path: PATHS.academicPeriods,
      },
      {
        description: 'Inscripción, libros y mensualidades.',
        icon: ReceiptText,
        label: 'Costos del curso',
        modules: ['courseCosts'],
        path: PATHS.courseCosts,
      },
      {
        description: 'Clases, materias, maestros y más.',
        icon: Library,
        label: 'Catálogos',
        modules: ['catalogs'],
        path: PATHS.catalogs,
      },
      {
        description: 'Nombres y orden del menú y de las columnas.',
        icon: Palette,
        label: 'Personalizar',
        modules: ['customization'],
        path: PATHS.customization,
      },
    ],
    title: 'Configuración',
  },
  {
    items: [
      { description: 'Cuentas de acceso.', icon: UserCog, label: 'Usuarios', modules: ['users'], path: PATHS.users },
      {
        description: 'Qué puede ver y hacer cada rol.',
        icon: ShieldCheck,
        label: 'Roles',
        modules: ['roles'],
        path: PATHS.roles,
      },
    ],
    title: 'Seguridad',
  },
];

export const NAVIGATION_ITEMS: NavigationItem[] = NAVIGATION.flatMap((group) => group.items);
