import PeriodBadge from '../../../shared/components/PeriodBadge';
import RowActions from '../../../shared/components/RowActions';
import type { AcademicPeriod, RowPermissions } from '../../../types/index';
import { listClassDates, SEMESTER_NAMES } from '../../../utils/classDays';
import { formatDateRange } from '../../../utils/dateFormat';
import { pluralize } from '../../../utils/plural';
import './PeriodList.css';

interface PeriodListProps {
  onDelete: (period: AcademicPeriod) => void;
  onEdit: (period: AcademicPeriod) => void;
  onSelect: (periodId: string) => void;
  periods: AcademicPeriod[];
  rowPermissions: RowPermissions;
  selectedPeriodId: string | null;
}

const PeriodList = ({ onDelete, onEdit, onSelect, periods, rowPermissions, selectedPeriodId }: PeriodListProps) => (
  <ul className="period-list">
    {periods.map((period) => {
      const isSelected = period.id === selectedPeriodId;
      return (
        <li className={`panel period-card${isSelected ? ' is-selected' : ''}`} key={period.id}>
          <div className="period-card-header">
            <div>
              <h2 className="period-card-name">{period.name}</h2>
              <span className="period-card-dates">{formatDateRange(period.startDate, period.endDate)}</span>
            </div>
            <RowActions
              canDelete={rowPermissions.canDelete}
              canEdit={rowPermissions.canEdit}
              itemLabel={period.name}
              onDelete={() => onDelete(period)}
              onEdit={() => onEdit(period)}
            />
          </div>
          <dl className="period-semesters">
            {(period.semesters ?? []).map((semester, index) => (
              <div className="period-semester-row" key={SEMESTER_NAMES[index]}>
                <dt>{SEMESTER_NAMES[index]}</dt>
                <dd>{formatDateRange(semester.startDate, semester.endDate)}</dd>
              </div>
            ))}
            {!period.semesters?.length && (
              <div className="period-semester-row">
                <dt>Semestres</dt>
                <dd className="period-semester-missing">Sin definir: edita el período para agregarlos.</dd>
              </div>
            )}
            <div className="period-semester-row">
              <dt>Clases</dt>
              <dd>{pluralize(listClassDates(period).length, 'miércoles', 'miércoles')}</dd>
            </div>
          </dl>
          <div className="period-card-footer">
            <PeriodBadge periodEnd={period.endDate} periodStart={period.startDate} />
            {isSelected ? (
              <span className="badge badge-muted">En uso en la app</span>
            ) : (
              <button className="btn btn-ghost" onClick={() => onSelect(period.id)} type="button">
                Trabajar en este período
              </button>
            )}
          </div>
        </li>
      );
    })}
  </ul>
);

export default PeriodList;
