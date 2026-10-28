import { Check, Printer, Undo2 } from 'lucide-react';
import { useState } from 'react';
import DateInput from '../../../shared/components/DateInput';
import Field from '../../../shared/components/Field';
import Modal from '../../../shared/components/Modal';
import { useAsyncAction } from '../../../shared/hooks/useAsyncAction';
import type { AdmissionApplication, Student } from '../../../types/index';
import { todayIso } from '../../../utils/dateFormat';
import { normalizeText } from '../../../utils/search';
import { UserFacingError } from '../../../utils/userFacingError';
import { APPLICATION_FEES, APPLICATION_STATUS_BADGES, APPLICATION_STATUS_LABELS } from '../applicationForm';
import {
  approveApplication,
  rejectApplication,
  saveOfficeReview,
  type OfficeReview,
} from '../services/applicationRecords';
import ApplicationDocument from './ApplicationDocument';
import '../../../shared/components/PrintDocument.css';

interface ApplicationReviewDialogProps {
  application: AdmissionApplication;
  canPrint: boolean;
  canReview: boolean;
  onClose: () => void;
  students: Student[];
}

type FeeKey = (typeof APPLICATION_FEES)[number]['key'];

// La oficina revisa la solicitud: anota lo recibido y aprueba (crea el alumno) o la devuelve con un motivo.
const ApplicationReviewDialog = ({
  application,
  canPrint,
  canReview,
  onClose,
  students,
}: ApplicationReviewDialogProps) => {
  const [review, setReview] = useState<OfficeReview>({
    receivedDate: application.receivedDate ?? todayIso(),
    receivedFees: application.receivedFees ?? [],
    reviewNote: application.reviewNote ?? '',
  });
  const sameNameStudent =
    students.find((student) => normalizeText(student.name) === normalizeText(application.name)) ?? null;
  const [useExistingStudent, setUseExistingStudent] = useState(Boolean(sameNameStudent));
  const { error, isRunning, run } = useAsyncAction();
  const isPending = application.status === 'pending';
  const isApproved = application.status === 'approved';

  const handleToggleFee = (feeKey: FeeKey) =>
    setReview((current) => ({
      ...current,
      receivedFees: current.receivedFees.includes(feeKey)
        ? current.receivedFees.filter((key) => key !== feeKey)
        : [...current.receivedFees, feeKey],
    }));

  const handleApprove = async () => {
    const existingStudentId = useExistingStudent && sameNameStudent ? sameNameStudent.id : null;
    const approve = async () => {
      await approveApplication(application, review, { existingStudentId, students });
    };
    if (await run(approve)) onClose();
  };

  const handleReject = async () => {
    const reject = async () => {
      if (!review.reviewNote.trim()) throw new UserFacingError('Escribe qué tiene que cambiar el estudiante.');
      await rejectApplication(application, review);
    };
    if (await run(reject)) onClose();
  };

  const handleSaveNotes = async () => {
    if (await run(() => saveOfficeReview(application, review))) onClose();
  };

  return (
    <Modal onClose={onClose} size="full" subtitle={`Solicitud de ${application.name}`} title="Revisar solicitud">
      <div className="modal-body application-review">
        <div className="application-review-document">
          <ApplicationDocument application={application} />
        </div>
        <aside className="application-review-office">
          <span className={APPLICATION_STATUS_BADGES[application.status]}>
            {APPLICATION_STATUS_LABELS[application.status]}
          </span>
          <h3 className="form-section-title">Oficina</h3>
          <Field htmlFor="review-received" label="Fecha en que se recibió">
            <DateInput
              id="review-received"
              onChange={(receivedDate) => setReview((current) => ({ ...current, receivedDate }))}
              value={review.receivedDate}
            />
          </Field>
          <div className="field">
            <span className="field-label">Gastos recibidos</span>
            {APPLICATION_FEES.map((fee) => (
              <label className="application-review-check" key={fee.key}>
                <input
                  checked={review.receivedFees.includes(fee.key)}
                  disabled={!canReview}
                  onChange={() => handleToggleFee(fee.key)}
                  type="checkbox"
                />
                {fee.label}
                {fee.amount !== null && <strong>${fee.amount}.00</strong>}
              </label>
            ))}
          </div>
          <Field hint="Si la devuelves, el estudiante ve esta nota." htmlFor="review-note" label="Nota">
            <textarea
              className="input"
              disabled={!canReview}
              id="review-note"
              onChange={(event) => setReview((current) => ({ ...current, reviewNote: event.target.value }))}
              rows={3}
              value={review.reviewNote}
            />
          </Field>
          {isPending && sameNameStudent && (
            <label className="application-review-check is-boxed">
              <input
                checked={useExistingStudent}
                onChange={(event) => setUseExistingStudent(event.target.checked)}
                type="checkbox"
              />
              Ya existe el alumno {sameNameStudent.name} ({sameNameStudent.code}). Usar ese alumno en vez de crear otro.
            </label>
          )}
          {error && <p className="form-alert">{error}</p>}
          {canReview && isPending && (
            <div className="application-review-actions">
              <button className="btn btn-primary btn-large" disabled={isRunning} onClick={handleApprove} type="button">
                <Check size={18} />
                {isRunning ? 'Guardando…' : 'Aprobar y registrar alumno'}
              </button>
              <button className="btn btn-danger-outline" disabled={isRunning} onClick={handleReject} type="button">
                <Undo2 size={18} />
                Devolver con cambios
              </button>
            </div>
          )}
          {canReview && !isPending && (
            <button className="btn btn-secondary" disabled={isRunning} onClick={handleSaveNotes} type="button">
              Guardar datos de la oficina
            </button>
          )}
          {isApproved && <p className="form-notice">Aprobada: el estudiante ya está en Alumnos.</p>}
        </aside>
      </div>
      <footer className="modal-footer">
        <button className="btn btn-secondary" onClick={onClose} type="button">
          Cerrar
        </button>
        {canPrint && (
          <button className="btn btn-primary" onClick={() => window.print()} type="button">
            <Printer size={18} />
            Imprimir para firmas
          </button>
        )}
      </footer>
    </Modal>
  );
};

export default ApplicationReviewDialog;
