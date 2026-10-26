import { ChevronDown } from 'lucide-react';
import { useEffect, useId, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import type { SelectOption } from '../../types/index';
import { matchesSearch } from '../../utils/search';
import './SearchSelect.css';

interface SearchSelectProps {
  emptyText: string;
  id?: string;
  invalid?: boolean;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder: string;
  value: string;
}

const MAX_VISIBLE_OPTIONS = 50;

// Selector con buscador para listas largas (alumnos, maestros).
const SearchSelect = ({ emptyText, id, invalid = false, onChange, options, placeholder, value }: SearchSelectProps) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!isOpen) return undefined;
    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen]);

  const selectedOption = options.find((option) => option.value === value);
  const visibleOptions = options
    .filter((option) => matchesSearch([option.label, option.detail ?? ''], query))
    .slice(0, MAX_VISIBLE_OPTIONS);
  const displayText = isOpen ? query : (selectedOption?.label ?? '');

  const handleOpen = () => {
    setQuery('');
    setHighlightedIndex(0);
    setIsOpen(true);
  };

  const handleQueryChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    setHighlightedIndex(0);
    setIsOpen(true);
  };

  const handleSelect = (option: SelectOption) => {
    onChange(option.value);
    setIsOpen(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!isOpen) handleOpen();
      setHighlightedIndex((index) => Math.min(index + 1, visibleOptions.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightedIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === 'Enter' && isOpen) {
      event.preventDefault();
      const highlightedOption = visibleOptions[highlightedIndex];
      if (highlightedOption) handleSelect(highlightedOption);
    } else if (event.key === 'Escape' && isOpen) {
      event.stopPropagation();
      setIsOpen(false);
    }
  };

  const getOptionClassName = (option: SelectOption, index: number) => {
    const modifiers = [index === highlightedIndex ? 'is-highlighted' : '', option.value === value ? 'is-selected' : ''];
    return ['search-select-option', ...modifiers.filter(Boolean)].join(' ');
  };

  return (
    <div className="search-select" ref={containerRef}>
      <input
        aria-autocomplete="list"
        aria-controls={listId}
        aria-expanded={isOpen}
        autoComplete="off"
        className={`input search-select-field${invalid ? ' is-invalid' : ''}`}
        id={id}
        onChange={handleQueryChange}
        onFocus={handleOpen}
        onKeyDown={handleKeyDown}
        placeholder={selectedOption?.label ?? placeholder}
        role="combobox"
        value={displayText}
      />
      <ChevronDown aria-hidden="true" className="search-select-chevron" size={16} />
      {isOpen && (
        <ul className="search-select-list" id={listId} role="listbox">
          {visibleOptions.length === 0 && <li className="search-select-empty">{emptyText}</li>}
          {visibleOptions.map((option, index) => (
            <li
              aria-selected={option.value === value}
              className={getOptionClassName(option, index)}
              key={option.value}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => handleSelect(option)}
              onMouseMove={() => setHighlightedIndex(index)}
              role="option"
            >
              {option.label}
              {option.detail && <span className="search-select-detail">{option.detail}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchSelect;
