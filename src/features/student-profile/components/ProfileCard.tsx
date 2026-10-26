import type { Student } from '../../../types/index';
import PhotoUploader from './PhotoUploader';

interface ProfileCardProps {
  canEdit: boolean;
  photoUrl: string | null;
  student: Student;
}

const ProfileCard = ({ canEdit, photoUrl, student }: ProfileCardProps) => {
  const facts = [
    { label: 'Dirección', value: student.address },
    { label: 'Ciudad', value: student.city },
    { label: 'Iglesia', value: student.church },
    { label: 'Pastor', value: student.pastor },
  ];

  return (
    <aside className="panel profile-card">
      <PhotoUploader canEdit={canEdit} dataUrl={photoUrl} studentId={student.id} studentName={student.name} />
      <span className="profile-card-code">ID {student.code}</span>
      <dl className="profile-facts">
        {facts.map(({ label, value }) => (
          <div className="profile-fact" key={label}>
            <dt>{label}</dt>
            <dd>{value || '—'}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
};

export default ProfileCard;
