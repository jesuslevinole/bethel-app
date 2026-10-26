import type { CatalogKey } from '../../../types/index';
import { pluralize } from '../../../utils/plural';
import { CATALOG_DEFINITIONS } from '../catalogDefinitions';

interface CatalogGridProps {
  counts: Record<CatalogKey, number>;
  isLoading: boolean;
  onSelect: (catalogKey: CatalogKey) => void;
}

// Inicio de Catálogos: una tarjeta por catálogo (icono, nombre y cuántos registros tiene).
const CatalogGrid = ({ counts, isLoading, onSelect }: CatalogGridProps) => (
  <nav aria-label="Catálogos" className="catalog-grid">
    {CATALOG_DEFINITIONS.map(({ icon: Icon, key, title }) => (
      <button className="catalog-card" key={key} onClick={() => onSelect(key)} type="button">
        <span aria-hidden="true" className="catalog-card-icon">
          <Icon size={24} />
        </span>
        <span className="catalog-card-title">{title}</span>
        <span className="catalog-card-count">{isLoading ? '…' : pluralize(counts[key], 'registro', 'registros')}</span>
      </button>
    ))}
  </nav>
);

export default CatalogGrid;
