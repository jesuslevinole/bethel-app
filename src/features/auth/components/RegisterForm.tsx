import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { PATHS } from '../../../routes/paths';
import Field from '../../../shared/components/Field';
import { useAsyncAction } from '../../../shared/hooks/useAsyncAction';
import { useFormFields } from '../../../shared/hooks/useFormFields';
import { registerStudent } from '../services/authService';
import './LoginForm.css';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MINIMUM_PASSWORD = 6;

// Cuenta del estudiante nuevo. Después de crearla, llena su solicitud de admisión dentro de la app.
const RegisterForm = () => {
  const { setField, values } = useFormFields({ confirmPassword: '', email: '', name: '', password: '' });
  const { error, isRunning, run, setError } = useAsyncAction();

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!values.name.trim()) {
      setError('Escribe tu nombre completo.');
      return;
    }
    if (!EMAIL_PATTERN.test(values.email.trim())) {
      setError('Escribe un correo válido.');
      return;
    }
    if (values.password.length < MINIMUM_PASSWORD) {
      setError(`La contraseña debe tener al menos ${MINIMUM_PASSWORD} caracteres.`);
      return;
    }
    if (values.password !== values.confirmPassword) {
      setError('Las dos contraseñas no son iguales.');
      return;
    }
    await run(
      () => registerStudent(values.name, values.email, values.password),
      'No se pudo crear la cuenta. Intenta de nuevo.',
    );
  };

  return (
    <form className="login-form" noValidate onSubmit={handleRegister}>
      <Field htmlFor="register-name" label="Nombre completo">
        <input
          autoComplete="name"
          autoFocus
          className="input"
          id="register-name"
          onChange={(event) => setField('name', event.target.value)}
          value={values.name}
        />
      </Field>
      <Field htmlFor="register-email" label="Correo">
        <input
          autoComplete="email"
          className="input"
          id="register-email"
          onChange={(event) => setField('email', event.target.value)}
          type="email"
          value={values.email}
        />
      </Field>
      <Field hint={`Al menos ${MINIMUM_PASSWORD} caracteres.`} htmlFor="register-password" label="Contraseña">
        <input
          autoComplete="new-password"
          className="input"
          id="register-password"
          onChange={(event) => setField('password', event.target.value)}
          type="password"
          value={values.password}
        />
      </Field>
      <Field htmlFor="register-confirm" label="Repite la contraseña">
        <input
          autoComplete="new-password"
          className="input"
          id="register-confirm"
          onChange={(event) => setField('confirmPassword', event.target.value)}
          type="password"
          value={values.confirmPassword}
        />
      </Field>
      {error && <p className="form-alert">{error}</p>}
      <button className="btn btn-primary login-submit" disabled={isRunning} type="submit">
        {isRunning ? 'Creando tu cuenta…' : 'Crear mi cuenta'}
      </button>
      <div className="login-links">
        <Link className="login-back" to={PATHS.login}>
          Ya tengo cuenta: entrar
        </Link>
      </div>
    </form>
  );
};

export default RegisterForm;
