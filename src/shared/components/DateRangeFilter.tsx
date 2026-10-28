import type { AcademicPeriod, DateRange } from '../../types/index';
import { getMonthRange, getYearRange, isSameRange } from '../../utils/dateRanges';
import DateInput from './DateInput';
import './DateRangeFilter.css';
import './FilterChips.css';

interface DateRangeFilterProps {
  onChange: (range: DateRange) => void;
  // Con período elegido aparece el atajo "Período académico".
  period: AcademicPeriod | null;
  value: DateRange;
}

// Filtro "desde / hasta" con atajos (este mes, mes pasado, este año, el período académico).
const DateRangeFilter = ({ onChange, period, value }: DateRangeFilterProps) => {
  const presets = [
    { label: 'Este mes', range: getMonthRange() },
    { label: 'Mes pasado', range: getMonthRange(undefined, -1) },
    { label: 'Este año', range: getYearRange() },
    ...(period
      ? [{ label: 'Período académico', range: { endDate: period.endDate, startDate: period.startDate } }]
      : []),
  ];

  return (
    <div className="date-range-filter">
      <div aria-label="Atajos de fechas" className="filter-chips" role="group">
        {presets.map((preset) => {
          const isActive = isSameRange(preset.range, value);
          return (
            <button
              aria-pressed={isActive}
              className={`filter-chip${isActive ? ' is-active' : ''}`}
              key={preset.label}
              onClick={() => onChange(preset.range)}
              type="button"
            >
              {preset.label}
            </button>
          );
        })}
      </div>
      <div className="date-range-fields">
        <label className="date-range-field">
          <span className="field-label">Desde</span>
          <DateInput onChange={(startDate) => onChange({ ...value, startDate })} value={value.startDate} />
        </label>
        <label className="date-range-field">
          <span className="field-label">Hasta</span>
          <DateInput onChange={(endDate) => onChange({ ...value, endDate })} value={value.endDate} />
        </label>
      </div>
    </div>
  );
};

export default DateRangeFilter;
