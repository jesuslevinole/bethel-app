import DateInput from '../../../shared/components/DateInput';
import Field from '../../../shared/components/Field';
import { toChoiceOptions, YES_NO_LABELS, type ApplicationStepProps } from '../applicationForm';
import ChoiceField from './ChoiceField';

const YES_NO_OPTIONS = toChoiceOptions(YES_NO_LABELS);

const StepFaith = ({ onChange, values }: ApplicationStepProps) => (
  <div className="application-step">
    <ChoiceField
      label="¿Has recibido el Bautismo del Espíritu Santo con la evidencia inicial de hablar en otras lenguas (Hechos 2:4)?"
      onChange={(answer) => onChange('holySpiritBaptism', answer)}
      options={YES_NO_OPTIONS}
      value={values.holySpiritBaptism}
    />
    <ChoiceField
      label="¿Has sido bautizado en las aguas?"
      onChange={(answer) => onChange('waterBaptism', answer)}
      options={YES_NO_OPTIONS}
      value={values.waterBaptism}
    />
    {values.waterBaptism === 'yes' && (
      <Field htmlFor="application-baptism-date" label="¿Cuándo? (aproximado)">
        <DateInput
          id="application-baptism-date"
          onChange={(isoDate) => onChange('waterBaptismDate', isoDate)}
          value={values.waterBaptismDate}
        />
      </Field>
    )}
    {values.waterBaptism === 'no' && (
      <p className="form-alert">Todo estudiante debe estar bautizado en las aguas antes de ser aceptado como alumno.</p>
    )}
    <h3 className="form-section-title">Contacto de emergencia</h3>
    <div className="form-grid">
      <Field htmlFor="application-emergency-name" label="Nombre">
        <input
          className="input"
          id="application-emergency-name"
          onChange={(event) => onChange('emergencyName', event.target.value)}
          value={values.emergencyName}
        />
      </Field>
      <Field htmlFor="application-emergency-relationship" label="Relación">
        <input
          className="input"
          id="application-emergency-relationship"
          onChange={(event) => onChange('emergencyRelationship', event.target.value)}
          placeholder="Esposo, hija, hermana…"
          value={values.emergencyRelationship}
        />
      </Field>
      <Field htmlFor="application-emergency-phone" label="Teléfono">
        <input
          className="input"
          id="application-emergency-phone"
          inputMode="tel"
          onChange={(event) => onChange('emergencyPhone', event.target.value)}
          value={values.emergencyPhone}
        />
      </Field>
    </div>
  </div>
);

export default StepFaith;
