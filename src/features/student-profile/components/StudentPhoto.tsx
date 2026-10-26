import { getInitials } from '../../../utils/initials';
import './StudentPhoto.css';

interface StudentPhotoProps {
  className?: string;
  dataUrl: string | null;
  name: string;
}

// Foto del alumno en proporción carnet; sin foto muestra sus iniciales.
const StudentPhoto = ({ className, dataUrl, name }: StudentPhotoProps) => {
  const photoClassName = className ? `student-photo ${className}` : 'student-photo';
  if (!dataUrl) {
    return (
      <span aria-label={`${name} sin foto`} className={photoClassName} role="img">
        {getInitials(name)}
      </span>
    );
  }
  return <img alt={`Foto de ${name}`} className={photoClassName} src={dataUrl} />;
};

export default StudentPhoto;
