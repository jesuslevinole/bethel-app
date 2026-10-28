import Field from '../../../shared/components/Field';
import FilterChips from '../../../shared/components/FilterChips';
import type { SchoolRecord } from '../../../types/index';

interface SchoolFieldsProps {
  idPrefix: string;
  label: string;
  onChange: (school: SchoolRecord) => void;
  value: SchoolRecord;
}

const GRADE_OPTIONS = [
  { label: '1er', value: '1' },
  { label: '2do', value: '2' },
  { label: '3er', value: '3' },
  { label: '4to', value: '4' },
];

// Escuela (primaria o universidad) y el grado máximo que alcanzó.
const SchoolFields = ({ idPrefix, label, onChange, value }: SchoolFieldsProps) => (
  <div className="school-fields">
    <Field htmlFor={`${idPrefix}-name`} label={label}>
      <input
        className="input"
        id={`${idPrefix}-name`}
        onChange={(event) => onChange({ ...value, name: event.target.value })}
        placeholder="Nombre de la escuela"
        value={value.name}
      />
    </Field>
    <div className="field">
      <span className="field-label">Grado máximo</span>
      <FilterChips
        label={`Grado máximo en ${label}`}
        onChange={(highestGrade) => onChange({ ...value, highestGrade })}
        options={GRADE_OPTIONS}
        value={value.highestGrade}
      />
    </div>
  </div>
);

export default SchoolFields;
