import { ReceiptText } from 'lucide-react';
import EmptyState from '../../../shared/components/EmptyState';
import ListSkeleton from '../../../shared/components/ListSkeleton';
import { PHONE_QUERY, useMediaQuery } from '../../../shared/hooks/useMediaQuery';
import type { CourseCost, RowPermissions } from '../../../types/index';
import CourseCostCards from './CourseCostCards';
import CourseCostTable from './CourseCostTable';

interface CourseCostListProps {
  rowPermissions: RowPermissions;
  classNames: Map<string, string>;
  costs: CourseCost[];
  isLoading: boolean;
  onDelete: (cost: CourseCost) => void;
  onEdit: (cost: CourseCost) => void;
}

const CourseCostList = ({ classNames, costs, isLoading, onDelete, onEdit, rowPermissions }: CourseCostListProps) => {
  const isPhone = useMediaQuery(PHONE_QUERY);

  if (isLoading) return <ListSkeleton />;
  if (costs.length === 0) {
    return (
      <EmptyState
        icon={ReceiptText}
        text="Define cuánto cuesta cada clase: inscripción, libros, curso y graduación."
        title="Sin costos registrados"
      />
    );
  }
  if (isPhone) return <CourseCostCards classNames={classNames} costs={costs} onDelete={onDelete} onEdit={onEdit} rowPermissions={rowPermissions} />;
  return <CourseCostTable classNames={classNames} costs={costs} onDelete={onDelete} onEdit={onEdit} rowPermissions={rowPermissions} />;
};

export default CourseCostList;
