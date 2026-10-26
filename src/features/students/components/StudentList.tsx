import { Users } from 'lucide-react';
import EmptyState from '../../../shared/components/EmptyState';
import ListSkeleton from '../../../shared/components/ListSkeleton';
import { PHONE_QUERY, useMediaQuery } from '../../../shared/hooks/useMediaQuery';
import type { RowPermissions, Student } from '../../../types/index';
import StudentCards from './StudentCards';
import StudentTable from './StudentTable';

interface StudentListProps {
  rowPermissions: RowPermissions;
  hasSearch: boolean;
  isLoading: boolean;
  onDelete: (student: Student) => void;
  onEdit: (student: Student) => void;
  students: Student[];
}

const StudentList = ({ hasSearch, isLoading, onDelete, onEdit, rowPermissions, students }: StudentListProps) => {
  const isPhone = useMediaQuery(PHONE_QUERY);

  if (isLoading) return <ListSkeleton />;
  if (students.length === 0) {
    const emptyText = hasSearch
      ? 'Ningún alumno coincide con la búsqueda.'
      : 'Registra al primer alumno para poder inscribirlo en una clase.';
    return <EmptyState icon={Users} text={emptyText} title="Sin alumnos" />;
  }
  if (isPhone) return <StudentCards onDelete={onDelete} onEdit={onEdit} rowPermissions={rowPermissions} students={students} />;
  return <StudentTable onDelete={onDelete} onEdit={onEdit} rowPermissions={rowPermissions} students={students} />;
};

export default StudentList;
