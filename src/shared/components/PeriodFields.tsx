import DateInput from './DateInput';
import Field from './Field';

interface PeriodFieldsProps {
  idPrefix: string;
  onEndChange: (isoDate: string) => void;
  onStartChange: (isoDate: string) => void;
  periodEnd: string;
  periodStart: string;
}

// Inicio y fin del período, con aviso si el fin queda antes del inicio.
const PeriodFields = ({ idPrefix, onEndChange, onStartChange, periodEnd, periodStart }: PeriodFieldsProps) => {
  const isEndBeforeStart = Boolean(periodStart && periodEnd && periodEnd < periodStart);

  return (
    <>
      <Field htmlFor={`${idPrefix}-period-start`} label="Inicio del período">
        <DateInput id={`${idPrefix}-period-start`} onChange={onStartChange} value={periodStart} />
      </Field>
      <Field
        error={isEndBeforeStart ? 'El fin no puede ser antes del inicio.' : null}
        htmlFor={`${idPrefix}-period-end`}
        label="Fin del período"
      >
        <DateInput id={`${idPrefix}-period-end`} invalid={isEndBeforeStart} onChange={onEndChange} value={periodEnd} />
      </Field>
    </>
  );
};

export default PeriodFields;
