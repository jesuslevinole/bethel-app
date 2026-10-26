import type { PersonLinkPreview } from '../personLink';

interface PersonLinkNoticeProps {
  preview: PersonLinkPreview;
}

const RECORD_LABELS = {
  student: { existing: 'el alumno', list: 'Alumnos', new: 'como alumno nuevo' },
  teacher: { existing: 'el maestro', list: 'el catálogo de maestros', new: 'al catálogo de maestros' },
};

// Explica con qué registro quedará el usuario al guardar (según el tipo de su rol).
const PersonLinkNotice = ({ preview }: PersonLinkNoticeProps) => {
  if (preview.kind === 'staff' || !preview.name) return null;
  const labels = RECORD_LABELS[preview.kind];
  const text = preview.existingName
    ? `Se registrará con ${labels.existing} "${preview.existingName}" que ya está en ${labels.list}.`
    : `No hay nadie llamado "${preview.name}" en ${labels.list}: se agregará ${labels.new} al guardar.`;

  return <p className="form-notice">{text}</p>;
};

export default PersonLinkNotice;
