import { Link } from 'react-router-dom';
import { buildStudentDetailPath, PATHS } from '../../../routes/paths';
import type { EnrollmentRow } from '../../../types/index';
import { formatDate } from '../../../utils/dateFormat';

interface RecentEnrollmentsProps {
  rows: EnrollmentRow[];
}

const RecentEnrollments = ({ rows }: RecentEnrollmentsProps) => (
  <section className="panel">
    <header className="panel-header">
      <h2 className="panel-title">Inscripciones recientes</h2>
      <Link className="panel-link" to={PATHS.enrollments}>
        Ver todas
      </Link>
    </header>
    <div className="panel-body">
      {rows.length === 0 && <p className="load-bars-empty">Todavía no hay inscripciones en este período.</p>}
      <ul className="recent-list">
        {rows.map(({ className, enrollment, studentCode, studentName }) => (
          <li className="recent-item" key={enrollment.id}>
            <span className="recent-item-main">
              <Link className="cell-link recent-item-name" to={buildStudentDetailPath(enrollment.studentId)}>
                {studentName}
              </Link>
              <span className="recent-item-detail">
                {className}, {studentCode}
              </span>
            </span>
            <span className="recent-item-date">{formatDate(enrollment.date)}</span>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default RecentEnrollments;
