import { Eye } from 'lucide-react';
import { useViewAs } from '../viewAsContext';
import './ViewAs.css';

// Franja visible mientras el propietario ve la app como otro rol o usuario.
const ViewAsBanner = () => {
  const { label, stopViewAs } = useViewAs();
  if (!label) return null;

  return (
    <div className="view-as-banner" role="status">
      <Eye size={18} />
      <span className="view-as-banner-text">
        Estás viendo la app como <strong>{label}</strong>. Lo que guardes se guarda de verdad.
      </span>
      <button className="btn view-as-banner-button" onClick={stopViewAs} type="button">
        Volver a mi vista
      </button>
    </div>
  );
};

export default ViewAsBanner;
