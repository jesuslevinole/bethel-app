import RowActions from '../../../shared/components/RowActions';
import type { CourseCost, RowPermissions } from '../../../types/index';
import { getBooksTotal, getCourseTotal, getProgramTotal, summarizeMonthlyFees } from '../../../utils/courseCost';
import { formatDate } from '../../../utils/dateFormat';
import { displayId } from '../../../utils/displayId';
import { formatMoney } from '../../../utils/money';
import { pluralize } from '../../../utils/plural';
import { getRelationName } from '../../../utils/relations';
import './CourseCosts.css';

interface CourseCostTableProps {
  rowPermissions: RowPermissions;
  classNames: Map<string, string>;
  costs: CourseCost[];
  onDelete: (cost: CourseCost) => void;
  onEdit: (cost: CourseCost) => void;
}

const CourseCostTable = ({ classNames, costs, onDelete, onEdit, rowPermissions }: CourseCostTableProps) => (
  <div className="table-wrap">
    <table className="table">
      <thead>
        <tr>
          <th scope="col">ID</th>
          <th scope="col">Fecha</th>
          <th scope="col">Clase</th>
          <th className="cell-num" scope="col">Inscripción</th>
          <th className="cell-num" scope="col">Graduación</th>
          <th className="cell-num" scope="col">Libros</th>
          <th className="cell-num" scope="col">Mensualidad</th>
          <th className="cell-num" scope="col">Total curso</th>
          <th className="cell-num" scope="col">Total programa</th>
          <th scope="col">
            <span className="visually-hidden">Acciones</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {costs.map((cost) => {
          const className = getRelationName(classNames, cost.classId);
          return (
            <tr key={cost.id}>
              <td className="cell-id">{displayId(cost.id)}</td>
              <td className="cell-date">{formatDate(cost.date)}</td>
              <td className="cell-strong">{className}</td>
              <td className="cell-num">{formatMoney(cost.enrollmentFee)}</td>
              <td className="cell-num">{formatMoney(cost.graduationFee)}</td>
              <td className="cell-num">
                {formatMoney(getBooksTotal(cost.books))}
                <span className="book-count">{pluralize(cost.books.length, 'libro', 'libros')}</span>
              </td>
              <td className="cell-num">{summarizeMonthlyFees(cost.monthlyFees)}</td>
              <td className="cell-num">{formatMoney(getCourseTotal(cost))}</td>
              <td className="cell-num cell-strong">{formatMoney(getProgramTotal(cost))}</td>
              <td className="cell-actions">
                <RowActions
                  canDelete={rowPermissions.canDelete}
                  canEdit={rowPermissions.canEdit}
                  itemLabel={`los costos de ${className}`}
                  onDelete={() => onDelete(cost)}
                  onEdit={() => onEdit(cost)}
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

export default CourseCostTable;
