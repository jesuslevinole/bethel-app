import type { StudentSubjectRecord } from '../../../types/index';
import { formatAttendanceScore } from '../../attendance/gradeFormula';
import { formatScore } from '../../attendance/gradeScores';
import GpaBadge from '../../attendance/components/GpaBadge';

interface SubjectRecordCardsProps {
  records: StudentSubjectRecord[];
}

const SubjectRecordCards = ({ records }: SubjectRecordCardsProps) => (
  <ul className="record-cards">
    {records.map((record) => (
      <li className="record-card" key={record.key}>
        <div className="record-card-header">
          <div>
            <h3 className="record-card-title">{record.subjectName}</h3>
            <span className="cell-muted">{record.teacherName}</span>
          </div>
          <GpaBadge gpa={record.result.gpa} />
        </div>
        <dl className="record-card-meta">
          <dt>Primer examen</dt>
          <dd>{formatScore(record.scores.firstExam)}</dd>
          <dt>Nota diaria</dt>
          <dd>{formatScore(record.result.adjustedDaily)}</dd>
          <dt>Segundo examen</dt>
          <dd>{formatScore(record.scores.secondExam)}</dd>
          <dt>Proyecto</dt>
          <dd>{formatScore(record.scores.project)}</dd>
          <dt>Asistencia</dt>
          <dd>
            {formatAttendanceScore(record.result.attendanceScore)} ({record.absent} faltas)
          </dd>
          <dt>Promedio</dt>
          <dd className="cell-strong">{formatScore(record.result.average)}</dd>
        </dl>
      </li>
    ))}
  </ul>
);

export default SubjectRecordCards;
