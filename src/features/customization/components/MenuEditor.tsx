import { ArrowDown, ArrowUp, FolderPlus, GripVertical, RotateCcw, Trash2 } from 'lucide-react';
import { useState, type DragEvent } from 'react';
import { NAVIGATION_ITEMS } from '../../../components/layout/navigation';
import { useAsyncAction } from '../../../shared/hooks/useAsyncAction';
import type { AppSettings } from '../../../types/index';
import {
  createGroupRow,
  moveRow,
  removeGroupRow,
  setRowParent,
  toMenuRows,
  toNavigationSettings,
  type MenuRow,
} from '../menuDraft';
import { resetNavigationSettings, saveNavigationSettings } from '../services/appSettingsRecords';

interface MenuEditorProps {
  canEdit: boolean;
  settings: AppSettings | null;
}

const ICONS = new Map(NAVIGATION_ITEMS.map((item) => [item.path, item.icon]));

// Editor del menú lateral: nombre de cada opción, orden (arrastrando o con flechas) y listas desplegables.
// Cada persona sigue viendo solo lo que su rol permite.
const MenuEditor = ({ canEdit, settings }: MenuEditorProps) => {
  const [rows, setRows] = useState<MenuRow[]>(() => toMenuRows(settings));
  const [isDirty, setIsDirty] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const { error, isRunning, run } = useAsyncAction();
  const groupRows = rows.filter((row) => row.kind === 'group');

  const editRows = (nextRows: MenuRow[]) => {
    setRows(nextRows);
    setIsDirty(true);
    setSavedMessage(null);
  };

  const handleRename = (key: string, label: string) =>
    editRows(rows.map((row) => (row.key === key ? { ...row, label } : row)));

  const handleParentChange = (key: string, parent: string) => editRows(setRowParent(rows, key, parent));

  const handleMove = (index: number, offset: number) => editRows(moveRow(rows, index, index + offset));

  const handleAddGroup = () => editRows([createGroupRow(), ...rows]);

  const handleRemoveGroup = (key: string) => editRows(removeGroupRow(rows, key));

  const handleDragStart = (event: DragEvent<HTMLLIElement>, index: number) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(index));
    setDragIndex(index);
  };

  const handleDragOver = (event: DragEvent<HTMLLIElement>, index: number) => {
    event.preventDefault();
    if (dropIndex !== index) setDropIndex(index);
  };

  const handleDrop = (event: DragEvent<HTMLLIElement>, index: number) => {
    event.preventDefault();
    const fromIndex = dragIndex ?? Number(event.dataTransfer.getData('text/plain'));
    if (!Number.isNaN(fromIndex)) editRows(moveRow(rows, fromIndex, index));
    setDragIndex(null);
    setDropIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDropIndex(null);
  };

  const handleSave = async () => {
    if (await run(() => saveNavigationSettings(toNavigationSettings(rows)))) {
      setIsDirty(false);
      setSavedMessage('Menú guardado. Ya se ve así para todos.');
    }
  };

  const handleReset = async () => {
    if (await run(resetNavigationSettings)) {
      setRows(toMenuRows(null));
      setIsDirty(false);
      setSavedMessage('Volvió el menú original.');
    }
  };

  return (
    <section className="customization-panel panel panel-padded">
      <header className="customization-panel-header">
        <div>
          <h2 className="panel-title">Menú lateral</h2>
          <p className="customization-hint">
            Cambia el nombre de cada opción, ordénalas arrastrando o con las flechas, y agrúpalas en listas
            desplegables. Cada persona ve solo lo que su rol le permite.
          </p>
        </div>
        {canEdit && (
          <button className="btn btn-secondary" disabled={isRunning} onClick={handleAddGroup} type="button">
            <FolderPlus size={18} />
            Crear lista desplegable
          </button>
        )}
      </header>
      <ol className="menu-editor">
        {rows.map((row, index) => {
          const Icon = ICONS.get(row.key);
          const isGroup = row.kind === 'group';
          const rowClassName = [
            'menu-editor-row',
            isGroup ? 'is-group' : '',
            row.parent ? 'is-nested' : '',
            dragIndex === index ? 'is-dragging' : '',
            dropIndex === index && dragIndex !== index ? 'is-drop-target' : '',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <li
              className={rowClassName}
              draggable={canEdit}
              key={row.key}
              onDragEnd={handleDragEnd}
              onDragOver={(event) => handleDragOver(event, index)}
              onDragStart={(event) => handleDragStart(event, index)}
              onDrop={(event) => handleDrop(event, index)}
            >
              {canEdit && <GripVertical aria-hidden="true" className="menu-editor-grip" size={18} />}
              <span aria-hidden="true" className="menu-editor-icon">
                {Icon ? <Icon size={18} /> : <FolderPlus size={18} />}
              </span>
              <span className="menu-editor-name">
                <input
                  aria-label={isGroup ? 'Nombre de la lista' : `Nombre de ${row.defaultLabel}`}
                  className="input"
                  disabled={!canEdit}
                  onChange={(event) => handleRename(row.key, event.target.value)}
                  value={row.label}
                />
                {!isGroup && row.label.trim() !== row.defaultLabel && (
                  <span className="menu-editor-default">Original: {row.defaultLabel}</span>
                )}
                {isGroup && <span className="menu-editor-default">Lista desplegable</span>}
              </span>
              {isGroup ? (
                <span className="menu-editor-place" />
              ) : (
                <select
                  aria-label={`Dónde va ${row.label}`}
                  className="input input-select menu-editor-place"
                  disabled={!canEdit}
                  onChange={(event) => handleParentChange(row.key, event.target.value)}
                  value={row.parent}
                >
                  <option value="">Menú principal</option>
                  {groupRows.map((group) => (
                    <option key={group.key} value={group.key}>
                      Dentro de {group.label.trim() || 'la lista'}
                    </option>
                  ))}
                </select>
              )}
              {canEdit && (
                <span className="menu-editor-actions">
                  <button
                    aria-label="Subir"
                    className="btn btn-icon"
                    disabled={index === 0}
                    onClick={() => handleMove(index, -1)}
                    type="button"
                  >
                    <ArrowUp size={17} />
                  </button>
                  <button
                    aria-label="Bajar"
                    className="btn btn-icon"
                    disabled={index === rows.length - 1}
                    onClick={() => handleMove(index, 1)}
                    type="button"
                  >
                    <ArrowDown size={17} />
                  </button>
                  {isGroup && (
                    <button
                      aria-label={`Borrar la lista ${row.label}`}
                      className="btn btn-icon is-danger"
                      onClick={() => handleRemoveGroup(row.key)}
                      title="Borrar la lista (sus opciones vuelven al menú principal)"
                      type="button"
                    >
                      <Trash2 size={17} />
                    </button>
                  )}
                </span>
              )}
            </li>
          );
        })}
      </ol>
      {canEdit && (
        <footer className="customization-footer">
          {error && <p className="form-alert">{error}</p>}
          {savedMessage && <p className="form-notice">{savedMessage}</p>}
          {isDirty && !savedMessage && <span className="customization-pending">Hay cambios sin guardar</span>}
          <button className="btn btn-ghost" disabled={isRunning} onClick={handleReset} type="button">
            <RotateCcw size={17} />
            Volver al menú original
          </button>
          <button className="btn btn-primary" disabled={isRunning || !isDirty} onClick={handleSave} type="button">
            {isRunning ? 'Guardando…' : 'Guardar menú'}
          </button>
        </footer>
      )}
    </section>
  );
};

export default MenuEditor;
