import { ClipboardList } from 'lucide-react';
import EmptyState from '../../../shared/components/EmptyState';
import ListSkeleton from '../../../shared/components/ListSkeleton';
import { PHONE_QUERY, useMediaQuery } from '../../../shared/hooks/useMediaQuery';
import type { Enrollment, EnrollmentRow, RowPermissions } from '../../../types/index';
import EnrollmentCards from './EnrollmentCards';
import EnrollmentTable from './EnrollmentTable';

interface EnrollmentListProps {
  rowPermissions: RowPermissions;
  hasFilters: boolean;
  isLoading: boolean;
  onDelete: (enrollment: Enrollment) => void;
  onEdit: (enrollment: Enrollment) => void;
  rows: EnrollmentRow[];
}

const EnrollmentList = ({ hasFilters, isLoading, onDelete, onEdit, rowPermissions, rows }: EnrollmentListProps) => {
  const isPhone = useMediaQuery(PHONE_QUERY);

  if (isLoading) return <ListSkeleton />;
  if (rows.length === 0) {
    const emptyText = hasFilters
      ? 'Ninguna inscripción coincide con el filtro.'
      : 'Inscribe a un alumno en una clase para empezar el período.';
    return <EmptyState icon={ClipboardList} text={emptyText} title="Sin inscripciones" />;
  }
  if (isPhone) return <EnrollmentCards onDelete={onDelete} onEdit={onEdit} rowPermissions={rowPermissions} rows={rows} />;
  return <EnrollmentTable onDelete={onDelete} onEdit={onEdit} rowPermissions={rowPermissions} rows={rows} />;
};

export default EnrollmentList;
