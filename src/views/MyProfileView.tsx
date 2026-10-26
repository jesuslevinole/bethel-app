import StudentProfileScreen from '../features/student-profile/components/StudentProfileScreen';
import { usePermissions } from '../features/auth/hooks/usePermissions';

// "Mi ficha": el estudiante ve su propio registro (usuario ligado a un alumno).
const MyProfileView = () => {
  const { studentId } = usePermissions();
  return <StudentProfileScreen isOwnProfile studentId={studentId ?? ''} />;
};

export default MyProfileView;
