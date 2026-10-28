import { RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { useAsyncAction } from '../../../shared/hooks/useAsyncAction';
import type { AppSettings } from '../../../types/index';
import { saveColumnLabels } from '../services/appSettingsRecords';
import { TABLE_COLUMNS, TABLE_IDS, type TableId } from '../tableColumns';

interface ColumnEditorProps {
  canEdit: boolean;
  settings: AppSettings | null;
}

interface TableLabelsFormProps {
  canEdit: boolean;
  savedLabels: Record<string, string>;
  tableId: TableId;
}

// Nombres de las columnas de una tabla. Vacío = el nombre original.
const TableLabelsForm = ({ canEdit, savedLabels, tableId }: TableLabelsFormProps) => {
  const defaults: Record<string, string> = TABLE_COLUMNS[tableId].columns;
  const [labels, setLabels] = useState<Record<string, string>>(savedLabels);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const { error, isRunning, run } = useAsyncAction();
  const columnKeys = Object.keys(defaults);
  const isDirty = columnKeys.some((key) => (labels[key] ?? '').trim() !== (savedLabels[key] ?? '').trim());

  const handleChange = (columnKey: string, value: string) => {
    setLabels((current) => ({ ...current, [columnKey]: value }));
    setSavedMessage(null);
  };

  const handleSave = async () => {
    if (await run(() => saveColumnLabels(tableId, labels))) setSavedMessage('Columnas guardadas.');
  };

  const handleReset = () => {
    setLabels({});
    setSavedMessage(null);
  };

  return (
    <>
      <ul className="column-editor">
        {columnKeys.map((columnKey) => (
          <li className="column-editor-row" key={columnKey}>
            <span className="column-editor-default">{defaults[columnKey]}</span>
            <input
              aria-label={`Nuevo nombre para ${defaults[columnKey]}`}
              className="input"
              disabled={!canEdit}
              onChange={(event) => handleChange(columnKey, event.target.value)}
              placeholder={defaults[columnKey]}
              value={labels[columnKey] ?? ''}
            />
          </li>
        ))}
      </ul>
      {canEdit && (
        <footer className="customization-footer">
          {error && <p className="form-alert">{error}</p>}
          {savedMessage && <p className="form-notice">{savedMessage}</p>}
          <button className="btn btn-ghost" disabled={isRunning} onClick={handleReset} type="button">
            <RotateCcw size={17} />
            Nombres originales
          </button>
          <button className="btn btn-primary" disabled={isRunning || !isDirty} onClick={handleSave} type="button">
            {isRunning ? 'Guardando…' : 'Guardar columnas'}
          </button>
        </footer>
      )}
    </>
  );
};

// Encabezados de las tablas: se elige la tabla y se escribe el nombre nuevo de cada columna.
const ColumnEditor = ({ canEdit, settings }: ColumnEditorProps) => {
  const [tableId, setTableId] = useState<TableId>(TABLE_IDS[0]);

  return (
    <section className="customization-panel panel panel-padded">
      <header className="customization-panel-header">
        <div>
          <h2 className="panel-title">Columnas de las tablas</h2>
          <p className="customization-hint">
            Elige una tabla y escribe cómo quieres que se llame cada columna. Deja vacío para usar el nombre original.
          </p>
        </div>
        <label className="column-editor-table">
          <span className="field-label">Tabla</span>
          <select
            className="input input-select"
            onChange={(event) => setTableId(event.target.value as TableId)}
            value={tableId}
          >
            {TABLE_IDS.map((id) => (
              <option key={id} value={id}>
                {TABLE_COLUMNS[id].title}
              </option>
            ))}
          </select>
        </label>
      </header>
      <TableLabelsForm
        canEdit={canEdit}
        key={tableId}
        savedLabels={settings?.columnLabels?.[tableId] ?? {}}
        tableId={tableId}
      />
    </section>
  );
};

export default ColumnEditor;
