import { useState } from 'react';
import Field from '../../../shared/components/Field';
import Modal from '../../../shared/components/Modal';
import { useAsyncAction } from '../../../shared/hooks/useAsyncAction';
import type { EnrollmentRequest } from '../../../types/index';
import { rejectEnrollmentRequest } from '../services/enrollmentRequestRecords';

interface RejectRequestDialogProps {
  onClose: () => void;
  request: EnrollmentRequest;
}

// No aprobar una inscripción: el alumno ve el motivo en "Mi solicitud".
const RejectRequestDialog = ({ onClose, request }: RejectRequestDialogProps) => {
  const [note, setNote] = useState('');
  const { error, isRunning, run } = useAsyncAction();

  const handleReject = async () => {
    if (await run(() => rejectEnrollmentRequest(request, note))) onClose();
  };

  return (
    <Modal onClose={onClose} size="sm" title={`No aprobar la inscripción de ${request.studentName}`}>
      <div className="modal-body">
        <Field htmlFor="reject-note" label="Motivo (lo verá el alumno)">
          <textarea
            autoFocus
            className="input"
            id="reject-note"
            onChange={(event) => setNote(event.target.value)}
            placeholder="Ej.: te corresponde Segundo año; vuelve a pedirla en esa clase."
            rows={3}
            value={note}
          />
        </Field>
        {error && <p className="form-alert">{error}</p>}
      </div>
      <footer className="modal-footer">
        <button className="btn btn-secondary" disabled={isRunning} onClick={onClose} type="button">
          Cancelar
        </button>
        <button className="btn btn-danger" disabled={isRunning} onClick={handleReject} type="button">
          {isRunning ? 'Guardando…' : 'No aprobar'}
        </button>
      </footer>
    </Modal>
  );
};

export default RejectRequestDialog;
