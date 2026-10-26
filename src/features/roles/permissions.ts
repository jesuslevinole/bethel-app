import type {
  ModulePermission,
  PermissionAction,
  PermissionModule,
  RolePermissions,
  ViewScope,
} from '../../types/index';
import { PERMISSION_MODULES } from './permissionModules';

export const NO_ACCESS: ModulePermission = {
  create: false,
  delete: false,
  edit: false,
  export: false,
  history: false,
  print: false,
  view: 'none',
  viewAs: false,
};
export const FULL_ACCESS: ModulePermission = {
  create: true,
  delete: true,
  edit: true,
  export: true,
  history: true,
  print: true,
  view: 'all',
  viewAs: true,
};

const buildPermissions = (getPermission: (module: PermissionModule) => ModulePermission) =>
  Object.fromEntries(PERMISSION_MODULES.map(({ key }) => [key, getPermission(key)])) as RolePermissions;

export const emptyPermissions = () => buildPermissions(() => NO_ACCESS);

export const fullPermissions = () => buildPermissions(() => FULL_ACCESS);

// Roles guardados antes de Exportar / Imprimir / Historial: si veían el módulo, conservan esos botones
// (antes salían para todos). "Ver como" nunca se da solo.
const withLegacyActions = (saved: Partial<ModulePermission>): Partial<ModulePermission> => {
  const sawModule = (saved.view ?? 'none') !== 'none';
  return {
    export: saved.export ?? sawModule,
    history: saved.history ?? sawModule,
    print: saved.print ?? sawModule,
  };
};

// Un rol guardado puede no traer un módulo o una acción nueva: se completa sin acceso (o como antes).
export const completePermissions = (permissions: Partial<Record<PermissionModule, Partial<ModulePermission>>> | undefined) =>
  buildPermissions((module) => {
    const saved = permissions?.[module] ?? {};
    return { ...NO_ACCESS, ...saved, ...withLegacyActions(saved) };
  });

// Ajusta un permiso para que sea coherente: sin "ver" no hay acciones, y solo los alcances que el módulo admite.
export const normalizePermission = (permission: ModulePermission, allowedScopes: ViewScope[]): ModulePermission => {
  const view = allowedScopes.includes(permission.view) ? permission.view : 'none';
  if (view === 'none') return NO_ACCESS;
  return { ...permission, view };
};

export const hasAction = (permission: ModulePermission, action: PermissionAction) =>
  permission.view !== 'none' && permission[action];

const SCOPE_RANK: Record<ViewScope, number> = { all: 2, none: 0, own: 1 };

// Permisos de "ver como" para alguien que NO es propietario: nunca más de lo que esa persona puede.
// Un módulo que ella ve solo como "propios" queda sin acceso (sus reglas no la dejarían leer lo del otro).
export const intersectPermissions = (target: RolePermissions, real: RolePermissions) =>
  buildPermissions((module) => {
    const realView = real[module].view;
    if (realView !== 'all') return NO_ACCESS;
    const view = SCOPE_RANK[target[module].view] <= SCOPE_RANK[realView] ? target[module].view : realView;
    const actions = Object.fromEntries(
      (Object.keys(NO_ACCESS) as (keyof ModulePermission)[])
        .filter((key) => key !== 'view')
        .map((key) => [key, Boolean(target[module][key]) && Boolean(real[module][key])]),
    );
    return { ...NO_ACCESS, ...actions, view };
  });
