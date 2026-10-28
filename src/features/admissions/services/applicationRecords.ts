import { admissionApplicationsService } from '../../../services/admissionApplicationsService';
import { appUsersService } from '../../../services/appUsersService';
import { studentsService } from '../../../services/studentsService';
import type { AdmissionApplication, NewRecord, Student } from '../../../types/index';
import { todayIso } from '../../../utils/dateFormat';
import { getNextStudentCode } from '../../../utils/studentCode';
import type { ApplicationFormValues } from '../applicationForm';

// El estudiante envía (o reenvía) su solicitud: queda en revisión. El id es el uid de su cuenta.
export const submitApplication = async (applicantId: string, values: ApplicationFormValues) => {
  const data: NewRecord<AdmissionApplication> = {
    ...values,
    date: todayIso(),
    email: values.email.trim().toLowerCase(),
    name: values.name.trim(),
    status: 'pending',
  };
  await admissionApplicationsService.set(applicantId, data);
};

export interface OfficeReview {
  receivedDate: string;
  receivedFees: NonNullable<AdmissionApplication['receivedFees']>;
  reviewNote: string;
}

// Datos del alumno nuevo sacados de la solicitud.
const toStudentData = (application: AdmissionApplication, students: Student[]): NewRecord<Student> => ({
  address: application.address.street.trim(),
  applicationId: application.id,
  birthDate: application.birthDate,
  church: application.churchName.trim(),
  city: [application.address.city, application.address.state].filter((part) => part.trim()).join(', '),
  code: getNextStudentCode(students),
  email: application.email,
  name: application.name.trim(),
  pastor: application.pastorName.trim(),
  phone: application.phone.trim(),
});

const isNotFound = (error: unknown) =>
  typeof error === 'object' && error !== null && 'code' in error && error.code === 'not-found';

// Liga la cuenta del estudiante (app_users/{uid}) a su alumno. Si la cuenta ya no existe, se sigue.
const linkAccount = async (applicantId: string, studentId: string) => {
  try {
    await appUsersService.update(applicantId, { studentId });
  } catch (error) {
    if (!isNotFound(error)) throw error;
  }
};

// Aprobar: registra al alumno (o usa uno que ya existe), liga la cuenta del estudiante y marca la solicitud.
export const approveApplication = async (
  application: AdmissionApplication,
  review: OfficeReview,
  options: { existingStudentId: string | null; students: Student[] },
) => {
  const studentId =
    options.existingStudentId ?? (await studentsService.create(toStudentData(application, options.students)));
  await linkAccount(application.id, studentId);
  await admissionApplicationsService.update(application.id, { ...review, status: 'approved', studentId });
  return studentId;
};

export const rejectApplication = async (application: AdmissionApplication, review: OfficeReview) => {
  await admissionApplicationsService.update(application.id, { ...review, status: 'rejected' });
};

// Solo guarda lo de la oficina (fecha recibida, gastos recibidos, nota) sin cambiar el estado.
export const saveOfficeReview = async (application: AdmissionApplication, review: OfficeReview) => {
  await admissionApplicationsService.update(application.id, review);
};
