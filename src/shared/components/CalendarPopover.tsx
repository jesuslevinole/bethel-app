import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { isIsoDate, todayIso } from '../../utils/dateFormat';

interface CalendarPopoverProps {
  isDateEnabled?: (isoDate: string) => boolean;
  onPick: (isoDate: string) => void;
  selectedDate: string;
}

const MONTH_NAMES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];
const WEEKDAY_NAMES = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];

const toIso = (year: number, monthIndex: number, day: number) =>
  `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

const getStartMonth = (selectedDate: string) => {
  const baseDate = isIsoDate(selectedDate) ? selectedDate : todayIso();
  const [year, month] = baseDate.split('-').map(Number);
  return { monthIndex: month - 1, year };
};

const CalendarPopover = ({ isDateEnabled, onPick, selectedDate }: CalendarPopoverProps) => {
  const [visibleMonth, setVisibleMonth] = useState(() => getStartMonth(selectedDate));
  const today = todayIso();

  const { monthIndex, year } = visibleMonth;
  const leadingBlanks = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const dayNumbers = Array.from({ length: daysInMonth }, (_, index) => index + 1);
  const blankCells = Array.from({ length: leadingBlanks }, (_, index) => `blank-${index}`);

  const handleShiftMonth = (offset: number) => {
    const shifted = new Date(year, monthIndex + offset, 1);
    setVisibleMonth({ monthIndex: shifted.getMonth(), year: shifted.getFullYear() });
  };

  const getDayClassName = (isoDate: string) => {
    const modifiers = [isoDate === selectedDate ? 'is-selected' : '', isoDate === today ? 'is-today' : '']
      .filter(Boolean)
      .sort();
    return ['calendar-day', ...modifiers].join(' ');
  };

  return (
    <div aria-label="Calendario" className="calendar-popover" role="dialog">
      <div className="calendar-header">
        <button aria-label="Mes anterior" className="btn btn-icon" onClick={() => handleShiftMonth(-1)} type="button">
          <ChevronLeft size={18} />
        </button>
        <span className="calendar-month">
          {MONTH_NAMES[monthIndex]} {year}
        </span>
        <button aria-label="Mes siguiente" className="btn btn-icon" onClick={() => handleShiftMonth(1)} type="button">
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="calendar-grid">
        {WEEKDAY_NAMES.map((weekday) => (
          <span className="calendar-weekday" key={weekday}>
            {weekday}
          </span>
        ))}
        {blankCells.map((blankKey) => (
          <span key={blankKey} />
        ))}
        {dayNumbers.map((day) => {
          const isoDate = toIso(year, monthIndex, day);
          return (
            <button
              className={getDayClassName(isoDate)}
              disabled={isDateEnabled ? !isDateEnabled(isoDate) : false}
              key={isoDate}
              onClick={() => onPick(isoDate)}
              type="button"
            >
              {day}
            </button>
          );
        })}
      </div>
      <div className="calendar-footer">
        {(!isDateEnabled || isDateEnabled(today)) && (
          <button className="btn btn-ghost" onClick={() => onPick(today)} type="button">
            Hoy
          </button>
        )}
      </div>
    </div>
  );
};

export default CalendarPopover;
