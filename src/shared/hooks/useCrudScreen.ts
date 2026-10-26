import { useCallback, useState } from 'react';
import type { EditorState } from '../../types/index';

// Estado común de una pantalla CRUD: qué formulario está abierto y qué registro se quiere borrar.
export const useCrudScreen = <T>() => {
  const [editor, setEditor] = useState<EditorState<T>>({ mode: 'closed' });
  const [recordToDelete, setRecordToDelete] = useState<T | null>(null);

  const openNew = useCallback(() => setEditor({ mode: 'new' }), []);
  const openEdit = useCallback((record: T) => setEditor({ mode: 'edit', record }), []);
  const closeEditor = useCallback(() => setEditor({ mode: 'closed' }), []);
  const askDelete = useCallback((record: T) => setRecordToDelete(record), []);
  const cancelDelete = useCallback(() => setRecordToDelete(null), []);

  const editingRecord = editor.mode === 'edit' ? editor.record : null;

  return { askDelete, cancelDelete, closeEditor, editingRecord, editor, openEdit, openNew, recordToDelete };
};
