// Solicitud de admisión (formulario IBAD80 "Solicitud del estudiante") que llena el propio estudiante
// después de crear su cuenta. Vive en admission_applications/{uid de su cuenta}.
// No se guarda el número de Seguro Social: el instituto no lo necesita en la app (si se exige, va en papel).
export type ApplicationStatus = 'approved' | 'pending' | 'rejected';

export type MaritalStatus = '' | 'divorced' | 'married' | 'remarried' | 'single';

export type BirthGender = '' | 'female' | 'male';

export type YesNo = '' | 'no' | 'yes';

export interface PostalAddress {
  city: string;
  state: string;
  street: string;
  zip: string;
}

// Instituto bíblico donde estudió antes.
export interface PreviousInstitute {
  address: PostalAddress;
  attended: YesNo;
  name: string;
  year: string;
  yearsCompleted: string;
}

export interface SchoolRecord {
  // Grado máximo: '1' a '4' (como en el formulario); '' sin marcar.
  highestGrade: string;
  name: string;
}

// Firma hecha en pantalla (dedo o mouse): imagen PNG en data URL, quién firmó y la fecha (AAAA-MM-DD).
export interface Signature {
  image: string;
  signedAt: string;
  signerName: string;
}

export interface AdmissionApplication {
  address: PostalAddress;
  applicantSignature?: Signature | null;
  birthDate: string;
  birthGender: BirthGender;
  birthPlace: string;
  certified: boolean;
  churchAddress: PostalAddress;
  churchName: string;
  churchPositions: string;
  date: string;
  districtInstitute: PreviousInstitute;
  email: string;
  emergencyName: string;
  emergencyPhone: string;
  emergencyRelationship: string;
  holySpiritBaptism: YesNo;
  id: string;
  maritalStatus: MaritalStatus;
  name: string;
  // Firma de la secretaria/o al recibir la solicitud.
  officeSignature?: Signature | null;
  otherInstitute: PreviousInstitute;
  // Respuestas del pastor a las 5 preguntas del formulario (en orden), y su firma.
  pastorAnswers?: YesNo[];
  pastorName: string;
  pastorSignature?: Signature | null;
  pastorPhone: string;
  phone: string;
  primarySchool: SchoolRecord;
  // Uso de la oficina.
  receivedDate?: string;
  receivedFees?: ('campusFee' | 'registration' | 'technology')[];
  reviewNote?: string;
  spouseName: string;
  status: ApplicationStatus;
  // Alumno creado al aprobar.
  studentId?: string;
  university: SchoolRecord;
  waterBaptism: YesNo;
  waterBaptismDate: string;
}
