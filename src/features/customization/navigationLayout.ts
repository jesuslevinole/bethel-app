import type { NavigationGroup, NavigationItem } from '../../components/layout/navigation';
import type { AppSettings, NavGroup } from '../../types/index';

export interface NavigationLink {
  item: NavigationItem;
  label: string;
}

// Lo que dibuja el menú lateral, en orden: un ítem, una lista desplegable con sus ítems o una línea.
export type NavigationEntry =
  | { kind: 'group'; group: NavGroup; links: NavigationLink[] }
  | { kind: 'link'; link: NavigationLink }
  | { id: string; kind: 'separator' };

export const getNavigationLabel = (item: NavigationItem, settings: AppSettings | null) =>
  settings?.navLabels?.[item.path]?.trim() || item.label;

export const hasCustomNavigation = (settings: AppSettings | null) =>
  Boolean(settings?.navOrder?.length || settings?.navGroups?.length);

// Posición de cada ruta o lista en el orden guardado; lo que no está va al final, en su orden original.
const buildRank = (order: string[], fallbackKeys: string[]) => {
  const rank = new Map(order.map((key, index) => [key, index]));
  fallbackKeys.forEach((key, index) => {
    if (!rank.has(key)) rank.set(key, order.length + index);
  });
  return (key: string) => rank.get(key) ?? Number.MAX_SAFE_INTEGER;
};

// Menú visible del usuario con lo personalizado. Sin personalizar: los grupos originales separados por una línea.
// Personalizado: el orden guardado, y los ítems de una lista desplegable dentro de ella (una lista sin ítems
// visibles para este rol no se dibuja).
export const buildNavigationLayout = (
  visibleGroups: NavigationGroup[],
  settings: AppSettings | null,
): NavigationEntry[] => {
  const toLink = (item: NavigationItem): NavigationLink => ({ item, label: getNavigationLabel(item, settings) });

  if (!hasCustomNavigation(settings)) {
    return visibleGroups.flatMap((group, groupIndex) => [
      ...(groupIndex > 0 ? [{ id: `separator-${group.title}`, kind: 'separator' as const }] : []),
      ...group.items.map((item) => ({ kind: 'link' as const, link: toLink(item) })),
    ]);
  }

  const groups = settings?.navGroups ?? [];
  const groupIds = new Set(groups.map((group) => group.id));
  const parents = settings?.navParents ?? {};
  const items = visibleGroups.flatMap((group) => group.items);
  const rankOf = buildRank(settings?.navOrder ?? [], [
    ...items.map((item) => item.path),
    ...groups.map((group) => group.id),
  ]);
  const parentOf = (item: NavigationItem) => (groupIds.has(parents[item.path]) ? parents[item.path] : null);
  const byRank = (firstKey: string, secondKey: string) => rankOf(firstKey) - rankOf(secondKey);

  const groupEntries = groups
    .map((group) => ({
      group,
      links: items
        .filter((item) => parentOf(item) === group.id)
        .sort((first, second) => byRank(first.path, second.path))
        .map(toLink),
    }))
    .filter((entry) => entry.links.length > 0)
    .map((entry) => ({ key: entry.group.id, value: { kind: 'group' as const, ...entry } }));
  const linkEntries = items
    .filter((item) => !parentOf(item))
    .map((item) => ({ key: item.path, value: { kind: 'link' as const, link: toLink(item) } }));

  return [...groupEntries, ...linkEntries]
    .sort((first, second) => byRank(first.key, second.key))
    .map((entry) => entry.value);
};
