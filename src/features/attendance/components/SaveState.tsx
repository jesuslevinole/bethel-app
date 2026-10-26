interface SaveStateProps {
  canSave: boolean;
  isDirty: boolean;
  // Texto propio para "hay cambios" (p. ej. en varios días).
  message?: string;
  wasSaved: boolean;
}

// Texto bajo el botón Guardar: si hay cambios pendientes, si ya se guardó o si el rol solo puede ver.
const SaveState = ({ canSave, isDirty, message, wasSaved }: SaveStateProps) => {
  if (!canSave) return <p className="save-state">Solo lectura: tu rol no puede guardar esta planilla.</p>;
  if (isDirty) return <p className="is-dirty save-state">{message ?? 'Hay cambios sin guardar'}</p>;
  if (wasSaved) return <p className="is-saved save-state">Guardado</p>;
  return <p className="save-state">Sin cambios</p>;
};

export default SaveState;
