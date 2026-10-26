import { Compass } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { PATHS } from '../../routes/paths';
import EmptyState from '../../shared/components/EmptyState';
import { useVisibleNavigation } from './useVisibleNavigation';

// Pantalla de inicio preferida, en orden: Resumen (administración, dirección), Mi ficha (estudiante),
// Asistencia y notas (maestro). Si el rol no ve ninguna, la primera sección de su menú.
const HOME_PRIORITY: string[] = [PATHS.dashboard, PATHS.myProfile, PATHS.attendance];

const HomeRedirect = () => {
  const navigation = useVisibleNavigation();
  const visiblePaths = navigation.flatMap((group) => group.items.map((item) => item.path));
  const homePath = HOME_PRIORITY.find((path) => visiblePaths.includes(path)) ?? visiblePaths[0];

  if (homePath) return <Navigate replace to={homePath} />;
  return (
    <div className="view">
      <section className="panel">
        <EmptyState
          icon={Compass}
          text="Tu rol todavía no tiene ninguna sección asignada. Pide a Administración que lo ajuste en Roles."
          title="Nada que mostrar todavía"
        />
      </section>
    </div>
  );
};

export default HomeRedirect;
