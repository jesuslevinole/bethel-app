import type { CatalogKey } from '../../../types/index';
import { CATALOG_DEFINITIONS, type CatalogDefinition } from '../catalogDefinitions';

interface CatalogNavProps {
  counts: Record<CatalogKey, number>;
  onSelect: (catalogKey: CatalogKey) => void;
  selectedKey: CatalogKey;
}

const GROUPS: CatalogDefinition['group'][] = ['Académicos', 'Finanzas'];

const CatalogNav = ({ counts, onSelect, selectedKey }: CatalogNavProps) => (
  <nav aria-label="Catálogos" className="catalog-nav panel">
    {GROUPS.map((group) => (
      <div className="catalog-nav-group" key={group}>
        <h2 className="catalog-nav-title">{group}</h2>
        {CATALOG_DEFINITIONS.filter((definition) => definition.group === group).map(({ icon: Icon, key, title }) => (
          <button
            aria-current={key === selectedKey}
            className={`catalog-nav-item${key === selectedKey ? ' is-active' : ''}`}
            key={key}
            onClick={() => onSelect(key)}
            type="button"
          >
            <Icon size={18} />
            <span className="catalog-nav-label">{title}</span>
            <span className="catalog-nav-count">{counts[key]}</span>
          </button>
        ))}
      </div>
    ))}
  </nav>
);

export default CatalogNav;
