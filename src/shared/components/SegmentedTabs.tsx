import type { LucideIcon } from 'lucide-react';
import './SegmentedTabs.css';

export interface SegmentedTab<Value extends string> {
  // Número pequeño al lado (pendientes, por ejemplo).
  count?: number;
  icon?: LucideIcon;
  label: string;
  value: Value;
}

interface SegmentedTabsProps<Value extends string> {
  label: string;
  onChange: (value: Value) => void;
  tabs: SegmentedTab<Value>[];
  value: Value;
}

// Pestañas grandes y claras para cambiar de sección dentro de una pantalla.
const SegmentedTabs = <Value extends string>({ label, onChange, tabs, value }: SegmentedTabsProps<Value>) => (
  <div aria-label={label} className="segmented-tabs" role="tablist">
    {tabs.map(({ count, icon: Icon, label: tabLabel, value: tabValue }) => (
      <button
        aria-selected={tabValue === value}
        className={`segmented-tab${tabValue === value ? ' is-active' : ''}`}
        key={tabValue}
        onClick={() => onChange(tabValue)}
        role="tab"
        type="button"
      >
        {Icon && <Icon size={18} />}
        {tabLabel}
        {count !== undefined && count > 0 && <span className="segmented-tab-count">{count}</span>}
      </button>
    ))}
  </div>
);

export default SegmentedTabs;
