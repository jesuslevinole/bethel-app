import type { SchoolClass } from '../../types/index';

interface ClassSelectProps {
  classes: SchoolClass[];
  id: string;
  invalid?: boolean;
  onChange: (classId: string) => void;
  value: string;
}

const ClassSelect = ({ classes, id, invalid = false, onChange, value }: ClassSelectProps) => (
  <select
    className={`input input-select${invalid ? ' is-invalid' : ''}`}
    id={id}
    onChange={(event) => onChange(event.target.value)}
    value={value}
  >
    <option value="">Elige una clase</option>
    {classes.map((schoolClass) => (
      <option key={schoolClass.id} value={schoolClass.id}>
        {schoolClass.name}
      </option>
    ))}
  </select>
);

export default ClassSelect;
