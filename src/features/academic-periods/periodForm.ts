import type { AcademicPeriod, AcademicSemester, NewRecord } from '../../types/index';
import { isDuplicatePeriodName, suggestPeriodName } from '../../utils/academicPeriods';
import { SEMESTER_NAMES, suggestSemesters } from '../../utils/classDays';
import { formatDate } from '../../utils/dateFormat';

export interface PeriodFormValues {
  customName: string;
  customSemesters: AcademicSemester[];
  endDate: string;
  isNameEdited: boolean;
  // Mientras no se tocan, los semestres salen de partir el período a la mitad.
  isSemestersEdited: boolean;
  startDate: string;
}

const EMPTY_SEMESTERS: AcademicSemester[] = [
  { endDate: '', startDate: '' },
  { endDate: '', startDate: '' },
];

export const toPeriodFormValues = (period: AcademicPeriod | null): PeriodFormValues => ({
  customName: period?.name ?? '',
  customSemesters: period?.semesters?.length ? period.semesters : EMPTY_SEMESTERS,
  endDate: period?.endDate ?? '',
  // Un período existente conserva su nombre; uno nuevo lo toma de las fechas hasta que el usuario lo cambie.
  isNameEdited: Boolean(period),
  isSemestersEdited: Boolean(period?.semesters?.length),
  startDate: period?.startDate ?? '',
});

export const getPeriodName = (values: PeriodFormValues) =>
  values.isNameEdited ? values.customName : suggestPeriodName(values.startDate, values.endDate);

export const getSemesters = (values: PeriodFormValues) =>
  values.isSemestersEdited
    ? values.customSemesters
    : (suggestSemesters(values.startDate, values.endDate) ?? EMPTY_SEMESTERS);

const validateSemesters = (semesters: AcademicSemester[], values: PeriodFormValues) => {
  for (const [index, semester] of semesters.entries()) {
    const name = SEMESTER_NAMES[index].toLowerCase();
    if (!semester.startDate || !semester.endDate) return `Escribe el inicio y el fin del ${name}.`;
    if (semester.endDate < semester.startDate) return `El fin del ${name} debe ser después de su inicio.`;
    if (semester.startDate < values.startDate || semester.endDate > values.endDate) {
      return `El ${name} debe quedar dentro del período (${formatDate(values.startDate)} a ${formatDate(values.endDate)}).`;
    }
  }
  if (semesters[1].startDate <= semesters[0].endDate) return 'El segundo semestre debe empezar después del primero.';
  return null;
};

export const validatePeriod = (values: PeriodFormValues, periods: AcademicPeriod[], ownId?: string) => {
  const name = getPeriodName(values).trim();
  if (!values.startDate || !values.endDate) return 'Escribe la fecha de inicio y la de fin.';
  if (values.endDate <= values.startDate) return 'El fin del período debe ser después del inicio.';
  if (!name) return 'Escribe el nombre del período.';
  if (isDuplicatePeriodName(periods, name, ownId)) return `Ya existe un período llamado "${name}".`;
  return validateSemesters(getSemesters(values), values);
};

export const toPeriodData = (values: PeriodFormValues): NewRecord<AcademicPeriod> => ({
  endDate: values.endDate,
  name: getPeriodName(values).trim(),
  semesters: getSemesters(values),
  startDate: values.startDate,
});
