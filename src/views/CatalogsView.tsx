import { ArrowLeft } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { usePermissions } from '../features/auth/hooks/usePermissions';
import { CATALOG_DEFINITIONS } from '../features/catalogs/catalogDefinitions';
import CatalogGrid from '../features/catalogs/components/CatalogGrid';
import CatalogPanel from '../features/catalogs/components/CatalogPanel';
import ClassifySubjectsBanner from '../features/catalogs/components/ClassifySubjectsBanner';
import SeedCatalogsBanner from '../features/catalogs/components/SeedCatalogsBanner';
import { useCatalogCollections } from '../features/catalogs/hooks/useCatalogCollections';
import { getSubjectsToComplete } from '../features/catalogs/services/seedCatalogs';
import { CATALOG_QUERY_PARAM } from '../routes/paths';
import ViewHeader from '../shared/components/ViewHeader';
import { useLiveCollection } from '../shared/data/liveCollections';
import type { CatalogKey } from '../types/index';
import '../features/catalogs/components/Catalogs.css';

// Inicio con tarjetas; el catálogo abierto va en la URL (?catalogo=) para que "atrás" del navegador funcione.
const CatalogsView = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const catalogs = useCatalogCollections();
  const permissions = usePermissions();
  const { data: classes } = useLiveCollection('classes');
  const { data: subjects } = useLiveCollection('subjects');

  const catalogEntries = Object.entries(catalogs) as [CatalogKey, (typeof catalogs)[CatalogKey]][];
  const counts = Object.fromEntries(catalogEntries.map(([key, state]) => [key, state.data.length])) as Record<
    CatalogKey,
    number
  >;
  const isLoading = catalogEntries.some(([, state]) => state.isLoading);
  const emptyKeys = catalogEntries
    .filter(([, state]) => !state.isLoading && !state.error && state.data.length === 0)
    .map(([key]) => key);
  const pendingSubjectCount = getSubjectsToComplete(subjects, classes).length;

  const selectedKey = searchParams.get(CATALOG_QUERY_PARAM);
  const selectedDefinition = CATALOG_DEFINITIONS.find((definition) => definition.key === selectedKey) ?? null;

  const openCatalog = (catalogKey: CatalogKey) => setSearchParams({ [CATALOG_QUERY_PARAM]: catalogKey });
  const closeCatalog = () => setSearchParams({});

  return (
    <div className="view">
      <ViewHeader subtitle="Listas que usa el resto de la app." title="Catálogos" />
      {emptyKeys.length > 0 && permissions.can('catalogs', 'create') && (
        <SeedCatalogsBanner classes={classes} emptyKeys={emptyKeys} />
      )}
      {pendingSubjectCount > 0 && permissions.can('catalogs', 'edit') && (
        <ClassifySubjectsBanner classes={classes} pendingCount={pendingSubjectCount} subjects={subjects} />
      )}
      {selectedDefinition ? (
        <>
          <button className="btn btn-ghost catalog-back" onClick={closeCatalog} type="button">
            <ArrowLeft size={18} />
            Todos los catálogos
          </button>
          <CatalogPanel
            definition={selectedDefinition}
            isLoading={catalogs[selectedDefinition.key].isLoading}
            items={catalogs[selectedDefinition.key].data}
            key={selectedDefinition.key}
          />
        </>
      ) : (
        <CatalogGrid counts={counts} isLoading={isLoading} onSelect={openCatalog} />
      )}
    </div>
  );
};

export default CatalogsView;
