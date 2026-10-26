import { useAsyncAction } from '../../../shared/hooks/useAsyncAction';
import type { SchoolClass, Subject } from '../../../types/index';
import { completeSubjectsFromSheet } from '../services/seedCatalogs';

interface ClassifySubjectsBannerProps {
  classes: SchoolClass[];
  pendingCount: number;
  subjects: Subject[];
}

// Materias cargadas antes de los campos Clase y Semestre: se completan con el plan de la hoja, de una vez.
const ClassifySubjectsBanner = ({ classes, pendingCount, subjects }: ClassifySubjectsBannerProps) => {
  const { error, isRunning, run } = useAsyncAction();

  const handleAssign = () => run(() => completeSubjectsFromSheet(subjects, classes));

  return (
    <div className="seed-banner">
      <div className="seed-banner-text">
        <span className="seed-banner-title">
          {pendingCount === 1 ? '1 materia sin clase o semestre' : `${pendingCount} materias sin clase o semestre`}
        </span>
        <span className="seed-banner-detail">
          Se completa lo que falta con el plan de estudios de la hoja (clase y semestre). Una clase que ya elegiste no
          se cambia. Las materias que no estén en la hoja se editan una por una.
        </span>
        {error && <span className="field-error">{error}</span>}
      </div>
      <button className="btn btn-primary" disabled={isRunning} onClick={handleAssign} type="button">
        {isRunning ? 'Completando…' : 'Completar según la hoja'}
      </button>
    </div>
  );
};

export default ClassifySubjectsBanner;
