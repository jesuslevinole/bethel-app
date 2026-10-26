import { INSTITUTE } from '../../../config/institute';
import Crest from '../../../shared/components/Crest';

interface SheetHeaderProps {
  className: string;
  periodName: string;
  subjectName: string;
  teacherName: string;
}

// Encabezado de la hoja de asistencia, como el de la planilla impresa del instituto.
const SheetHeader = ({ className, periodName, subjectName, teacherName }: SheetHeaderProps) => {
  const facts = [
    { label: 'Maestro', value: teacherName },
    { label: 'Materia', value: subjectName },
    { label: 'Clase', value: className },
    { label: 'Período académico', value: periodName },
  ];

  return (
    <header className="sheet-header">
      <div className="sheet-brand">
        <Crest inverted size={46} />
        <div>
          <span className="sheet-brand-name">{INSTITUTE.name}</span>
          <span className="sheet-brand-church">{INSTITUTE.church}</span>
        </div>
        <span className="sheet-brand-title">Hoja de asistencia</span>
      </div>
      <dl className="sheet-facts">
        {facts.map(({ label, value }) => (
          <div className="sheet-fact" key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </header>
  );
};

export default SheetHeader;
