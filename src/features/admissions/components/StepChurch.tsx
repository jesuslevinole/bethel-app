import Field from '../../../shared/components/Field';
import type { ApplicationStepProps } from '../applicationForm';
import AddressFields from './AddressFields';

const StepChurch = ({ onChange, values }: ApplicationStepProps) => (
  <div className="application-step">
    <Field htmlFor="application-church" label="Nombre de tu iglesia">
      <input
        className="input"
        id="application-church"
        onChange={(event) => onChange('churchName', event.target.value)}
        value={values.churchName}
      />
    </Field>
    <AddressFields
      idPrefix="application-church-address"
      onChange={(address) => onChange('churchAddress', address)}
      value={values.churchAddress}
    />
    <div className="form-grid">
      <Field htmlFor="application-pastor" label="Nombre del pastor">
        <input
          className="input"
          id="application-pastor"
          onChange={(event) => onChange('pastorName', event.target.value)}
          value={values.pastorName}
        />
      </Field>
      <Field htmlFor="application-pastor-phone" label="Teléfono del pastor">
        <input
          className="input"
          id="application-pastor-phone"
          inputMode="tel"
          onChange={(event) => onChange('pastorPhone', event.target.value)}
          value={values.pastorPhone}
        />
      </Field>
    </div>
    <Field
      hint="Por ejemplo: maestra de escuela dominical, ujier, alabanza."
      htmlFor="application-positions"
      label="Posición(es) en la iglesia"
    >
      <input
        className="input"
        id="application-positions"
        onChange={(event) => onChange('churchPositions', event.target.value)}
        value={values.churchPositions}
      />
    </Field>
  </div>
);

export default StepChurch;
