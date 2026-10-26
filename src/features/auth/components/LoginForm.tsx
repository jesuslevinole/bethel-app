import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { PATHS } from '../../../routes/paths';
import Field from '../../../shared/components/Field';
import { useAsyncAction } from '../../../shared/hooks/useAsyncAction';
import { useFormFields } from '../../../shared/hooks/useFormFields';
import { sendUserPasswordReset, signInUser } from '../services/authService';
import './LoginForm.css';

const LoginForm = () => {
  const { setField, values } = useFormFields({ email: '', password: '' });
  const { error, isRunning, run, setError } = useAsyncAction();
  const [notice, setNotice] = useState<string | null>(null);

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(null);
    await run(() => signInUser(values.email, values.password), 'No se pudo entrar. Revisa tus datos.');
  };

  const handleResetPassword = async () => {
    setNotice(null);
    if (!values.email.trim()) {
      setError('Escribe tu correo y vuelve a tocar "Olvidé mi contraseña".');
      return;
    }
    const succeeded = await run(() => sendUserPasswordReset(values.email));
    if (succeeded) setNotice(`Te enviamos un correo a ${values.email.trim()} para crear una contraseña nueva.`);
  };

  return (
    <form className="login-form" noValidate onSubmit={handleSignIn}>
      <Field htmlFor="login-email" label="Correo">
        <input
          autoComplete="email"
          autoFocus
          className="input"
          id="login-email"
          onChange={(event) => setField('email', event.target.value)}
          type="email"
          value={values.email}
        />
      </Field>
      <Field htmlFor="login-password" label="Contraseña">
        <input
          autoComplete="current-password"
          className="input"
          id="login-password"
          onChange={(event) => setField('password', event.target.value)}
          type="password"
          value={values.password}
        />
      </Field>
      {error && <p className="form-alert">{error}</p>}
      {notice && <p className="form-notice">{notice}</p>}
      <button className="btn btn-primary login-submit" disabled={isRunning} type="submit">
        {isRunning ? 'Entrando…' : 'Entrar'}
      </button>
      <div className="login-links">
        <Link className="login-back" to={PATHS.portal}>
          Volver al portal
        </Link>
        <button className="btn btn-ghost" disabled={isRunning} onClick={handleResetPassword} type="button">
          Olvidé mi contraseña
        </button>
      </div>
    </form>
  );
};

export default LoginForm;
