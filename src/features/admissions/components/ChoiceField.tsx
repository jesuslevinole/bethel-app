import FilterChips from '../../../shared/components/FilterChips';
import type { SelectOption } from '../../../types/index';

interface ChoiceFieldProps<Value extends string> {
  label: string;
  onChange: (value: Value) => void;
  options: { label: string; value: Value }[];
  value: Value | '';
}

// Pregunta de opción única (Sí / No, estado civil…) con botones grandes en vez de casillas pequeñas.
const ChoiceField = <Value extends string>({ label, onChange, options, value }: ChoiceFieldProps<Value>) => {
  const chipOptions: SelectOption[] = options;

  return (
    <div className="field choice-field">
      <span className="field-label">{label}</span>
      <FilterChips label={label} onChange={(next) => onChange(next as Value)} options={chipOptions} value={value} />
    </div>
  );
};

export default ChoiceField;
