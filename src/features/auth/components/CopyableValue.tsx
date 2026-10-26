import { Check, Copy } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CopyableValueProps {
  label: string;
  value: string;
}

const COPIED_RESET_MS = 2000;

// Valor largo (como el UID) con botón para copiarlo completo.
const CopyableValue = ({ label, value }: CopyableValueProps) => {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isCopied) return undefined;
    const timerId = window.setTimeout(() => setIsCopied(false), COPIED_RESET_MS);
    return () => window.clearTimeout(timerId);
  }, [isCopied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setIsCopied(true);
    } catch (error) {
      console.error('No se pudo copiar:', error);
    }
  };

  const CopyIcon = isCopied ? Check : Copy;

  return (
    <div className="copyable-value">
      <span className="copyable-value-label">{label}</span>
      <div className="copyable-value-row">
        <code className="copyable-value-text">{value}</code>
        <button
          aria-label={`Copiar ${label}`}
          className="btn btn-icon"
          onClick={handleCopy}
          title={isCopied ? 'Copiado' : 'Copiar'}
          type="button"
        >
          <CopyIcon size={17} />
        </button>
      </div>
    </div>
  );
};

export default CopyableValue;
