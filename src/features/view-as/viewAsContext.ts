import { createContext, useContext } from 'react';

// A quién está "imitando" el propietario: un rol en general o un usuario concreto (con su maestro o alumno).
export type ViewAsTarget = { kind: 'role'; roleId: string } | { kind: 'user'; userId: string };

export interface ViewAsControls {
  // El propietario, o un rol con "Ver como" en Usuarios (limitado a lo que ese rol puede ver).
  canViewAs: boolean;
  // "Aminta Figueroa · Maestro" mientras ve como alguien; null en su propia vista.
  label: string | null;
  startViewAs: (target: ViewAsTarget) => void;
  stopViewAs: () => void;
  target: ViewAsTarget | null;
}

export const ViewAsContext = createContext<ViewAsControls>({
  canViewAs: false,
  label: null,
  startViewAs: () => undefined,
  stopViewAs: () => undefined,
  target: null,
});

export const useViewAs = () => useContext(ViewAsContext);
