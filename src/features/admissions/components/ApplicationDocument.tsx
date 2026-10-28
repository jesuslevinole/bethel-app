import logoUrl from '../../../assets/bethel-logo.png';
import { INSTITUTE } from '../../../config/institute';
import type { AdmissionApplication } from '../../../types/index';
import { formatDate } from '../../../utils/dateFormat';
import { APPLICATION_FEES, toApplicationFormValues } from '../applicationForm';
import ApplicationSummary from './ApplicationSummary';

interface ApplicationDocumentProps {
  application: AdmissionApplication;
}

const PASTOR_QUESTIONS = [
  '¿Sabe usted algún motivo por el cual el solicitante no debe ser admitido(a) al Instituto?',
  '¿Tiene el solicitante más de dos (2) meses de convertido?',
  '¿Respalda el testimonio del estudiante?',
  '¿Notificará usted cuando el solicitante demuestre cambio espiritual?',
  '¿Se hará responsable la Iglesia de cumplir con la deuda del estudiante?',
];

// Solicitud lista para imprimir y firmar (solicitante, pastor y oficina), como el formulario IBAD80.
const ApplicationDocument = ({ application }: ApplicationDocumentProps) => {
  const values = toApplicationFormValues(application, { email: application.email, name: application.name });
  const receivedFees = new Set(application.receivedFees ?? []);

  return (
    <article className="print-document application-document">
      <header className="application-document-header">
        <img alt="" className="application-document-logo" src={logoUrl} />
        <div>
          <span className="application-document-institute">{INSTITUTE.name}</span>
          <span className="application-document-line">{INSTITUTE.church}</span>
          <span className="application-document-line">{INSTITUTE.address}</span>
        </div>
        <div className="application-document-title">
          <h2>Solicitud del estudiante</h2>
          <span>Enviada el {formatDate(application.date)}</span>
        </div>
      </header>
      <ApplicationSummary values={values} />
      <div className="application-document-signature">
        <span>Firma del solicitante</span>
        <span>Fecha</span>
      </div>
      <section className="application-document-box">
        <h3>Para el uso del pastor del solicitante solamente</h3>
        <ol>
          {PASTOR_QUESTIONS.map((question) => (
            <li key={question}>
              <span>{question}</span>
              <span className="application-document-checks">☐ Sí ☐ No</span>
            </li>
          ))}
        </ol>
        <p className="application-document-fine">
          Yo certifico en lo mejor de mi conocimiento que todas mis respuestas en esta aplicación son correctas. Yo me
          comprometeré a cumplir con las reglas y regulaciones del Distrito Hispano del Este y del Instituto Bíblico de
          las Asambleas de Dios.
        </p>
        <div className="application-document-signature">
          <span>Firma del pastor</span>
          <span>Fecha</span>
        </div>
      </section>
      <section className="application-document-box">
        <h3>Para el uso de la oficina del instituto solamente</h3>
        <p>Fecha en que se recibió: {formatDate(application.receivedDate)}</p>
        <ul className="application-document-fees">
          {APPLICATION_FEES.map((fee) => (
            <li key={fee.key}>
              {receivedFees.has(fee.key) ? '☑' : '☐'} {fee.label}
              {fee.amount !== null && ` ($${fee.amount}.00)`}
            </li>
          ))}
        </ul>
        <div className="application-document-signature">
          <span>Firma de secretaria/o</span>
          <span>Fecha</span>
        </div>
      </section>
    </article>
  );
};

export default ApplicationDocument;
