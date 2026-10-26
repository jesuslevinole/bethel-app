import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import './Popover.css';

interface PopoverProps {
  // Contenido del panel; recibe close para cerrarlo al elegir algo.
  children: (close: () => void) => ReactNode;
  label: string;
  onOpen?: () => void;
  panelClassName?: string;
  trigger: ReactNode;
  triggerClassName: string;
}

// Botón que abre un panel flotante (alineado a la derecha). Se cierra con Escape o al tocar fuera.
const Popover = ({ children, label, onOpen, panelClassName = '', trigger, triggerClassName }: PopoverProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!isOpen) return undefined;
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (!isOpen) onOpen?.();
    setIsOpen(!isOpen);
  };

  return (
    <div className="popover" ref={rootRef}>
      <button
        aria-controls={panelId}
        aria-expanded={isOpen}
        aria-label={label}
        className={triggerClassName}
        onClick={handleToggle}
        title={label}
        type="button"
      >
        {trigger}
      </button>
      {isOpen && (
        <div aria-label={label} className={`popover-panel ${panelClassName}`.trim()} id={panelId} role="dialog">
          {children(() => setIsOpen(false))}
        </div>
      )}
    </div>
  );
};

export default Popover;
