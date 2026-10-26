import { ChevronLeft, FileText, GraduationCap, IdCard as IdCardIcon, Pencil, UserX } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PATHS } from '../../../routes/paths';
import EmptyState from '../../../shared/components/EmptyState';
import ListSkeleton from '../../../shared/components/ListSkeleton';
import NoPeriodState from '../../../shared/components/NoPeriodState';
import ViewHeader from '../../../shared/components/ViewHeader';
import { useStudentDirectory } from '../../../shared/data/useScopedData';
import { useAcademicPeriod } from '../../academic-periods/academicPeriodContext';
import { usePermissions } from '../../auth/hooks/usePermissions';
import StudentForm from '../../students/components/StudentForm';
import { useStudentProfile } from '../hooks/useStudentProfile';
import EnrollmentCard from './EnrollmentCard';
import IdCardDialog from './IdCardDialog';
import ProfileCard from './ProfileCard';
import ReportCardsDialog from './ReportCardsDialog';
import SubjectRecords from './SubjectRecords';
import TranscriptDialog from './TranscriptDialog';
import './StudentProfile.css';

interface StudentProfileScreenProps {
  isOwnProfile: boolean;
  studentId: string;
}

type OpenDialog = 'edit' | 'idCard' | 'reportCards' | 'transcript' | null;

// Ficha de un alumno. La usan "Alumnos → ficha" y "Mi ficha" (estudiante viendo la suya).
const StudentProfileScreen = ({ isOwnProfile, studentId }: StudentProfileScreenProps) => {
  const { selectedPeriod } = useAcademicPeriod();
  const permissions = usePermissions();
  const profile = useStudentProfile(studentId, selectedPeriod?.id ?? null);
  const { data: students } = useStudentDirectory();
  const [openDialog, setOpenDialog] = useState<OpenDialog>(null);
  const { student } = profile;
  const canEdit = permissions.can('students', 'edit');
  const enrollmentsPath = permissions.can('enrollments', 'create') ? PATHS.enrollments : undefined;

  if (profile.isLoadingStudent) return <ListSkeleton rows={8} />;
  if (!student) {
    const missingText = isOwnProfile
      ? 'No encontramos tu registro de alumno. Pide a Administración que revise tu usuario (rol Estudiante con tu nombre completo).'
      : 'Puede que lo hayan eliminado.';
    return (
      <div className="view">
        <section className="panel">
          <EmptyState icon={UserX} text={missingText} title="No encontramos la ficha" />
        </section>
      </div>
    );
  }

  const canPrint = permissions.can('students', 'print');
  const canPrintReportCards =
    canPrint && profile.canSeeRecords && Boolean(selectedPeriod && profile.className) && profile.records.length > 0;
  const canSeeHistory = profile.canSeeRecords && permissions.can('students', 'history');
  const subtitle = isOwnProfile ? `Tu ficha, ${student.code}` : `Ficha del alumno, ${student.code}`;

  return (
    <div className="view">
      {!isOwnProfile && (
        <Link className="back-link" to={PATHS.students}>
          <ChevronLeft size={16} />
          Alumnos
        </Link>
      )}
      <ViewHeader subtitle={subtitle} title={student.name}>
        {canEdit && (
          <button className="btn btn-secondary" onClick={() => setOpenDialog('edit')} type="button">
            <Pencil size={17} />
            Editar datos
          </button>
        )}
        {canSeeHistory && (
          <button className="btn btn-secondary" onClick={() => setOpenDialog('transcript')} type="button">
            <GraduationCap size={18} />
            Expediente
          </button>
        )}
        {canPrintReportCards && (
          <button className="btn btn-secondary" onClick={() => setOpenDialog('reportCards')} type="button">
            <FileText size={18} />
            Boletas
          </button>
        )}
        {canPrint && (
          <button className="btn btn-primary" onClick={() => setOpenDialog('idCard')} type="button">
            <IdCardIcon size={18} />
            Carnet
          </button>
        )}
      </ViewHeader>
      <div className="student-profile">
        <ProfileCard canEdit={canEdit} photoUrl={profile.photoUrl} student={student} />
        <div className="student-profile-main">
          {!selectedPeriod && <NoPeriodState />}
          {selectedPeriod && (
            <EnrollmentCard
              attendanceRate={profile.attendanceRate}
              className={profile.className}
              enrollmentsPath={enrollmentsPath}
              period={selectedPeriod}
            />
          )}
          {selectedPeriod && profile.className && profile.canSeeRecords && (
            <SubjectRecords error={profile.recordsError} isLoading={profile.isLoadingRecords} records={profile.records} />
          )}
        </div>
      </div>
      {openDialog === 'edit' && (
        <StudentForm onClose={() => setOpenDialog(null)} onSaved={() => setOpenDialog(null)} student={student} students={students} />
      )}
      {openDialog === 'transcript' && (
        <TranscriptDialog
          canPrint={canPrint}
          onClose={() => setOpenDialog(null)}
          photoUrl={profile.photoUrl}
          student={student}
        />
      )}
      {openDialog === 'reportCards' && selectedPeriod && profile.className && (
        <ReportCardsDialog
          className={profile.className}
          onClose={() => setOpenDialog(null)}
          period={selectedPeriod}
          records={profile.records}
          student={student}
        />
      )}
      {openDialog === 'idCard' && (
        <IdCardDialog
          className={profile.className}
          onClose={() => setOpenDialog(null)}
          period={selectedPeriod}
          photoUrl={profile.photoUrl}
          student={student}
        />
      )}
    </div>
  );
};

export default StudentProfileScreen;
