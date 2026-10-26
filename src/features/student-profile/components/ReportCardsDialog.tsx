import { Printer } from 'lucide-react';
import { INSTITUTE } from '../../../config/institute';
import Modal from '../../../shared/components/Modal';
import type { AcademicPeriod, Student, StudentSubjectRecord } from '../../../types/index';
import { formatDateRange } from '../../../utils/dateFormat';
import { formatAttendanceScore } from '../../attendance/gradeFormula';
import { formatScore } from '../../attendance/gradeScores';
import DocumentHeader from './DocumentHeader';
import GpaBadge from '../../attendance/components/GpaBadge';
import '../../../shared/components/PrintDocument.css';
import './PrintDocuments.css';

interface ReportCardsDialogProps {
  className: string;
  onClose: () => void;
  period: AcademicPeriod;
  records: StudentSubjectRecord[];
  student: Student;
}

// Boletas ("Student Report Card" de la hoja): una por materia del período, para imprimir y firmar.
const ReportCardsDialog = ({ className, onClose, period, records, student }: ReportCardsDialogProps) => (
  <Modal
    onClose={onClose}
    size="full"
    subtitle={`${records.length} materias de ${className} en ${period.name}. Se imprimen dos por fila.`}
    title="Boletas de calificaciones"
  >
    <div className="modal-body">
      <div className="print-document report-card-sheet">
        {records.map((record) => (
          <article className="report-card" key={record.key}>
            <DocumentHeader title="Boleta de calificaciones" />
            <div className="report-card-line is-name">
              <span className="report-card-value">{student.name}</span>
              <span className="report-card-label">Nombre</span>
            </div>
            <div className="report-card-pair">
              <div className="report-card-line">
                <span className="report-card-value">{className}</span>
                <span className="report-card-label">Clase</span>
              </div>
              <div className="report-card-line">
                <span className="report-card-value">{formatDateRange(period.startDate, period.endDate)}</span>
                <span className="report-card-label">Período</span>
              </div>
            </div>
            <div className="report-card-line">
              <span className="report-card-value">{record.subjectName}</span>
              <span className="report-card-label">Materia</span>
            </div>
            <table className="report-card-table">
              <thead>
                <tr>
                  <th scope="col">Primer examen</th>
                  <th scope="col">Nota diaria</th>
                  <th scope="col">Segundo examen</th>
                  <th scope="col">Asistencia</th>
                  <th scope="col">Promedio</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{formatScore(record.scores.firstExam)}</td>
                  <td>{formatScore(record.result.adjustedDaily)}</td>
                  <td>{formatScore(record.scores.secondExam)}</td>
                  <td>{formatAttendanceScore(record.result.attendanceScore)}</td>
                  <td className="report-card-average">
                    {formatScore(record.result.average)}
                    <GpaBadge gpa={record.result.gpa} />
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="report-card-signatures">
              <div className="report-card-signature">
                <span className="report-card-signer">{record.teacherName}</span>
                <span className="report-card-label">Firma del maestro</span>
              </div>
              <div className="report-card-signature">
                <span className="report-card-signer">{INSTITUTE.principal}</span>
                <span className="report-card-label">Firma del director</span>
              </div>
            </div>
            <p className="report-card-motto">{INSTITUTE.motto}</p>
          </article>
        ))}
      </div>
    </div>
    <footer className="modal-footer">
      <button className="btn btn-secondary" onClick={onClose} type="button">
        Cerrar
      </button>
      <button className="btn btn-primary" onClick={() => window.print()} type="button">
        <Printer size={18} />
        Imprimir boletas
      </button>
    </footer>
  </Modal>
);

export default ReportCardsDialog;
