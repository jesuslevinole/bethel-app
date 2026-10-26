import { BookMarked } from 'lucide-react';
import EmptyState from '../../../shared/components/EmptyState';
import ListSkeleton from '../../../shared/components/ListSkeleton';
import { PHONE_QUERY, useMediaQuery } from '../../../shared/hooks/useMediaQuery';
import type { AssignmentRow, RowPermissions, TeacherAssignment } from '../../../types/index';
import AssignmentCards from './AssignmentCards';
import AssignmentTable from './AssignmentTable';

interface AssignmentListProps {
  rowPermissions: RowPermissions;
  hasFilters: boolean;
  isLoading: boolean;
  onDelete: (assignment: TeacherAssignment) => void;
  onEdit: (assignment: TeacherAssignment) => void;
  rows: AssignmentRow[];
}

const AssignmentList = ({ hasFilters, isLoading, onDelete, onEdit, rowPermissions, rows }: AssignmentListProps) => {
  const isPhone = useMediaQuery(PHONE_QUERY);

  if (isLoading) return <ListSkeleton />;
  if (rows.length === 0) {
    const emptyText = hasFilters
      ? 'Ningún registro coincide con el filtro.'
      : 'Asigna a cada maestro las materias que dará en el período.';
    return <EmptyState icon={BookMarked} text={emptyText} title="Sin materias asignadas" />;
  }
  if (isPhone) return <AssignmentCards onDelete={onDelete} onEdit={onEdit} rowPermissions={rowPermissions} rows={rows} />;
  return <AssignmentTable onDelete={onDelete} onEdit={onEdit} rowPermissions={rowPermissions} rows={rows} />;
};

export default AssignmentList;
