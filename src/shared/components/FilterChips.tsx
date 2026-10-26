import type { SelectOption } from '../../types/index';
import './FilterChips.css';

interface FilterChipsProps {
  allLabel?: string;
  label: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  value: string;
}

// Selección de una opción en forma de pastillas. Con allLabel agrega la opción "todas" (value '').
const FilterChips = ({ allLabel, label, onChange, options, value }: FilterChipsProps) => {
  const chipOptions: SelectOption[] = allLabel ? [{ label: allLabel, value: '' }, ...options] : options;

  return (
    <div aria-label={label} className="filter-chips" role="group">
      {chipOptions.map((option) => (
        <button
          aria-pressed={option.value === value}
          className={`filter-chip${option.value === value ? ' is-active' : ''}`}
          key={option.value || 'all'}
          onClick={() => onChange(option.value)}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default FilterChips;
