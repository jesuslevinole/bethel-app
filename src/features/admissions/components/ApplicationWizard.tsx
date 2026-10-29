import { ArrowLeft, ArrowRight, Send } from 'lucide-react';
import { useState } from 'react';
import SignaturePad from '../../../shared/components/SignaturePad';
import { useAsyncAction } from '../../../shared/hooks/useAsyncAction';
import { useFormFields } from '../../../shared/hooks/useFormFields';
import type { AdmissionApplication } from '../../../types/index';
import {
  APPLICATION_FEES,
  APPLICATION_STEPS,
  toApplicationFormValues,
  validateApplicationStep,
  type ApplicationFormValues,
} from '../applicationForm';
import { submitApplication } from '../services/applicationRecords';
import ApplicationSummary from './ApplicationSummary';
import PastorSection from './PastorSection';
import StepChurch from './StepChurch';
import StepFaith from './StepFaith';
import StepPersonal from './StepPersonal';
import StepStudies from './StepStudies';

interface ApplicationWizardProps {
  applicantId: string;
  application: AdmissionApplication | null;
  defaults: { email: string; name: string };
  onCancel?: () => void;
  onSubmitted: () => void;
}

const getStepClassName = (index: number, currentIndex: number) => {
  if (index === currentIndex) return 'application-steps-item is-current';
  if (index < currentIndex) return 'application-steps-item is-done';
  return 'application-steps-item';
};

// Solicitud del estudiante en 5 pasos cortos. No se puede avanzar con un paso incompleto.
const ApplicationWizard = ({ applicantId, application, defaults, onCancel, onSubmitted }: ApplicationWizardProps) => {
  const { setField, values } = useFormFields<ApplicationFormValues>(toApplicationFormValues(application, defaults));
  const [stepIndex, setStepIndex] = useState(0);
  const [isPastorOpen, setIsPastorOpen] = useState(Boolean(application?.pastorSignature));
  const { error, isRunning, run, setError } = useAsyncAction();
  const step = APPLICATION_STEPS[stepIndex];
  const isLastStep = stepIndex === APPLICATION_STEPS.length - 1;

  const handleNext = () => {
    const problem = validateApplicationStep(step.key, values);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setStepIndex((current) => current + 1);
  };

  const handleBack = () => {
    setError(null);
    setStepIndex((current) => Math.max(current - 1, 0));
  };

  const handleSubmit = async () => {
    const problem = APPLICATION_STEPS.map(({ key }) => validateApplicationStep(key, values)).find(Boolean);
    if (problem) {
      setError(problem);
      return;
    }
    if (await run(() => submitApplication(applicantId, values))) onSubmitted();
  };

  return (
    <section className="application-wizard panel panel-padded">
      <ol aria-label="Pasos de la solicitud" className="application-steps">
        {APPLICATION_STEPS.map((candidate, index) => (
          <li className={getStepClassName(index, stepIndex)} key={candidate.key}>
            <span className="application-steps-number">{index + 1}</span>
            <span className="application-steps-title">{candidate.title}</span>
          </li>
        ))}
      </ol>
      <h2 className="application-step-title">{step.title}</h2>
      {step.key === 'personal' && <StepPersonal onChange={setField} values={values} />}
      {step.key === 'studies' && <StepStudies onChange={setField} values={values} />}
      {step.key === 'church' && <StepChurch onChange={setField} values={values} />}
      {step.key === 'faith' && <StepFaith onChange={setField} values={values} />}
      {step.key === 'review' && (
        <div className="application-step">
          <ApplicationSummary values={values} />
          <div className="application-fees">
            <span className="application-fees-title">Entrega en la oficina junto con esta solicitud</span>
            <ul>
              {APPLICATION_FEES.map((fee) => (
                <li key={fee.key}>
                  {fee.label}
                  {fee.amount !== null && <strong>${fee.amount}.00</strong>}
                </li>
              ))}
              <li>Transcripciones de estudios previos (si las tienes)</li>
              <li>Una foto personal</li>
            </ul>
          </div>
          <label className="application-certify">
            <input
              checked={values.certified}
              onChange={(event) => setField('certified', event.target.checked)}
              type="checkbox"
            />
            Certifico que todas mis respuestas son correctas y me comprometo a cumplir las reglas del instituto.
          </label>
          <SignaturePad
            label="Tu firma"
            onChange={(signature) => setField('applicantSignature', signature)}
            signerName={values.name}
            value={values.applicantSignature ?? null}
          />
          <div className="application-pastor">
            <div className="application-pastor-header">
              <div>
                <h3 className="form-section-title">Firma del pastor</h3>
                <p className="application-note">
                  Opcional aquí: si tu pastor está contigo puede contestar y firmar en esta pantalla. Si no, firma en la
                  oficina.
                </p>
              </div>
              <button className="btn btn-secondary" onClick={() => setIsPastorOpen((isOpen) => !isOpen)} type="button">
                {isPastorOpen ? 'Ocultar' : 'Mi pastor va a firmar'}
              </button>
            </div>
            {isPastorOpen && (
              <PastorSection
                answers={values.pastorAnswers ?? []}
                onAnswersChange={(answers) => setField('pastorAnswers', answers)}
                onSignatureChange={(signature) => setField('pastorSignature', signature)}
                pastorName={values.pastorName}
                signature={values.pastorSignature ?? null}
              />
            )}
          </div>
        </div>
      )}
      {error && <p className="form-alert">{error}</p>}
      <footer className="application-wizard-footer">
        {stepIndex === 0 && onCancel && (
          <button className="btn btn-ghost" disabled={isRunning} onClick={onCancel} type="button">
            Cancelar
          </button>
        )}
        {stepIndex > 0 && (
          <button className="btn btn-secondary" disabled={isRunning} onClick={handleBack} type="button">
            <ArrowLeft size={18} />
            Atrás
          </button>
        )}
        {!isLastStep && (
          <button className="btn btn-primary btn-large" onClick={handleNext} type="button">
            Siguiente
            <ArrowRight size={18} />
          </button>
        )}
        {isLastStep && (
          <button className="btn btn-primary btn-large" disabled={isRunning} onClick={handleSubmit} type="button">
            <Send size={18} />
            {isRunning ? 'Enviando…' : 'Enviar solicitud'}
          </button>
        )}
      </footer>
    </section>
  );
};

export default ApplicationWizard;
