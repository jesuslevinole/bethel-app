import { Eraser, PenLine } from 'lucide-react';
import { useRef, useState, type PointerEvent } from 'react';
import type { Signature } from '../../types/index';
import { formatDate, todayIso } from '../../utils/dateFormat';
import './SignaturePad.css';

interface SignaturePadProps {
  disabled?: boolean;
  label: string;
  onChange: (signature: Signature | null) => void;
  signerName: string;
  value: Signature | null;
}

// Tamaño de la imagen guardada (la pantalla la escala al ancho disponible).
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 180;
const STROKE_COLOR = '#2a1b2d';

// Firma en pantalla con el dedo, el lápiz o el mouse. Al soltar se guarda como imagen PNG.
const SignaturePad = ({ disabled = false, label, onChange, signerName, value }: SignaturePadProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  // Mientras firma, el lienzo se queda (una firma son varios trazos); la imagen guardada se ve al volver.
  const [isEditing, setIsEditing] = useState(false);
  const showSaved = Boolean(value?.image) && !isEditing;

  const toCanvasPoint = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = event.currentTarget;
    const bounds = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - bounds.left) * canvas.width) / bounds.width,
      y: ((event.clientY - bounds.top) * canvas.height) / bounds.height,
    };
  };

  const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsEditing(true);
    lastPointRef.current = toCanvasPoint(event);
  };

  const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    const lastPoint = lastPointRef.current;
    const context = event.currentTarget.getContext('2d');
    if (!lastPoint || !context) return;
    const point = toCanvasPoint(event);
    context.strokeStyle = STROKE_COLOR;
    context.lineWidth = 2.6;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.beginPath();
    context.moveTo(lastPoint.x, lastPoint.y);
    context.lineTo(point.x, point.y);
    context.stroke();
    lastPointRef.current = point;
  };

  const handlePointerUp = () => {
    if (!lastPointRef.current || !canvasRef.current) return;
    lastPointRef.current = null;
    onChange({ image: canvasRef.current.toDataURL('image/png'), signedAt: todayIso(), signerName: signerName.trim() });
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    canvas?.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
    onChange(null);
  };

  const handleSignAgain = () => {
    setIsEditing(true);
    onChange(null);
  };

  return (
    <div className="signature-pad">
      <span className="field-label">{label}</span>
      {showSaved && value ? (
        <div className="signature-pad-saved">
          <img alt={`Firma de ${value.signerName}`} className="signature-pad-image" src={value.image} />
          <span className="signature-pad-caption">
            Firmado por {value.signerName || 'el firmante'} el {formatDate(value.signedAt)}
          </span>
          {!disabled && (
            <button className="btn btn-ghost btn-compact" onClick={handleSignAgain} type="button">
              <PenLine size={16} />
              Firmar de nuevo
            </button>
          )}
        </div>
      ) : (
        <div className="signature-pad-area">
          <canvas
            aria-label={`${label}: firma aquí con el dedo o el mouse`}
            className={`signature-pad-canvas${disabled ? ' is-disabled' : ''}`}
            height={CANVAS_HEIGHT}
            onPointerCancel={handlePointerUp}
            onPointerDown={handlePointerDown}
            onPointerLeave={handlePointerUp}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            ref={canvasRef}
            width={CANVAS_WIDTH}
          />
          <div className="signature-pad-footer">
            <span className="signature-pad-caption">Firma aquí con el dedo, el lápiz o el mouse.</span>
            {!disabled && (
              <button className="btn btn-ghost btn-compact" onClick={handleClear} type="button">
                <Eraser size={16} />
                Borrar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SignaturePad;
