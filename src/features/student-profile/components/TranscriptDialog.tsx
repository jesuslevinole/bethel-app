import { Printer } from 'lucide-react';
import { Fragment, useMemo } from 'react';
import { INSTITUTE } from '../../../config/institute';
import ListSkeleton from '../../../shared/components/ListSkeleton';
import Modal from '../../../shared/components/Modal';
import { useLiveData } from '../../../shared/data/liveCollections';
import type { Student } from '../../../types/index';
import { SEMESTER_NAMES } from '../../../utils/classDays';
import { buildNameMap } from '../../../utils/relations';
import { useAcademicPeriod } from '../../academic-periods/academicPeriodContext';
import { formatAttendanceScore } from '../../attendance/gradeFormula';
import { formatScore } from '../../attendance/gradeScores';
import { useStudentHistory } from '../hooks/useStudentHistory';
import { buildTranscript } from '../transcript';
import DocumentHeader from './DocumentHeader';
import GpaBadge from '../../attendance/components/GpaBadge';
import StudentPhoto from './StudentPhoto';
import '../../../shared/components/PrintDocument.css';
import './PrintDocuments.css';

interface TranscriptDialogProps {
  canPrint: boolean;
  onClose: () => void;
  photoUrl: string | null;
  student: Student;
}

const COLUMN_COUNT = 8;

// Expediente académico ("Total Credit Record Accumulation" de la hoja): todo el programa, clase por clase.
const TranscriptDialog = ({ canPrint, onClose, photoUrl, student }: TranscriptDialogProps) => {
  const { error, history, isLoading } = useStudentHistory(student.id);
  const { periods } = useAcademicPeriod();
  const classes = useLiveData('classes');
  const subjects = useLiveData('subjects');
  const teachers = useLiveData('teachers');

  const { sections, summary } = useMemo(
    () =>
      buildTranscript({
        classes,
        history,
        periods,
        studentId: student.id,
        subjectNames: buildNameMap(subjects),
        subjects,
        teacherNames: buildNameMap(teachers),
      }),
    [classes, history, periods, student.id, subjects, teachers],
  );

  const facts = [
    { label: 'Nombre', value: student.name },
    { label: 'Dirección', value: student.address },
    { label: 'Ciudad', value: student.city },
    { label: 'Iglesia', value: student.church },
    { label: 'Pastor', value: student.pastor },
    { label: 'Años de estudio', value: summary.studyYears },
    { label: 'Código', value: student.code },
  ];

  return (
    <Modal
      onClose={onClose}
      size="full"
      subtitle="Todas las materias del programa con sus notas."
      title="Expediente académico"
    >
      <div className="modal-body">
        {isLoading && <ListSkeleton rows={8} />}
        {error && <p className="form-alert">{error}</p>}
        {!isLoading && !error && (
          <article className="print-document transcript">
            <DocumentHeader title="Expediente académico" />
            <div className="transcript-intro">
              <dl className="transcript-facts">
                {facts.map(({ label, value }) => (
                  <div className="transcript-fact" key={label}>
                    <dt>{label}</dt>
                    <dd>{value || '—'}</dd>
                  </div>
                ))}
              </dl>
              <StudentPhoto className="transcript-photo" dataUrl={photoUrl} name={student.name} />
            </div>
            <p className="doc-officials">
              Director de educación: {INSTITUTE.principal} · Decano de educación: {INSTITUTE.dean}
            </p>
            <table className="transcript-table">
              <thead>
                <tr>
                  <th className="transcript-number" scope="col">
                    #
                  </th>
                  <th scope="col">Materia</th>
                  <th scope="col">Primer examen</th>
                  <th scope="col">Nota diaria</th>
                  <th scope="col">Segundo examen</th>
                  <th scope="col">Asistencia</th>
                  <th scope="col">Promedio</th>
                  <th scope="col">GPA</th>
                </tr>
              </thead>
              {sections.map((section) => (
                <tbody key={section.classId}>
                  <tr className="transcript-section">
                    <th colSpan={COLUMN_COUNT} scope="colgroup">
                      {section.className}
                      <span className="transcript-section-period">{section.periodName ?? 'Sin cursar'}</span>
                    </th>
                  </tr>
                  {section.rows.length === 0 && (
                    <tr>
                      <td className="transcript-empty" colSpan={COLUMN_COUNT}>
                        Esta clase no tiene materias en el catálogo.
                      </td>
                    </tr>
                  )}
                  {section.rows.map(({ number, record, semester, subjectId, subjectName }, index) => (
                    <Fragment key={subjectId}>
                      {semester !== null && semester !== section.rows[index - 1]?.semester && (
                        <tr className="transcript-semester">
                          <th colSpan={COLUMN_COUNT} scope="colgroup">
                            {SEMESTER_NAMES[semester - 1]}
                          </th>
                        </tr>
                      )}
                      <tr className={record ? undefined : 'is-pending'}>
                        <td className="transcript-number">{number}</td>
                        <td className="transcript-subject">{subjectName}</td>
                        <td>{record ? formatScore(record.scores.firstExam) : ''}</td>
                        <td>{record ? formatScore(record.result.adjustedDaily) : ''}</td>
                        <td>{record ? formatScore(record.scores.secondExam) : ''}</td>
                        <td>{record ? formatAttendanceScore(record.result.attendanceScore) : ''}</td>
                        <td className="transcript-average">{record ? formatScore(record.result.average) : ''}</td>
                        <td>
                          <GpaBadge gpa={record?.result.gpa ?? null} />
                        </td>
                      </tr>
                    </Fragment>
                  ))}
                </tbody>
              ))}
              <tfoot>
                <tr>
                  <th colSpan={6} scope="row">
                    Promedio general ({summary.gradedSubjects} materias con nota)
                  </th>
                  <td className="transcript-average">{formatScore(summary.average)}</td>
                  <td>{summary.gpa === null ? '—' : summary.gpa.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </article>
        )}
      </div>
      <footer className="modal-footer">
        <button className="btn btn-secondary" onClick={onClose} type="button">
          Cerrar
        </button>
        {canPrint && (
          <button className="btn btn-primary" disabled={isLoading} onClick={() => window.print()} type="button">
            <Printer size={18} />
            Imprimir expediente
          </button>
        )}
      </footer>
    </Modal>
  );
};

export default TranscriptDialog;
