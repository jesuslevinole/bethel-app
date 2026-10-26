import type { ReactNode } from 'react';
import Crest from '../shared/components/Crest';
import './BrandShell.css';

interface BrandShellProps {
  children: ReactNode;
}

// Pantallas de entrada (portal y login): a la izquierda la identidad del instituto, a la derecha la acción.
const BrandShell = ({ children }: BrandShellProps) => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="brand-shell">
      <section className="brand-panel">
        <span aria-hidden="true" className="brand-panel-watermark">
          B
        </span>
        <div className="brand-panel-top">
          <Crest inverted size={48} />
          <span className="brand-panel-place">Instituto bíblico</span>
        </div>
        <div className="brand-panel-body">
          <h1 className="brand-wordmark">
            Bethel
            <span className="brand-wordmark-sub">Bible Institute</span>
          </h1>
          <hr className="brand-rule" />
          <p className="brand-tagline">Formación bíblica y ministerial para servir en la iglesia local.</p>
        </div>
        <span className="brand-panel-footer">Año académico {currentYear}</span>
      </section>
      <section className="brand-content">
        <div className="brand-content-inner">{children}</div>
      </section>
    </div>
  );
};

export default BrandShell;
