import { CalendarDays } from 'lucide-react';
import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { formatDate, parseUsDate } from '../../utils/dateFormat';
import CalendarPopover from './CalendarPopover';
import './DateInput.css';

interface DateInputProps {
  id?: string;
  invalid?: boolean;
  // Solo estas fechas se pueden elegir (p. ej. los miércoles de clase). Las demás salen apagadas en el calendario.
  isDateEnabled?: (isoDate: string) => boolean;
  onChange: (isoDate: string) => void;
  value: string;
}

// Escribe "10222026" y queda "10/22/2026": agrega las barras mientras se teclea.
const maskUsDate = (rawText: string) => {
  const digits = rawText.replace(/\D/g, '').slice(0, 8);
  const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean);
  return parts.join('/');
};

// Captura de fechas: siempre MM/DD/AAAA (nunca <input type="date">, que depende del idioma del navegador).
// Entrega AAAA-MM-DD, o '' mientras la fecha esté incompleta o no exista.
const DateInput = ({ id, invalid = false, isDateEnabled, onChange, value }: DateInputProps) => {
  const [text, setText] = useState(value ? formatDate(value) : '');
  const [isRejected, setIsRejected] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isCalendarOpen) return undefined;
    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsCalendarOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isCalendarOpen]);

  const handleTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    const maskedText = maskUsDate(event.target.value);
    const isoDate = parseUsDate(maskedText);
    const isAllowed = !isoDate || !isDateEnabled || isDateEnabled(isoDate);
    setText(maskedText);
    setIsRejected(!isAllowed);
    onChange(isoDate && isAllowed ? isoDate : '');
  };

  const handlePickDate = (isoDate: string) => {
    setText(formatDate(isoDate));
    setIsRejected(false);
    onChange(isoDate);
    setIsCalendarOpen(false);
  };

  // Escape cierra solo el calendario, no el modal que lo contiene.
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Escape' || !isCalendarOpen) return;
    event.stopPropagation();
    setIsCalendarOpen(false);
  };

  return (
    <div className="date-input" onKeyDown={handleKeyDown} ref={containerRef}>
      <input
        autoComplete="off"
        className={`date-input-field input${invalid || isRejected ? ' is-invalid' : ''}`}
        id={id}
        inputMode="numeric"
        onChange={handleTextChange}
        placeholder="MM/DD/AAAA"
        value={text}
      />
      <button
        aria-expanded={isCalendarOpen}
        aria-label="Abrir calendario"
        className="btn btn-icon date-input-toggle"
        onClick={() => setIsCalendarOpen((isOpen) => !isOpen)}
        type="button"
      >
        <CalendarDays size={18} />
      </button>
      {isCalendarOpen && <CalendarPopover isDateEnabled={isDateEnabled} onPick={handlePickDate} selectedDate={value} />}
    </div>
  );
};

export default DateInput;
