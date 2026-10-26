import { useAsyncAction } from '../hooks/useAsyncAction';
import Modal from './Modal';

interface ConfirmDialogProps<T> {
  confirmLabel: string;
  description: string;
  item: T;
  onCancel: () => void;
  onConfirm: (item: T) => Promise<void>;
  title: string;
}

// Confirmación de acciones destructivas. Recibe el ítem como prop y lo pasa a onConfirm:
// nunca se lee un "ítem seleccionado" del estado que pudo cambiar antes de confirmar.
const ConfirmDialog = <T,>({ confirmLabel, description, item, onCancel, onConfirm, title }: ConfirmDialogProps<T>) => {
  const { error, isRunning, run } = useAsyncAction();

  const handleConfirm = async () => {
    const succeeded = await run(() => onConfirm(item));
    if (succeeded) onCancel();
  };

  return (
    <Modal onClose={onCancel} size="sm" title={title}>
      <div className="modal-body">
        <p className="modal-text">{description}</p>
        {error && <p className="form-alert">{error}</p>}
      </div>
      <footer className="modal-footer">
        <button className="btn btn-secondary" disabled={isRunning} onClick={onCancel} type="button">
          Cancelar
        </button>
        <button className="btn btn-danger" disabled={isRunning} onClick={handleConfirm} type="button">
          {isRunning ? 'Eliminando…' : confirmLabel}
        </button>
      </footer>
    </Modal>
  );
};

export default ConfirmDialog;
