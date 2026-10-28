import { FileSignature } from 'lucide-react';
import { useState } from 'react';
import { useAcademicPeriod } from '../features/academic-periods/academicPeriodContext';
import ApplicationStatusCard from '../features/admissions/components/ApplicationStatusCard';
import ApplicationSummary from '../features/admissions/components/ApplicationSummary';
import ApplicationWizard from '../features/admissions/components/ApplicationWizard';
import EnrollmentRequestPanel from '../features/admissions/components/EnrollmentRequestPanel';
import { toApplicationFormValues } from '../features/admissions/applicationForm';
import { useAppSession } from '../features/auth/appSessionContext';
import { usePermissions } from '../features/auth/hooks/usePermissions';
import { COLLECTIONS } from '../lib/firebase/collections';
import EmptyState from '../shared/components/EmptyState';
import ListSkeleton from '../shared/components/ListSkeleton';
import ViewHeader from '../shared/components/ViewHeader';
import { useLiveData, useLiveFilteredCollection } from '../shared/data/liveCollections';
import { useLiveDocument } from '../shared/data/useLiveDocument';
import { useStudentDirectory } from '../shared/data/useScopedData';
import type { AdmissionApplication } from '../types/index';
import '../features/admissions/components/Admissions.css';

// El camino del estudiante nuevo: llenar la solicitud de admisión, esperar la aprobación y pedir su inscripción.
const MyApplicationView = () => {
  const { appUser, email } = useAppSession();
  const { studentId } = usePermissions();
  const { periods } = useAcademicPeriod();
  const applicantId = appUser?.id ?? null;
  const application = useLiveDocument<AdmissionApplication>(COLLECTIONS.admissionApplications, applicantId);
  const { data: requests } = useLiveFilteredCollection('enrollmentRequests', 'studentId', studentId);
  const { data: students } = useStudentDirectory();
  const classes = useLiveData('classes');
  const [isEditing, setIsEditing] = useState(false);
  const student = students.find((candidate) => candidate.id === studentId) ?? null;
  const defaults = { email: appUser?.email ?? email ?? '', name: appUser?.name ?? '' };

  if (!applicantId) {
    return (
      <div className="view">
        <ViewHeader title="Mi solicitud" />
        <section className="panel">
          <EmptyState
            icon={FileSignature}
            text="Esta pantalla es para las cuentas de estudiantes."
            title="Solo para estudiantes"
          />
        </section>
      </div>
    );
  }

  const showWizard = !application.isLoading && (!application.data || isEditing);
  const subtitle = showWizard
    ? 'Solicitud del estudiante. Te toma unos 10 minutos; ten a mano los datos de tu iglesia y tu pastor.'
    : 'Tu solicitud de admisión y tu inscripción.';

  return (
    <div className="view">
      <ViewHeader subtitle={subtitle} title="Mi solicitud" />
      {application.isLoading && <ListSkeleton rows={6} />}
      {showWizard && (
        <ApplicationWizard
          applicantId={applicantId}
          application={application.data}
          defaults={defaults}
          onCancel={application.data ? () => setIsEditing(false) : undefined}
          onSubmitted={() => setIsEditing(false)}
        />
      )}
      {!showWizard && application.data && (
        <>
          <ApplicationStatusCard application={application.data} onEdit={() => setIsEditing(true)} />
          {application.data.status === 'approved' && student && (
            <EnrollmentRequestPanel classes={classes} periods={periods} requests={requests} student={student} />
          )}
          <section className="application-sent panel panel-padded">
            <h2 className="panel-title">Lo que enviaste</h2>
            <ApplicationSummary values={toApplicationFormValues(application.data, defaults)} />
          </section>
        </>
      )}
    </div>
  );
};

export default MyApplicationView;
