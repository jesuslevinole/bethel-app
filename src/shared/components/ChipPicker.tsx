import { X } from 'lucide-react';
import { useState } from 'react';
import type { SelectOption } from '../../types/index';
import { matchesSearch } from '../../utils/search';
import './ChipPicker.css';

interface ChipPickerProps {
  emptyText: string;
  invalid?: boolean;
  itemNamePlural: string;
  onChange: (values: string[]) => void;
  options: SelectOption[];
  searchPlaceholder: string;
  selectedValues: string[];
}

// Selección múltiple: lista con búsqueda y casillas, y arriba lo elegido como chips removibles.
const ChipPicker = ({
  emptyText,
  invalid = false,
  itemNamePlural,
  onChange,
  options,
  searchPlaceholder,
  selectedValues,
}: ChipPickerProps) => {
  const [query, setQuery] = useState('');

  const selectedOptions = options.filter((option) => selectedValues.includes(option.value));
  const visibleOptions = options.filter((option) => matchesSearch([option.label], query));
  const summaryText =
    selectedOptions.length === 0
      ? `Aún no eliges ${itemNamePlural}.`
      : `${selectedOptions.length} de ${options.length} ${itemNamePlural}`;

  const handleToggle = (optionValue: string) => {
    const nextValues = selectedValues.includes(optionValue)
      ? selectedValues.filter((selectedValue) => selectedValue !== optionValue)
      : [...selectedValues, optionValue];
    onChange(nextValues);
  };

  return (
    <div className={`chip-picker${invalid ? ' is-invalid' : ''}`}>
      <div className="chip-picker-selected">
        <span className="chip-picker-summary">{summaryText}</span>
        {selectedOptions.length > 0 && (
          <div className="chip-list">
            {selectedOptions.map((option) => (
              <span className={option.disabled ? 'chip chip-picker-conflict' : 'chip'} key={option.value}>
                {option.label}
                <button
                  aria-label={`Quitar ${option.label}`}
                  className="chip-remove"
                  onClick={() => handleToggle(option.value)}
                  type="button"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
      <input
        aria-label={searchPlaceholder}
        className="chip-picker-search input"
        onChange={(event) => setQuery(event.target.value)}
        placeholder={searchPlaceholder}
        type="search"
        value={query}
      />
      <ul className="chip-picker-options">
        {visibleOptions.length === 0 && <li className="chip-picker-empty">{emptyText}</li>}
        {visibleOptions.map((option) => (
          <li key={option.value}>
            <label className={`chip-picker-option${option.disabled ? ' is-disabled' : ''}`}>
              <input
                checked={selectedValues.includes(option.value)}
                disabled={option.disabled && !selectedValues.includes(option.value)}
                onChange={() => handleToggle(option.value)}
                type="checkbox"
              />
              <span className="chip-picker-option-label">{option.label}</span>
              {option.detail && <span className="chip-picker-option-detail">{option.detail}</span>}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChipPicker;
