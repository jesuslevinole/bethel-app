import DateInput from '../../../shared/components/DateInput';
import Field from '../../../shared/components/Field';
import {
  BIRTH_GENDER_LABELS,
  getAge,
  MARITAL_STATUS_LABELS,
  MINIMUM_AGE,
  toChoiceOptions,
  type ApplicationStepProps,
} from '../applicationForm';
import AddressFields from './AddressFields';
import ChoiceField from './ChoiceField';

const StepPersonal = ({ onChange, values }: ApplicationStepProps) => {
  const age = getAge(values.birthDate);
  const ageHint = age !== null && age < MINIMUM_AGE ? `Debes tener al menos ${MINIMUM_AGE} años.` : undefined;

  return (
    <div className="application-step">
      <Field htmlFor="application-name" label="Nombre completo">
        <input
          autoComplete="name"
          className="input"
          id="application-name"
          onChange={(event) => onChange('name', event.target.value)}
          value={values.name}
        />
      </Field>
      <AddressFields
        idPrefix="application-address"
        onChange={(address) => onChange('address', address)}
        value={values.address}
      />
      <div className="form-grid">
        <Field htmlFor="application-phone" label="Teléfono">
          <input
            autoComplete="tel"
            className="input"
            id="application-phone"
            inputMode="tel"
            onChange={(event) => onChange('phone', event.target.value)}
            value={values.phone}
          />
        </Field>
        <Field htmlFor="application-email" label="Correo electrónico">
          <input
            autoComplete="email"
            className="input"
            id="application-email"
            onChange={(event) => onChange('email', event.target.value)}
            type="email"
            value={values.email}
          />
        </Field>
        <Field error={ageHint} htmlFor="application-birth-date" label="Fecha de nacimiento">
          <DateInput
            id="application-birth-date"
            onChange={(isoDate) => onChange('birthDate', isoDate)}
            value={values.birthDate}
          />
        </Field>
        <Field htmlFor="application-birth-place" label="Lugar de nacimiento">
          <input
            className="input"
            id="application-birth-place"
            onChange={(event) => onChange('birthPlace', event.target.value)}
            value={values.birthPlace}
          />
        </Field>
      </div>
      <ChoiceField
        label="Estado civil"
        onChange={(maritalStatus) => onChange('maritalStatus', maritalStatus)}
        options={toChoiceOptions(MARITAL_STATUS_LABELS)}
        value={values.maritalStatus}
      />
      {(values.maritalStatus === 'married' || values.maritalStatus === 'remarried') && (
        <Field htmlFor="application-spouse" label="Nombre de tu cónyuge">
          <input
            className="input"
            id="application-spouse"
            onChange={(event) => onChange('spouseName', event.target.value)}
            value={values.spouseName}
          />
        </Field>
      )}
      <ChoiceField
        label="Género de nacimiento"
        onChange={(birthGender) => onChange('birthGender', birthGender)}
        options={toChoiceOptions(BIRTH_GENDER_LABELS)}
        value={values.birthGender}
      />
    </div>
  );
};

export default StepPersonal;
