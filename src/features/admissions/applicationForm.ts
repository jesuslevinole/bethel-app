import type {
  AdmissionApplication,
  ApplicationStatus,
  BirthGender,
  MaritalStatus,
  PostalAddress,
  PreviousInstitute,
  YesNo,
} from '../../types/index';
import { isIsoDate, todayIso } from '../../utils/dateFormat';

// Lo que llena el estudiante (sin los campos de la oficina).
export type ApplicationFormValues = Omit<
  AdmissionApplication,
  'date' | 'id' | 'receivedDate' | 'receivedFees' | 'reviewNote' | 'status' | 'studentId'
>;

const EMPTY_ADDRESS: PostalAddress = { city: '', state: '', street: '', zip: '' };
const EMPTY_INSTITUTE: PreviousInstitute = {
  address: EMPTY_ADDRESS,
  attended: '',
  name: '',
  year: '',
  yearsCompleted: '',
};

export const toApplicationFormValues = (
  application: AdmissionApplication | null,
  defaults: { email: string; name: string },
): ApplicationFormValues => ({
  address: application?.address ?? EMPTY_ADDRESS,
  birthDate: application?.birthDate ?? '',
  birthGender: application?.birthGender ?? '',
  birthPlace: application?.birthPlace ?? '',
  certified: application?.certified ?? false,
  churchAddress: application?.churchAddress ?? EMPTY_ADDRESS,
  churchName: application?.churchName ?? '',
  churchPositions: application?.churchPositions ?? '',
  districtInstitute: application?.districtInstitute ?? EMPTY_INSTITUTE,
  email: application?.email ?? defaults.email,
  emergencyName: application?.emergencyName ?? '',
  emergencyPhone: application?.emergencyPhone ?? '',
  emergencyRelationship: application?.emergencyRelationship ?? '',
  holySpiritBaptism: application?.holySpiritBaptism ?? '',
  maritalStatus: application?.maritalStatus ?? '',
  name: application?.name ?? defaults.name,
  otherInstitute: application?.otherInstitute ?? EMPTY_INSTITUTE,
  pastorName: application?.pastorName ?? '',
  pastorPhone: application?.pastorPhone ?? '',
  phone: application?.phone ?? '',
  primarySchool: application?.primarySchool ?? { highestGrade: '', name: '' },
  spouseName: application?.spouseName ?? '',
  university: application?.university ?? { highestGrade: '', name: '' },
  waterBaptism: application?.waterBaptism ?? '',
  waterBaptismDate: application?.waterBaptismDate ?? '',
});

// Pasos del formulario, en orden (es una secuencia: se llenan uno tras otro).
export const APPLICATION_STEPS = [
  { key: 'personal', title: 'Tus datos' },
  { key: 'studies', title: 'Tus estudios' },
  { key: 'church', title: 'Tu iglesia' },
  { key: 'faith', title: 'Fe y emergencia' },
  { key: 'review', title: 'Revisar y enviar' },
] as const;

export type ApplicationStepKey = (typeof APPLICATION_STEPS)[number]['key'];

export const MINIMUM_AGE = 18;

// Edad cumplida a la fecha de hoy.
export const getAge = (birthDate: string, today = todayIso()) => {
  if (!isIsoDate(birthDate)) return null;
  const [birthYear, birthMonth, birthDay] = birthDate.split('-').map(Number);
  const [year, month, day] = today.split('-').map(Number);
  const hadBirthday = month > birthMonth || (month === birthMonth && day >= birthDay);
  return year - birthYear - (hadBirthday ? 0 : 1);
};

const isAddressComplete = (address: PostalAddress) => Boolean(address.street.trim() && address.city.trim());

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Lo que falta en un paso (null = completo). Solo se pide lo que el formulario en papel marca como necesario.
export const validateApplicationStep = (step: ApplicationStepKey, values: ApplicationFormValues) => {
  if (step === 'personal') {
    if (!values.name.trim()) return 'Escribe tu nombre completo.';
    if (!isAddressComplete(values.address)) return 'Escribe tu dirección (calle y ciudad).';
    if (!values.phone.trim()) return 'Escribe tu teléfono.';
    if (!EMAIL_PATTERN.test(values.email.trim())) return 'Escribe un correo válido.';
    if (!values.birthDate) return 'Escribe tu fecha de nacimiento.';
    const age = getAge(values.birthDate);
    if (age === null) return 'Revisa tu fecha de nacimiento.';
    if (age < MINIMUM_AGE) return `Para ser aceptado como estudiante debes tener al menos ${MINIMUM_AGE} años.`;
    if (!values.maritalStatus) return 'Marca tu estado civil.';
    if (!values.birthGender) return 'Marca tu género de nacimiento.';
    return null;
  }
  if (step === 'studies') {
    const institutes = [values.districtInstitute, values.otherInstitute];
    if (institutes.some((institute) => !institute.attended))
      return 'Contesta si estudiaste antes en un instituto bíblico.';
    if (institutes.some((institute) => institute.attended === 'yes' && !institute.name.trim())) {
      return 'Escribe el nombre del instituto donde estudiaste.';
    }
    return null;
  }
  if (step === 'church') {
    if (!values.churchName.trim()) return 'Escribe el nombre de tu iglesia.';
    if (!values.pastorName.trim()) return 'Escribe el nombre de tu pastor.';
    return null;
  }
  if (step === 'faith') {
    if (!values.holySpiritBaptism) return 'Contesta la pregunta sobre el Bautismo del Espíritu Santo.';
    if (!values.waterBaptism) return 'Contesta si has sido bautizado en las aguas.';
    if (!values.emergencyName.trim() || !values.emergencyPhone.trim()) {
      return 'Escribe el nombre y el teléfono de tu contacto de emergencia.';
    }
    return null;
  }
  if (!values.certified) return 'Marca la casilla para certificar que tus respuestas son correctas.';
  return null;
};

export const MARITAL_STATUS_LABELS: Record<Exclude<MaritalStatus, ''>, string> = {
  divorced: 'Divorciado/a',
  married: 'Casado/a',
  remarried: 'Re-casado/a',
  single: 'Soltero/a',
};

export const BIRTH_GENDER_LABELS: Record<Exclude<BirthGender, ''>, string> = {
  female: 'Femenino',
  male: 'Masculino',
};

export const YES_NO_LABELS: Record<Exclude<YesNo, ''>, string> = { no: 'No', yes: 'Sí' };

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  approved: 'Aprobada',
  pending: 'En revisión',
  rejected: 'Necesita cambios',
};

export const APPLICATION_STATUS_BADGES: Record<ApplicationStatus, string> = {
  approved: 'badge badge-success',
  pending: 'badge badge-warning',
  rejected: 'badge badge-danger',
};

// Gastos que se entregan con la solicitud (formulario IBAD80). La cuota del recinto la pone cada instituto.
export const APPLICATION_FEES = [
  { amount: 35, key: 'registration', label: 'Matriculación' },
  { amount: 25, key: 'technology', label: 'Gastos de tecnología' },
  { amount: null, key: 'campusFee', label: 'Cuota de recinto (1er mes)' },
] as const;

export const formatAddress = (address: PostalAddress) =>
  [address.street, address.city, [address.state, address.zip].filter(Boolean).join(' ')]
    .filter((part) => part.trim())
    .join(', ');

export type SetApplicationField = <Key extends keyof ApplicationFormValues>(
  key: Key,
  value: ApplicationFormValues[Key],
) => void;

export interface ApplicationStepProps {
  onChange: SetApplicationField;
  values: ApplicationFormValues;
}

export const toChoiceOptions = <Value extends string>(labels: Record<Value, string>) =>
  (Object.entries(labels) as [Value, string][]).map(([value, label]) => ({ label, value }));

export const ENROLLMENT_REQUEST_STATUS_LABELS: Record<'approved' | 'pending' | 'rejected', string> = {
  approved: 'Confirmada',
  pending: 'En revisión',
  rejected: 'No aprobada',
};
