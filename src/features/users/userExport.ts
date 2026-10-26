import type { ExportColumn } from '../../shared/export/exportToExcel';
import type { UserRow } from '../../types/index';

export const USER_EXPORT_COLUMNS: ExportColumn<UserRow>[] = [
  { header: 'Nombre', value: (row) => row.user.name, width: 28 },
  { header: 'Correo', value: (row) => row.user.email, width: 32 },
  { header: 'Rol', value: (row) => row.roleName },
  { header: 'Ligado a', value: (row) => row.linkLabel, width: 28 },
  { header: 'Estado', value: (row) => (row.user.active ? 'Activo' : 'Inactivo'), width: 12 },
];
