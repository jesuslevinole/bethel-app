import { CheckCircle2, Clock3, PencilLine } from 'lucide-react';
import type { AdmissionApplication } from '../../../types/index';
import { formatDate } from '../../../utils/dateFormat';

interface ApplicationStatusCardProps {
  application: AdmissionApplication;
  onEdit: () => void;
}

// En qué va la solicitud del estudiante y qué sigue.
const ApplicationStatusCard = ({ application, onEdit }: ApplicationStatusCardProps) => {
  if (application.status === 'approved') {
    return (
      <section className="application-status panel panel-padded is-approved">
        <CheckCircle2 className="application-status-icon" size={30} />
        <div>
          <h2 className="application-status-title">¡Bienvenido/a a Bethel!</h2>
          <p>Tu solicitud fue aprobada. Ya puedes pedir tu inscripción en la clase que te toca.</p>
        </div>
      </section>
    );
  }
  if (application.status === 'rejected') {
    return (
      <section className="application-status panel panel-padded is-rejected">
        <PencilLine className="application-status-icon" size={30} />
        <div>
          <h2 className="application-status-title">Tu solicitud necesita cambios</h2>
          {application.reviewNote && <p className="application-status-note">{application.reviewNote}</p>}
          <p>Corrige lo que te piden y vuelve a enviarla.</p>
          <button className="btn btn-primary" onClick={onEdit} type="button">
            Corregir solicitud
          </button>
        </div>
      </section>
    );
  }
  return (
    <section className="application-status panel panel-padded is-pending">
      <Clock3 className="application-status-icon" size={30} />
      <div>
        <h2 className="application-status-title">Recibimos tu solicitud</h2>
        <p>
          La enviaste el {formatDate(application.date)}. La oficina la está revisando; aquí verás la respuesta. Lleva a
          la oficina los gastos de matriculación, tu foto y las transcripciones que tengas.
        </p>
        <button className="btn btn-secondary" onClick={onEdit} type="button">
          Corregir algo
        </button>
      </div>
    </section>
  );
};

export default ApplicationStatusCard;
