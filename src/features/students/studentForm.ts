import type { NewRecord, Student } from '../../types/index';

export type StudentFormValues = NewRecord<Student>;

export const toStudentFormValues = (student: Student | null, suggestedCode: string): StudentFormValues => ({
  address: student?.address ?? '',
  church: student?.church ?? '',
  city: student?.city ?? '',
  code: student?.code ?? suggestedCode,
  name: student?.name ?? '',
  pastor: student?.pastor ?? '',
});

export const trimStudentValues = (values: StudentFormValues): StudentFormValues => ({
  address: values.address.trim(),
  church: values.church.trim(),
  city: values.city.trim(),
  code: values.code.trim().toUpperCase(),
  name: values.name.trim(),
  pastor: values.pastor.trim(),
});
