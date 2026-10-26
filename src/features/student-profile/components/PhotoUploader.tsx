import { Camera, Trash2 } from 'lucide-react';
import { useId, type ChangeEvent } from 'react';
import { useAsyncAction } from '../../../shared/hooks/useAsyncAction';
import { removeStudentPhoto, uploadStudentPhoto } from '../services/studentPhotos';
import StudentPhoto from './StudentPhoto';

interface PhotoUploaderProps {
  canEdit: boolean;
  dataUrl: string | null;
  studentId: string;
  studentName: string;
}

const PhotoUploader = ({ canEdit, dataUrl, studentId, studentName }: PhotoUploaderProps) => {
  const inputId = useId();
  const { error, isRunning, run } = useAsyncAction();

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    await run(() => uploadStudentPhoto(studentId, file), 'No se pudo subir la foto. Intenta con otra imagen.');
  };

  const uploadLabel = dataUrl ? 'Cambiar foto' : 'Subir foto';

  if (!canEdit) return <StudentPhoto dataUrl={dataUrl} name={studentName} />;

  return (
    <div className="photo-uploader">
      <StudentPhoto dataUrl={dataUrl} name={studentName} />
      <div className="photo-uploader-actions">
        <label aria-disabled={isRunning} className="btn btn-secondary" htmlFor={inputId}>
          <Camera size={17} />
          {isRunning ? 'Guardando…' : uploadLabel}
        </label>
        {dataUrl && (
          <button
            aria-label="Quitar foto"
            className="btn btn-icon is-danger"
            disabled={isRunning}
            onClick={() => run(() => removeStudentPhoto(studentId))}
            title="Quitar foto"
            type="button"
          >
            <Trash2 size={17} />
          </button>
        )}
      </div>
      <input
        accept="image/*"
        className="photo-uploader-input"
        disabled={isRunning}
        id={inputId}
        onChange={handleFileChange}
        type="file"
      />
      {error && <p className="field-error">{error}</p>}
    </div>
  );
};

export default PhotoUploader;
