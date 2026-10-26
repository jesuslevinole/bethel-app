import { Navigate } from 'react-router-dom';
import BrandShell from '../components/BrandShell';
import { useAppSession } from '../features/auth/appSessionContext';
import LoginForm from '../features/auth/components/LoginForm';
import PortalIntro from '../features/portal/components/PortalIntro';
import { PATHS } from '../routes/paths';
import FullPageLoader from '../shared/components/FullPageLoader';

const LoginView = () => {
  const { status } = useAppSession();

  if (status === 'loading') return <FullPageLoader />;
  if (status !== 'signedOut') return <Navigate replace to={PATHS.app} />;

  return (
    <BrandShell>
      <PortalIntro text="Usa el correo y la contraseña que te dio el instituto." title="Entrar" />
      <LoginForm />
    </BrandShell>
  );
};

export default LoginView;
