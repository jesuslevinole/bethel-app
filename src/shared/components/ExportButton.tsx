import { FileSpreadsheet } from 'lucide-react';
import { useAsyncAction } from '../hooks/useAsyncAction';

interface ExportButtonProps {
  disabled?: boolean;
  onExport: () => Promise<void>;
}

// Botón "Exportar Excel" de las listas. Quien lo muestre revisa antes el permiso "export" del módulo.
const ExportButton = ({ disabled = false, onExport }: ExportButtonProps) => {
  const { error, isRunning, run } = useAsyncAction();

  return (
    <button
      className="btn btn-secondary"
      disabled={disabled || isRunning}
      onClick={() => void run(onExport)}
      title={error ?? 'Descargar en Excel'}
      type="button"
    >
      <FileSpreadsheet size={17} />
      {isRunning ? 'Exportando…' : error ? 'Reintentar exportar' : 'Exportar Excel'}
    </button>
  );
};

export default ExportButton;
