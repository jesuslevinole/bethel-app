import { CalendarCheck, PenLine, Table2 } from 'lucide-react';
import type { SessionMode } from '../sessionModes';

interface ModeTabsProps {
  availableModes: SessionMode[];
  mode: SessionMode;
  onChange: (mode: SessionMode) => void;
}

const MODES = [
  { icon: CalendarCheck, label: 'Clase del día', value: 'day' },
  { icon: Table2, label: 'Hoja completa', value: 'attendance' },
  { icon: PenLine, label: 'Notas de exámenes', value: 'grades' },
] as const;

// Pestañas: solo las que el rol puede ver (con una sola, no se muestran).
const ModeTabs = ({ availableModes, mode, onChange }: ModeTabsProps) => {
  const visibleModes = MODES.filter(({ value }) => availableModes.includes(value));
  if (visibleModes.length < 2) return null;

  return (
    <div aria-label="Qué quieres registrar" className="mode-tabs" role="tablist">
      {visibleModes.map(({ icon: Icon, label, value }) => (
        <button
          aria-selected={mode === value}
          className={`mode-tab${mode === value ? ' is-active' : ''}`}
          key={value}
          onClick={() => onChange(value)}
          role="tab"
          type="button"
        >
          <Icon size={17} />
          {label}
        </button>
      ))}
    </div>
  );
};

export default ModeTabs;
