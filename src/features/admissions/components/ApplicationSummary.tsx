import type { PreviousInstitute, SchoolRecord, YesNo } from '../../../types/index';
import { formatDate } from '../../../utils/dateFormat';
import {
  BIRTH_GENDER_LABELS,
  formatAddress,
  getAge,
  MARITAL_STATUS_LABELS,
  YES_NO_LABELS,
  type ApplicationFormValues,
} from '../applicationForm';

interface ApplicationSummaryProps {
  values: ApplicationFormValues;
}

interface SummaryRow {
  label: string;
  value: string;
}

interface SummarySectionProps {
  rows: SummaryRow[];
  title: string;
}

const yesNo = (answer: YesNo) => (answer ? YES_NO_LABELS[answer] : '—');

const describeSchool = (school: SchoolRecord) =>
  school.name.trim() ? `${school.name}${school.highestGrade ? `, grado ${school.highestGrade}` : ''}` : '—';

const describeInstitute = (institute: PreviousInstitute) => {
  if (institute.attended !== 'yes') return yesNo(institute.attended);
  const details = [
    institute.name,
    formatAddress(institute.address),
    institute.year && `año ${institute.year}`,
    institute.yearsCompleted && `${institute.yearsCompleted} años completados`,
  ];
  return `Sí: ${details.filter(Boolean).join(', ')}`;
};

const SummarySection = ({ rows, title }: SummarySectionProps) => (
  <section className="application-summary-section">
    <h3 className="application-summary-title">{title}</h3>
    <dl className="application-summary-list">
      {rows.map((row) => (
        <div key={row.label}>
          <dt>{row.label}</dt>
          <dd>{row.value.trim() || '—'}</dd>
        </div>
      ))}
    </dl>
  </section>
);

// La solicitud completa en modo lectura (revisar antes de enviar, oficina e impresión).
const ApplicationSummary = ({ values }: ApplicationSummaryProps) => {
  const age = getAge(values.birthDate);
  const isMarried = values.maritalStatus === 'married' || values.maritalStatus === 'remarried';

  return (
    <div className="application-summary">
      <SummarySection
        rows={[
          { label: 'Nombre', value: values.name },
          { label: 'Dirección', value: formatAddress(values.address) },
          { label: 'Teléfono', value: values.phone },
          { label: 'Correo', value: values.email },
          {
            label: 'Nacimiento',
            value: [formatDate(values.birthDate), age !== null ? `${age} años` : '', values.birthPlace]
              .filter(Boolean)
              .join(', '),
          },
          {
            label: 'Estado civil',
            value: [
              values.maritalStatus ? MARITAL_STATUS_LABELS[values.maritalStatus] : '',
              isMarried && values.spouseName ? `cónyuge: ${values.spouseName}` : '',
            ]
              .filter(Boolean)
              .join(', '),
          },
          { label: 'Género de nacimiento', value: values.birthGender ? BIRTH_GENDER_LABELS[values.birthGender] : '' },
        ]}
        title="Solicitante"
      />
      <SummarySection
        rows={[
          { label: 'Primaria', value: describeSchool(values.primarySchool) },
          { label: 'Universidad', value: describeSchool(values.university) },
          { label: 'Instituto Bíblico del Distrito', value: describeInstitute(values.districtInstitute) },
          { label: 'Otro Instituto Bíblico', value: describeInstitute(values.otherInstitute) },
        ]}
        title="Estudios"
      />
      <SummarySection
        rows={[
          { label: 'Iglesia', value: values.churchName },
          { label: 'Dirección', value: formatAddress(values.churchAddress) },
          { label: 'Pastor', value: [values.pastorName, values.pastorPhone].filter(Boolean).join(', ') },
          { label: 'Posiciones', value: values.churchPositions },
        ]}
        title="Iglesia"
      />
      <SummarySection
        rows={[
          { label: 'Bautismo del Espíritu Santo', value: yesNo(values.holySpiritBaptism) },
          {
            label: 'Bautizado en las aguas',
            value:
              values.waterBaptism === 'yes' && values.waterBaptismDate
                ? `Sí, ${formatDate(values.waterBaptismDate)}`
                : yesNo(values.waterBaptism),
          },
          {
            label: 'Contacto de emergencia',
            value: [values.emergencyName, values.emergencyRelationship, values.emergencyPhone]
              .filter(Boolean)
              .join(', '),
          },
        ]}
        title="Fe y emergencia"
      />
    </div>
  );
};

export default ApplicationSummary;
