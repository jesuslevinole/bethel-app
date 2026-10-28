import { useCallback } from 'react';
import { useAppSettings } from './appSettingsContext';
import { TABLE_COLUMNS, type ColumnKey, type TableId } from './tableColumns';

// Encabezado de cada columna de una tabla: el nombre puesto en Personalizar o el original.
export const useColumnLabels = <Table extends TableId>(tableId: Table) => {
  const { settings } = useAppSettings();
  const customLabels = settings?.columnLabels?.[tableId];
  return useCallback(
    (columnKey: ColumnKey<Table>) => {
      const defaults: Record<string, string> = TABLE_COLUMNS[tableId].columns;
      return customLabels?.[columnKey]?.trim() || defaults[columnKey];
    },
    [customLabels, tableId],
  );
};
