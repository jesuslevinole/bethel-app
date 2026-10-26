import { X } from 'lucide-react';
import { useEffect, useId, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import './Modal.css';

interface ModalProps {
  children: ReactNode;
  onClose: () => void;
  size?: 'full' | 'md' | 'sm';
  subtitle?: string;
  title: string;
}

const SIZE_CLASS: Record<NonNullable<ModalProps['size']>, string> = {
  full: 'modal-full',
  md: '',
  sm: 'modal-sm',
};

// Cascarón de modal: encabezado y cierre. El contenido arma su propio
// <form className="modal-form"> con .modal-body y .modal-footer.
// No se cierra al tocar fuera para no perder lo escrito en un formulario.
// size md (formularios) ~70% de la pantalla; full casi toda; sm para confirmaciones.
const Modal = ({ children, onClose, size = 'md', subtitle, title }: ModalProps) => {
  const titleId = useId();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const modalClassName = ['modal', SIZE_CLASS[size]].filter(Boolean).join(' ');

  return createPortal(
    <div className="modal-backdrop">
      <div aria-labelledby={titleId} aria-modal="true" className={modalClassName} role="dialog">
        <header className="modal-header">
          <div>
            <h2 className="modal-title" id={titleId}>
              {title}
            </h2>
            {subtitle && <p className="modal-subtitle">{subtitle}</p>}
          </div>
          <button aria-label="Cerrar" className="btn btn-icon" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </header>
        {children}
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
