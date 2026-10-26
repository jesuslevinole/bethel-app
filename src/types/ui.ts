// Estado del formulario de una pantalla CRUD: cerrado, creando o editando un registro.
export type EditorState<T> = { mode: 'closed' } | { mode: 'new' } | { mode: 'edit'; record: T };
