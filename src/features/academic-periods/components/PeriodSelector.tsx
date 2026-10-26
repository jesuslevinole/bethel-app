import { CalendarRange, Check, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import Popover from '../../../shared/components/Popover';
import { formatDateRange } from '../../../utils/dateFormat';
import { getPeriodStatus, PERIOD_STATUS_LABELS } from '../../../utils/periodStatus';
import { useAcademicPeriod } from '../academicPeriodContext';
import './PeriodSelector.css';

interface PeriodSelectorProps {
  managePath?: string;
}

// Selector global del período académico (barra superior). Sin períodos, invita a crear uno.
const PeriodSelector = ({ managePath }: PeriodSelectorProps) => {
  const { isLoading, periods, selectPeriod, selectedPeriod } = useAcademicPeriod();

  if (isLoading) return <span className="period-selector-skeleton skel-line" />;

  if (!selectedPeriod) {
    if (!managePath) return <span className="period-selector-empty">Sin períodos todavía</span>;
    return (
      <Link className="period-selector-trigger" to={managePath}>
        <CalendarRange size={17} />
        Crear el primer período
      </Link>
    );
  }

  const selectedStatus = getPeriodStatus(selectedPeriod.startDate, selectedPeriod.endDate);

  return (
    <Popover
      label="Período académico"
      panelClassName="period-selector-panel"
      trigger={
        <>
          <CalendarRange size={17} />
          <span className="period-selector-name">{selectedPeriod.name}</span>
          <span className={`period-selector-dot${selectedStatus === 'active' ? ' is-active' : ''}`} />
          <ChevronDown size={16} />
        </>
      }
      triggerClassName="period-selector-trigger"
    >
      {(close) => (
        <>
          <div className="popover-header">
            <h2 className="popover-title">Período académico</h2>
          </div>
          <div className="popover-body">
            {periods.map((period) => {
              const status = getPeriodStatus(period.startDate, period.endDate);
              const isSelected = period.id === selectedPeriod.id;
              return (
                <button
                  className={`popover-option${isSelected ? ' is-selected' : ''}`}
                  key={period.id}
                  onClick={() => {
                    selectPeriod(period.id);
                    close();
                  }}
                  type="button"
                >
                  <span className="popover-option-text">
                    <span className="popover-option-title">{period.name}</span>
                    <span className="popover-option-detail">
                      {PERIOD_STATUS_LABELS[status]} · {formatDateRange(period.startDate, period.endDate)}
                    </span>
                  </span>
                  {isSelected && <Check className="period-selector-check" size={18} />}
                </button>
              );
            })}
          </div>
          {managePath && (
            <div className="popover-footer">
              <Link className="btn btn-ghost period-selector-manage" onClick={close} to={managePath}>
                Administrar períodos
              </Link>
            </div>
          )}
        </>
      )}
    </Popover>
  );
};

export default PeriodSelector;
