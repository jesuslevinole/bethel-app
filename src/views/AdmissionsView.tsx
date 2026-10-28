import { ClipboardList, FileSignature, Inbox } from 'lucide-react';
import { useState } from 'react';
import { useAcademicPeriod } from '../features/academic-periods/academicPeriodContext';
import ApplicationReviewDialog from '../features/admissions/components/ApplicationReviewDialog';
import ApplicationTable from '../features/admissions/components/ApplicationTable';
import EnrollmentRequestTable from '../features/admissions/components/EnrollmentRequestTable';
import RejectRequestDialog from '../features/admissions/components/RejectRequestDialog';
import { approveEnrollmentRequest } from '../features/admissions/services/enrollmentRequestRecords';
import { usePermissions } from '../features/auth/hooks/usePermissions';
import EmptyState from '../shared/components/EmptyState';
import FilterChips from '../shared/components/FilterChips';
import ListSkeleton from '../shared/components/ListSkeleton';
import SearchInput from '../shared/components/SearchInput';
import SegmentedTabs from '../shared/components/SegmentedTabs';
import ViewHeader from '../shared/components/ViewHeader';
import { useLiveCollection, useLiveData } from '../shared/data/liveCollections';
import { useAsyncAction } from '../shared/hooks/useAsyncAction';
import type { AdmissionApplication, EnrollmentRequest } from '../types/index';
import { pluralize } from '../utils/plural';
import { buildNameMap } from '../utils/relations';
import { matchesSearch } from '../utils/search';
import '../features/admissions/components/Admissions.css';

type AdmissionsSection = 'applications' | 'enrollments';
type StatusFilter = '' | 'approved' | 'pending' | 'rejected';

const STATUS_FILTERS = [
  { label: 'Pendientes', value: 'pending' },
  { label: 'Aprobadas', value: 'approved' },
  { label: 'Devueltas', value: 'rejected' },
];

// Bandeja de la oficina: solicitudes de admisión (crean el alumno) y de inscripción (crean la inscripción).
const AdmissionsView = () => {
  const permissions = usePermissions();
  const { periods } = useAcademicPeriod();
  const { data: applications, isLoading: isLoadingApplications } = useLiveCollection('admissionApplications');
  const { data: requests, isLoading: isLoadingRequests } = useLiveCollection('enrollmentRequests');
  const { data: students } = useLiveCollection(
    'students',
    permissions.scope('students') === 'all' || permissions.scope('admissions') === 'all',
  );
  const classes = useLiveData('classes');
  const [section, setSection] = useState<AdmissionsSection>('applications');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [search, setSearch] = useState('');
  const [openApplication, setOpenApplication] = useState<AdmissionApplication | null>(null);
  const [requestToReject, setRequestToReject] = useState<EnrollmentRequest | null>(null);
  const { error, run } = useAsyncAction();

  const canReview = permissions.can('admissions', 'edit');
  const canApproveEnrollment = canReview && permissions.can('enrollments', 'create');
  const pendingApplications = applications.filter((application) => application.status === 'pending').length;
  const pendingRequests = requests.filter((request) => request.status === 'pending').length;
  const visibleApplications = applications.filter(
    (application) =>
      (!statusFilter || application.status === statusFilter) &&
      matchesSearch([application.name, application.churchName, application.email], search),
  );
  const visibleRequests = requests.filter(
    (request) => (!statusFilter || request.status === statusFilter) && matchesSearch([request.studentName], search),
  );
  const tabs = [
    { count: pendingApplications, icon: FileSignature, label: 'Admisión', value: 'applications' as const },
    { count: pendingRequests, icon: ClipboardList, label: 'Inscripción', value: 'enrollments' as const },
  ];
  const subtitle = `${pluralize(pendingApplications, 'solicitud de admisión pendiente', 'solicitudes de admisión pendientes')} y ${pluralize(pendingRequests, 'inscripción por confirmar', 'inscripciones por confirmar')}`;
  const isLoading = section === 'applications' ? isLoadingApplications : isLoadingRequests;
  const visibleCount = section === 'applications' ? visibleApplications.length : visibleRequests.length;

  const handleApproveRequest = (request: EnrollmentRequest) => run(() => approveEnrollmentRequest(request));

  return (
    <div className="view">
      <ViewHeader subtitle={subtitle} title="Solicitudes">
        <SearchInput
          label="Buscar solicitud"
          onChange={setSearch}
          placeholder="Nombre, iglesia o correo…"
          value={search}
        />
      </ViewHeader>
      <div className="view-toolbar">
        <SegmentedTabs label="Tipo de solicitud" onChange={setSection} tabs={tabs} value={section} />
        <FilterChips
          allLabel="Todas"
          label="Filtrar por estado"
          onChange={(value) => setStatusFilter(value as StatusFilter)}
          options={STATUS_FILTERS}
          value={statusFilter}
        />
      </div>
      {error && <p className="form-alert">{error}</p>}
      <section className="panel panel-body-flush">
        {isLoading && <ListSkeleton rows={6} />}
        {!isLoading && visibleCount === 0 && (
          <EmptyState
            icon={Inbox}
            text="Cuando un estudiante envíe su solicitud desde su cuenta, aparece aquí."
            title="No hay solicitudes con este filtro"
          />
        )}
        {!isLoading && section === 'applications' && visibleApplications.length > 0 && (
          <ApplicationTable applications={visibleApplications} onOpen={setOpenApplication} />
        )}
        {!isLoading && section === 'enrollments' && visibleRequests.length > 0 && (
          <EnrollmentRequestTable
            canReview={canApproveEnrollment}
            classNames={buildNameMap(classes)}
            onApprove={handleApproveRequest}
            onReject={setRequestToReject}
            periodNames={buildNameMap(periods)}
            requests={visibleRequests}
          />
        )}
      </section>
      {openApplication && (
        <ApplicationReviewDialog
          application={applications.find((application) => application.id === openApplication.id) ?? openApplication}
          canPrint={permissions.can('admissions', 'print')}
          canReview={canReview && permissions.can('students', 'create')}
          onClose={() => setOpenApplication(null)}
          students={students}
        />
      )}
      {requestToReject && <RejectRequestDialog onClose={() => setRequestToReject(null)} request={requestToReject} />}
    </div>
  );
};

export default AdmissionsView;
