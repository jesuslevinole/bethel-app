import type { CourseBook, MonthlyFee } from '../../../types/index';
import { getBooksTotal, getCourseTotal, getProgramTotal, summarizeMonthlyFees } from '../../../utils/courseCost';
import { formatMoney } from '../../../utils/money';

interface CostSummaryProps {
  books: CourseBook[];
  enrollmentFee: number;
  graduationFee: number;
  monthlyFees: MonthlyFee[];
}

const CostSummary = ({ books, enrollmentFee, graduationFee, monthlyFees }: CostSummaryProps) => {
  const cost = { books, enrollmentFee, graduationFee, monthlyFees };

  return (
    <div className="cost-summary">
      <h3 className="form-section-title">Resumen</h3>
      <div className="cost-summary-monthly">
        <span className="cost-summary-monthly-label">Mensualidad</span>
        <span className="cost-summary-monthly-value">{summarizeMonthlyFees(monthlyFees)}</span>
      </div>
      <dl className="cost-summary-lines">
        <div className="cost-summary-line">
          <dt>Inscripción</dt>
          <dd>{formatMoney(enrollmentFee)}</dd>
        </div>
        <div className="cost-summary-line">
          <dt>Libros</dt>
          <dd>{formatMoney(getBooksTotal(books))}</dd>
        </div>
        <div className="cost-summary-line">
          <dt>Total curso (mensualidades)</dt>
          <dd>{formatMoney(getCourseTotal(cost))}</dd>
        </div>
        <div className="cost-summary-line">
          <dt>Graduación</dt>
          <dd>{formatMoney(graduationFee)}</dd>
        </div>
        <div className="cost-summary-line cost-summary-total">
          <dt>Total del programa</dt>
          <dd>{formatMoney(getProgramTotal(cost))}</dd>
        </div>
      </dl>
    </div>
  );
};

export default CostSummary;
