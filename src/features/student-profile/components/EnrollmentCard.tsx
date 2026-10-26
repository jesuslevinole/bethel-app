import { Link } from 'react-router-dom';
import type { AcademicPeriod } from '../../../types/index';
import { formatDate } from '../../../utils/dateFormat';

interface EnrollmentCardProps {
  attendanceRate: number | null;
  className: string | null;
  enrollmentsPath?: string;
  period: AcademicPeriod;
}

// Clase y período del alumno en el período elegido (lo que antes estaba en la hoja de registro).
const EnrollmentCard = ({ attendanceRate, className, enrollmentsPath, period }: EnrollmentCardProps) => {
  if (!className) {
    return (
      <section className="panel panel-body enrollment-missing">
        <p>No está inscrito en {period.name}.</p>
        {enrollmentsPath && (
          <Link className="btn btn-secondary" to={enrollmentsPath}>
            Ir a Inscripciones
          </Link>
        )}
      </section>
    );
  }

  const facts = [
    { label: 'Clase', value: className },
    { label: 'Período inicial', value: formatDate(period.startDate) },
    { label: 'Período final', value: formatDate(period.endDate) },
    { label: 'Asistencia', value: attendanceRate === null ? '—' : `${attendanceRate}%` },
  ].filter((fact) => fact.label !== 'Asistencia' || attendanceRate !== null);

  return (
    <section className="panel">
      <header className="panel-header">
        <h2 className="panel-title">{period.name}</h2>
      </header>
      <div className="panel-body">
        <dl className="enrollment-facts">
          {facts.map(({ label, value }) => (
            <div className="enrollment-fact" key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
};

export default EnrollmentCard;
