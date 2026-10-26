import { useAsyncAction } from '../../../shared/hooks/useAsyncAction';
import type { CatalogKey, SchoolClass } from '../../../types/index';
import { CATALOG_DEFINITIONS } from '../catalogDefinitions';
import { seedEmptyCatalogs } from '../services/seedCatalogs';

interface SeedCatalogsBannerProps {
  classes: SchoolClass[];
  emptyKeys: CatalogKey[];
}

const SeedCatalogsBanner = ({ classes, emptyKeys }: SeedCatalogsBannerProps) => {
  const { error, isRunning, run } = useAsyncAction();

  const emptyTitles = CATALOG_DEFINITIONS.filter((definition) => emptyKeys.includes(definition.key))
    .map((definition) => definition.title.toLowerCase())
    .join(', ');

  const handleSeed = () => run(() => seedEmptyCatalogs(emptyKeys, classes));

  return (
    <div className="seed-banner">
      <div className="seed-banner-text">
        <span className="seed-banner-title">Carga los datos de tu hoja de configuración</span>
        <span className="seed-banner-detail">
          Se llenarán solo los catálogos vacíos: {emptyTitles}. Después puedes editarlos uno por uno.
        </span>
        {error && <span className="field-error">{error}</span>}
      </div>
      <button className="btn btn-primary" disabled={isRunning} onClick={handleSeed} type="button">
        {isRunning ? 'Cargando…' : 'Cargar datos iniciales'}
      </button>
    </div>
  );
};

export default SeedCatalogsBanner;
