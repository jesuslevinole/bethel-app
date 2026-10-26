import { useMemo } from 'react';
import { usePermissions } from '../../features/auth/hooks/usePermissions';
import { NAVIGATION, type NavigationItem } from './navigation';

// El menú del usuario actual: solo los grupos e ítems que su rol puede ver.
export const useVisibleNavigation = () => {
  const permissions = usePermissions();

  return useMemo(() => {
    const isVisible = (item: NavigationItem) =>
      item.modules.some((module) =>
        item.scope ? permissions.scope(module) === item.scope : permissions.canView(module),
      );
    return NAVIGATION.map((group) => ({ ...group, items: group.items.filter(isVisible) })).filter(
      (group) => group.items.length > 0,
    );
  }, [permissions]);
};
