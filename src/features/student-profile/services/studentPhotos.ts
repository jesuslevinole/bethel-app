import { studentPhotosService } from '../../../services/studentPhotosService';
import { compressPortrait, isFileTooLarge, isImageFile } from '../../../utils/imageCompression';
import { UserFacingError } from '../../../utils/userFacingError';

// La foto va comprimida en Firestore (student_photos/{studentId}) y no en Storage:
// el plan Spark ya no incluye Cloud Storage, y una foto carnet comprimida pesa ~30 KB.
export const uploadStudentPhoto = async (studentId: string, file: File) => {
  if (!isImageFile(file)) throw new UserFacingError('Elige una imagen (JPG, PNG o HEIC exportada a JPG).');
  if (isFileTooLarge(file)) throw new UserFacingError('La imagen pesa más de 15 MB. Elige una más liviana.');
  const dataUrl = await compressPortrait(file);
  await studentPhotosService.set(studentId, { dataUrl });
};

export const removeStudentPhoto = async (studentId: string) => {
  await studentPhotosService.delete(studentId);
};
