import { FAILING_GPA } from '../gradeFormula';

interface GpaBadgeProps {
  gpa: string | null;
}

// GPA de una materia; F en rojo. Lo usan Notas de exámenes, la ficha, el expediente y las boletas.
const GpaBadge = ({ gpa }: GpaBadgeProps) => {
  if (!gpa) return null;
  return <span className={`gpa-badge${gpa === FAILING_GPA ? ' is-failing' : ''}`}>{gpa}</span>;
};

export default GpaBadge;
