import { Menu } from 'lucide-react';
import { useSidebar } from '../../components/layout/sidebarContext';
import './MenuButton.css';

// Único botón de menú de la app: a la izquierda de la barra superior. Solo se ve en pantallas chicas.
const MenuButton = () => {
  const { openSidebar } = useSidebar();

  return (
    <button aria-label="Abrir menú" className="btn btn-icon menu-button" onClick={openSidebar} type="button">
      <Menu size={22} />
    </button>
  );
};

export default MenuButton;
