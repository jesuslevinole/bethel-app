import { useParams } from 'react-router-dom';
import StudentProfileScreen from '../features/student-profile/components/StudentProfileScreen';

const StudentDetailView = () => {
  const { studentId = '' } = useParams();
  return <StudentProfileScreen isOwnProfile={false} studentId={studentId} />;
};

export default StudentDetailView;
