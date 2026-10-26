import { GraduationCap, Presentation, ShieldCheck } from 'lucide-react';
import BrandShell from '../components/BrandShell';
import { useAppSession } from '../features/auth/appSessionContext';
import PortalIntro from '../features/portal/components/PortalIntro';
import PortalOption from '../features/portal/components/PortalOption';
import { PATHS } from '../routes/paths';

// Las tres puertas llevan al mismo login: lo que cada quien ve adentro lo decide su rol.
const PortalView = () => {
  const { status } = useAppSession();
  const entryPath = status === 'signedOut' ? PATHS.login : PATHS.app;

  return (
    <BrandShell>
      <PortalIntro text="Elige cómo quieres entrar." title="Bienvenido" />
      <ul className="portal-options">
        <li>
          <PortalOption
            description="Alumnos, inscripciones, costos, períodos y usuarios."
            icon={ShieldCheck}
            title="Administración"
            to={entryPath}
          />
        </li>
        <li>
          <PortalOption description="Asistencia y notas de tus clases." icon={Presentation} title="Maestros" to={entryPath} />
        </li>
        <li>
          <PortalOption description="Tu ficha, tu inscripción y tu carnet." icon={GraduationCap} title="Estudiantes" to={entryPath} />
        </li>
      </ul>
    </BrandShell>
  );
};

export default PortalView;
