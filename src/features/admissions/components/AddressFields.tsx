import Field from '../../../shared/components/Field';
import type { PostalAddress } from '../../../types/index';

interface AddressFieldsProps {
  idPrefix: string;
  onChange: (address: PostalAddress) => void;
  value: PostalAddress;
}

// Dirección como en el formulario: número y calle, ciudad, estado y código postal.
const AddressFields = ({ idPrefix, onChange, value }: AddressFieldsProps) => {
  const setPart = (part: keyof PostalAddress, text: string) => onChange({ ...value, [part]: text });

  return (
    <div className="address-fields">
      <Field className="address-street" htmlFor={`${idPrefix}-street`} label="Número y calle">
        <input
          autoComplete="street-address"
          className="input"
          id={`${idPrefix}-street`}
          onChange={(event) => setPart('street', event.target.value)}
          value={value.street}
        />
      </Field>
      <Field htmlFor={`${idPrefix}-city`} label="Ciudad">
        <input
          className="input"
          id={`${idPrefix}-city`}
          onChange={(event) => setPart('city', event.target.value)}
          value={value.city}
        />
      </Field>
      <Field htmlFor={`${idPrefix}-state`} label="Estado">
        <input
          className="input"
          id={`${idPrefix}-state`}
          onChange={(event) => setPart('state', event.target.value)}
          placeholder="NJ"
          value={value.state}
        />
      </Field>
      <Field htmlFor={`${idPrefix}-zip`} label="Código postal">
        <input
          className="input"
          id={`${idPrefix}-zip`}
          inputMode="numeric"
          onChange={(event) => setPart('zip', event.target.value)}
          value={value.zip}
        />
      </Field>
    </div>
  );
};

export default AddressFields;
