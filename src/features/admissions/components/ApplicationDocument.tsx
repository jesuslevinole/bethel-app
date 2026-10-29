import logoUrl from '../../../assets/bethel-logo.png';
import { INSTITUTE } from '../../../config/institute';
import type { AdmissionApplication, Signature } from '../../../types/index';
import { formatDate } from '../../../utils/dateFormat';
import {
  APPLICATION_FEES,
  isSigned,
  PASTOR_CERTIFICATION,
  PASTOR_QUESTIONS,
  toApplicationFormValues,
} from '../applicationForm';
import ApplicationSummary from './ApplicationSummary';

interface ApplicationDocumentProps {
  application: AdmissionApplication;
}

interface SignatureLineProps {
  label: string;
  signature: Signature | null | undefined;
}

// Línea de firma: con la firma hecha en pantalla encima (si existe) y su fecha al lado.
const SignatureLine = ({ label, signature }: SignatureLineProps) => (
  <div className="application-document-signature">
    <span className="application-document-sign">
      {isSigned(signature) && <img alt={`Firma de ${signature.signerName}`} src={signature.image} />}
      <span className="application-document-sign-label">
        {label}
        {isSigned(signature) && signature.signerName && `: ${signature.signerName}`}
      </span>
    </span>
    <span className="application-document-sign">
      <span className="application-document-sign-date">
        {isSigned(signature) ? formatDate(signature.signedAt) : ''}
      </span>
      <span className="application-document-sign-label">Fecha</span>
    </span>
  </div>
);

const check = (isChecked: boolean) => (isChecked ? '☑' : '☐');

// Solicitud lista para imprimir o guardar en PDF, con las firmas hechas en pantalla (formulario IBAD80).
const ApplicationDocument = ({ application }: ApplicationDocumentProps) => {
  const values = toApplicationFormValues(application, { email: application.email, name: application.name });
  const receivedFees = new Set(application.receivedFees ?? []);
  const pastorAnswers = application.pastorAnswers ?? [];

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
      <SignatureLine label="Firma del solicitante" signature={application.applicantSignature} />
      <section className="application-document-box">
        <h3>Para el uso del pastor del solicitante solamente</h3>
        <ol>
          {PASTOR_QUESTIONS.map((question, index) => (
            <li key={question}>
              <span>{question}</span>
              <span className="application-document-checks">
                {check(pastorAnswers[index] === 'yes')} Sí {check(pastorAnswers[index] === 'no')} No
              </span>
            </li>
          ))}
        </ol>
        <p className="application-document-fine">{PASTOR_CERTIFICATION}</p>
        <SignatureLine label="Firma del pastor" signature={application.pastorSignature} />
      </section>
      <section className="application-document-box">
        <h3>Para el uso de la oficina del instituto solamente</h3>
        <p>Fecha en que se recibió: {formatDate(application.receivedDate)}</p>
        <ul className="application-document-fees">
          {APPLICATION_FEES.map((fee) => (
            <li key={fee.key}>
              {check(receivedFees.has(fee.key))} {fee.label}
              {fee.amount !== null && ` ($${fee.amount}.00)`}
            </li>
          ))}
        </ul>
        <SignatureLine label="Firma de secretaria/o" signature={application.officeSignature} />
      </section>
    </article>
  );
};

export default ApplicationDocument;
