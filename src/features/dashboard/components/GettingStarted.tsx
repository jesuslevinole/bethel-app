import { Link } from 'react-router-dom';
import { PATHS } from '../../../routes/paths';

interface GettingStartedProps {
  needsCatalogs: boolean;
}

// Primeros pasos mientras falten los catálogos o el período académico.
const GettingStarted = ({ needsCatalogs }: GettingStartedProps) => {
  const title = needsCatalogs ? 'Empieza por los catálogos' : 'Falta el período académico';
  const nextPath = needsCatalogs ? PATHS.catalogs : PATHS.academicPeriods;
  const nextLabel = needsCatalogs ? 'Ir a Catálogos' : 'Crear período académico';
  const text = needsCatalogs
    ? 'Carga las clases, materias y maestros de tu hoja de configuración. Luego crea el período académico.'
    : 'Crea el período académico (por ejemplo, julio 2026 a abril 2027) para registrar costos, materias e inscripciones.';

  return (
    <div className="getting-started">
      <div>
        <h2 className="getting-started-title">{title}</h2>
        <p className="getting-started-text">{text}</p>
      </div>
      <Link className="btn getting-started-action" to={nextPath}>
        {nextLabel}
      </Link>
    </div>
  );
};

export default GettingStarted;
