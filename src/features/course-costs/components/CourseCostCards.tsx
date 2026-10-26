import RowActions from '../../../shared/components/RowActions';
import type { CourseCost, RowPermissions } from '../../../types/index';
import { getBooksTotal, getCourseTotal, getProgramTotal, summarizeMonthlyFees } from '../../../utils/courseCost';
import { formatDate } from '../../../utils/dateFormat';
import { formatMoney } from '../../../utils/money';
import { getRelationName } from '../../../utils/relations';

interface CourseCostCardsProps {
  rowPermissions: RowPermissions;
  classNames: Map<string, string>;
  costs: CourseCost[];
  onDelete: (cost: CourseCost) => void;
  onEdit: (cost: CourseCost) => void;
}

const CourseCostCards = ({ classNames, costs, onDelete, onEdit, rowPermissions }: CourseCostCardsProps) => (
  <ul className="record-cards">
    {costs.map((cost) => {
      const className = getRelationName(classNames, cost.classId);
      return (
        <li className="record-card" key={cost.id}>
          <div className="record-card-header">
            <div>
              <h3 className="record-card-title">{className}</h3>
              <span className="cell-muted">{formatDate(cost.date)}</span>
            </div>
            <RowActions
              canDelete={rowPermissions.canDelete}
              canEdit={rowPermissions.canEdit}
              itemLabel={`los costos de ${className}`}
              onDelete={() => onDelete(cost)}
              onEdit={() => onEdit(cost)}
            />
          </div>
          <dl className="record-card-meta">
            <dt>Inscripción</dt>
            <dd>{formatMoney(cost.enrollmentFee)}</dd>
            <dt>Libros</dt>
            <dd>
              {formatMoney(getBooksTotal(cost.books))} ({cost.books.length})
            </dd>
            <dt>Mensualidad</dt>
            <dd className="cell-strong">
              {summarizeMonthlyFees(cost.monthlyFees)}
            </dd>
            <dt>Graduación</dt>
            <dd>{formatMoney(cost.graduationFee)}</dd>
            <dt>Total curso</dt>
            <dd>{formatMoney(getCourseTotal(cost))}</dd>
            <dt>Total programa</dt>
            <dd>{formatMoney(getProgramTotal(cost))}</dd>
          </dl>
        </li>
      );
    })}
  </ul>
);

export default CourseCostCards;
