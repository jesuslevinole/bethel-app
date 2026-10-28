import Field from '../../../shared/components/Field';
import type { PreviousInstitute } from '../../../types/index';
import { toChoiceOptions, YES_NO_LABELS } from '../applicationForm';
import AddressFields from './AddressFields';
import ChoiceField from './ChoiceField';

interface InstituteFieldsProps {
  idPrefix: string;
  onChange: (institute: PreviousInstitute) => void;
  question: string;
  value: PreviousInstitute;
}

// "¿Ha estudiado en algún instituto bíblico…?" y, si contesta que sí, los datos de ese instituto.
const InstituteFields = ({ idPrefix, onChange, question, value }: InstituteFieldsProps) => {
  const setPart = <Key extends keyof PreviousInstitute>(key: Key, partValue: PreviousInstitute[Key]) =>
    onChange({ ...value, [key]: partValue });

  return (
    <div className="application-subsection">
      <ChoiceField
        label={question}
        onChange={(attended) => setPart('attended', attended)}
        options={toChoiceOptions(YES_NO_LABELS)}
        value={value.attended}
      />
      {value.attended === 'yes' && (
        <>
          <Field htmlFor={`${idPrefix}-name`} label="Nombre del instituto">
            <input
              className="input"
              id={`${idPrefix}-name`}
              onChange={(event) => setPart('name', event.target.value)}
              value={value.name}
            />
          </Field>
          <AddressFields
            idPrefix={`${idPrefix}-address`}
            onChange={(address) => setPart('address', address)}
            value={value.address}
          />
          <div className="form-grid">
            <Field htmlFor={`${idPrefix}-year`} label="¿En qué año?">
              <input
                className="input"
                id={`${idPrefix}-year`}
                inputMode="numeric"
                onChange={(event) => setPart('year', event.target.value)}
                value={value.year}
              />
            </Field>
            <Field htmlFor={`${idPrefix}-completed`} label="¿Cuántos años completó?">
              <input
                className="input"
                id={`${idPrefix}-completed`}
                inputMode="numeric"
                onChange={(event) => setPart('yearsCompleted', event.target.value)}
                value={value.yearsCompleted}
              />
            </Field>
          </div>
          <p className="application-note">La oficina te pedirá la transcripción de créditos de ese instituto.</p>
        </>
      )}
    </div>
  );
};

export default InstituteFields;
