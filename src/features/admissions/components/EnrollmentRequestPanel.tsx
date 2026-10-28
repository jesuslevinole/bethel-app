import { CheckCircle2, Clock3, Send } from 'lucide-react';
import { useState } from 'react';
import ClassSelect from '../../../shared/components/ClassSelect';
import Field from '../../../shared/components/Field';
import { useAsyncAction } from '../../../shared/hooks/useAsyncAction';
import { useScopedPeriodData } from '../../../shared/data/useScopedData';
import type { AcademicPeriod, EnrollmentRequest, SchoolClass, Student } from '../../../types/index';
import { formatDate, todayIso } from '../../../utils/dateFormat';
import { buildNameMap, getRelationName } from '../../../utils/relations';
import { ENROLLMENT_REQUEST_STATUS_LABELS } from '../applicationForm';
import { cancelEnrollmentRequest, requestEnrollment } from '../services/enrollmentRequestRecords';

interface EnrollmentRequestPanelProps {
  classes: SchoolClass[];
  periods: AcademicPeriod[];
  requests: EnrollmentRequest[];
  student: Student;
}

// Paso final del estudiante aprobado: pedir su inscripción. La oficina la confirma.
const EnrollmentRequestPanel = ({ classes, periods, requests, student }: EnrollmentRequestPanelProps) => {
  const today = todayIso();
  const openPeriods = periods.filter((period) => period.endDate >= today);
  const [periodId, setPeriodId] = useState(openPeriods.at(-1)?.id ?? '');
  const [classId, setClassId] = useState('');
  const { error, isRunning, run, setError } = useAsyncAction();
  const classNames = buildNameMap(classes);
  const periodNames = buildNameMap(periods);
  const enrollments = useScopedPeriodData('enrollments', periodId || null);
  const enrollment = enrollments.find((candidate) => candidate.studentId === student.id) ?? null;
  const pendingRequest =
    requests.find((request) => request.periodId === periodId && request.status === 'pending') ?? null;
  const pastRequests = requests.filter((request) => request.status !== 'pending');

  const handleRequest = async () => {
    if (!periodId || !classId) {
      setError('Elige el período y la clase.');
      return;
    }
    if (await run(() => requestEnrollment(student, classId, periodId))) setClassId('');
  };

  return (
    <section className="enrollment-request-panel panel panel-padded">
      <h2 className="panel-title">Tu inscripción</h2>
      {openPeriods.length === 0 && (
        <p className="application-note">Todavía no hay un período abierto para inscribirse. Vuelve pronto.</p>
      )}
      {openPeriods.length > 1 && (
        <Field htmlFor="request-period" label="Período académico">
          <select
            className="input input-select"
            id="request-period"
            onChange={(event) => setPeriodId(event.target.value)}
            value={periodId}
          >
            {openPeriods.map((period) => (
              <option key={period.id} value={period.id}>
                {period.name}
              </option>
            ))}
          </select>
        </Field>
      )}
      {enrollment && (
        <p className="request-status is-done">
          <CheckCircle2 size={20} />
          Estás inscrito/a en {getRelationName(classNames, enrollment.classId)} para{' '}
          {getRelationName(periodNames, enrollment.periodId)}.
        </p>
      )}
      {!enrollment && pendingRequest && (
        <div className="request-status is-pending">
          <Clock3 size={20} />
          <span>
            Pediste inscribirte en {getRelationName(classNames, pendingRequest.classId)} el{' '}
            {formatDate(pendingRequest.date)}. La oficina la está revisando.
          </span>
          <button
            className="btn btn-ghost"
            disabled={isRunning}
            onClick={() => run(() => cancelEnrollmentRequest(pendingRequest))}
            type="button"
          >
            Cancelar solicitud
          </button>
        </div>
      )}
      {!enrollment && !pendingRequest && periodId && (
        <div className="request-form">
          <Field htmlFor="request-class" label={`Clase para ${getRelationName(periodNames, periodId)}`}>
            <ClassSelect classes={classes} id="request-class" onChange={setClassId} value={classId} />
          </Field>
          <button className="btn btn-primary btn-large" disabled={isRunning} onClick={handleRequest} type="button">
            <Send size={18} />
            {isRunning ? 'Enviando…' : 'Pedir inscripción'}
          </button>
        </div>
      )}
      {error && <p className="form-alert">{error}</p>}
      {pastRequests.length > 0 && (
        <ul className="request-history">
          {pastRequests.map((request) => (
            <li key={request.id}>
              <span>
                {getRelationName(classNames, request.classId)}, {getRelationName(periodNames, request.periodId)}
              </span>
              <span className={request.status === 'approved' ? 'badge badge-success' : 'badge badge-danger'}>
                {ENROLLMENT_REQUEST_STATUS_LABELS[request.status]}
              </span>
              {request.reviewNote && <span className="cell-note">{request.reviewNote}</span>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default EnrollmentRequestPanel;
