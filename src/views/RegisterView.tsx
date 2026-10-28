import { Navigate } from 'react-router-dom';
import BrandShell from '../components/BrandShell';
import { useAppSession } from '../features/auth/appSessionContext';
import RegisterForm from '../features/auth/components/RegisterForm';
import PortalIntro from '../features/portal/components/PortalIntro';
import { PATHS } from '../routes/paths';
import FullPageLoader from '../shared/components/FullPageLoader';

// Estudiante nuevo: crea su cuenta y sigue con su solicitud de admisión (Mi solicitud).
const RegisterView = () => {
  const { status } = useAppSession();

  if (status === 'loading') return <FullPageLoader />;
  if (status !== 'signedOut') return <Navigate replace to={PATHS.myApplication} />;

  return (
    <BrandShell>
      <PortalIntro
        text="Crea tu cuenta para llenar tu solicitud de admisión. Después la oficina la revisa y te inscribe."
        title="Soy estudiante nuevo"
      />
      <RegisterForm />
    </BrandShell>
  );
};

export default RegisterView;
