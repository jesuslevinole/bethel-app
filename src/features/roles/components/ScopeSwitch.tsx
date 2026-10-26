import type { ViewScope } from '../../../types/index';
import { SCOPE_LABELS } from '../permissionModules';

interface ScopeSwitchProps {
  disabled: boolean;
  label: string;
  onChange: (scope: ViewScope) => void;
  scopes: ViewScope[];
  value: ViewScope;
}

// Ninguno / Propios / Todos para "ver" un módulo.
const ScopeSwitch = ({ disabled, label, onChange, scopes, value }: ScopeSwitchProps) => (
  <div aria-label={`Ver ${label}`} className="scope-switch" role="radiogroup">
    {scopes.map((scope) => (
      <button
        aria-checked={scope === value}
        className={`is-${scope} scope-option${scope === value ? ' is-selected' : ''}`}
        disabled={disabled}
        key={scope}
        onClick={() => onChange(scope)}
        role="radio"
        type="button"
      >
        {SCOPE_LABELS[scope]}
      </button>
    ))}
  </div>
);

export default ScopeSwitch;
