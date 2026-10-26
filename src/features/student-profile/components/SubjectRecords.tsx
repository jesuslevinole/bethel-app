import { BookOpen } from 'lucide-react';
import EmptyState from '../../../shared/components/EmptyState';
import ListSkeleton from '../../../shared/components/ListSkeleton';
import { PHONE_QUERY, useMediaQuery } from '../../../shared/hooks/useMediaQuery';
import type { StudentSubjectRecord } from '../../../types/index';
import SubjectRecordCards from './SubjectRecordCards';
import SubjectRecordTable from './SubjectRecordTable';

interface SubjectRecordsProps {
  error: string | null;
  isLoading: boolean;
  records: StudentSubjectRecord[];
}

const SubjectRecordsContent = ({ error, isLoading, records }: SubjectRecordsProps) => {
  const isPhone = useMediaQuery(PHONE_QUERY);

  if (isLoading) return <ListSkeleton rows={4} />;
  if (error) return <p className="form-alert">{error}</p>;
  if (records.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        text="Su clase todavía no tiene materias asignadas en este período."
        title="Sin materias"
      />
    );
  }
  if (isPhone) return <SubjectRecordCards records={records} />;
  return <SubjectRecordTable records={records} />;
};

const SubjectRecords = (props: SubjectRecordsProps) => (
  <section className="panel">
    <header className="panel-header">
      <h2 className="panel-title">Materias y notas</h2>
    </header>
    <div className="panel-body-flush">
      <SubjectRecordsContent {...props} />
    </div>
  </section>
);

export default SubjectRecords;
