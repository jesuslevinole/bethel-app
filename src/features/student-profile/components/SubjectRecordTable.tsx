import type { StudentSubjectRecord } from '../../../types/index';
import { formatAttendanceScore } from '../../attendance/gradeFormula';
import { formatScore } from '../../attendance/gradeScores';
import GpaBadge from '../../attendance/components/GpaBadge';

interface SubjectRecordTableProps {
  records: StudentSubjectRecord[];
}

// Mismas columnas que la boleta del instituto: exámenes, nota diaria, asistencia, promedio y GPA.
const SubjectRecordTable = ({ records }: SubjectRecordTableProps) => (
  <div className="table-wrap">
    <table className="record-table table">
      <thead>
        <tr>
          <th scope="col">Materia</th>
          <th className="cell-num" scope="col">Primer examen</th>
          <th className="cell-num" scope="col" title="Promedio de las ND menos 1 punto por falta">
            Nota diaria
          </th>
          <th className="cell-num" scope="col">Segundo examen</th>
          <th className="cell-num" scope="col">Proyecto</th>
          <th className="cell-num" scope="col">Asistencia</th>
          <th className="cell-num" scope="col">Promedio</th>
          <th className="cell-num" scope="col">GPA</th>
        </tr>
      </thead>
      <tbody>
        {records.map((record) => (
          <tr key={record.key}>
            <td>
              <span className="record-subject">
                <span className="cell-strong">{record.subjectName}</span>
                <span className="cell-muted">{record.teacherName}</span>
              </span>
            </td>
            <td className="cell-num">{formatScore(record.scores.firstExam)}</td>
            <td className="cell-num">{formatScore(record.result.adjustedDaily)}</td>
            <td className="cell-num">{formatScore(record.scores.secondExam)}</td>
            <td className="cell-num">{formatScore(record.scores.project)}</td>
            <td className="cell-num" title={`${record.present} presente, ${record.late} tarde, ${record.absent} faltas`}>
              {formatAttendanceScore(record.result.attendanceScore)}
            </td>
            <td className="cell-num cell-strong">{formatScore(record.result.average)}</td>
            <td className="cell-num">
              <GpaBadge gpa={record.result.gpa} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default SubjectRecordTable;
