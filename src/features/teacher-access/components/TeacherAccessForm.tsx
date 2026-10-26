import { RefreshCw } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import CopyableValue from '../../../shared/components/CopyableValue';
import Field from '../../../shared/components/Field';
import Modal from '../../../shared/components/Modal';
import SearchSelect from '../../../shared/components/SearchSelect';
import { useAsyncAction } from '../../../shared/hooks/useAsyncAction';
import { useFormFields } from '../../../shared/hooks/useFormFields';
import type { Teacher } from '../../../types/index';
import { toSelectOptions } from '../../../utils/options';
import { createTeacherAccount, generateTemporaryPassword } from '../services/teacherAccounts';
import './TeacherAccess.css';

interface TeacherAccessFormProps {
  onClose: () => void;
  teachersWithoutAccess: Teacher[];
}

interface CreatedAccess {
  email: string;
  name: string;
  password: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Crea la cuenta del maestro y muestra los datos para que Administración se los entregue.
const TeacherAccessForm = ({ onClose, teachersWithoutAccess }: TeacherAccessFormProps) => {
  const { setField, values } = useFormFields({ email: '', password: generateTemporaryPassword(), teacherId: '' });
  const { error, isRunning, run, setError } = useAsyncAction();
  const [createdAccess, setCreatedAccess] = useState<CreatedAccess | null>(null);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const teacher = teachersWithoutAccess.find((candidate) => candidate.id === values.teacherId);
    if (!teacher) {
      setError('Elige el maestro.');
      return;
    }
    if (!EMAIL_PATTERN.test(values.email.trim())) {
      setError('Escribe un correo válido.');
      return;
    }
    if (values.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    const account = { email: values.email, name: teacher.name, password: values.password, teacherId: teacher.id };
    if (await run(() => createTeacherAccount(account))) {
      setCreatedAccess({ email: values.email.trim().toLowerCase(), name: teacher.name, password: values.password });
    }
  };

  if (createdAccess) {
    return (
      <Modal onClose={onClose} subtitle="Entrégale estos datos al maestro." title={`Acceso listo para ${createdAccess.name}`}>
        <div className="modal-body">
          <p className="modal-text">
            Entra desde el portal, en Maestros. Si quiere su propia contraseña, en la pantalla de entrada toca "Olvidé mi contraseña".
          </p>
          <CopyableValue label="Correo" value={createdAccess.email} />
          <CopyableValue label="Contraseña temporal" value={createdAccess.password} />
        </div>
        <footer className="modal-footer">
          <button className="btn btn-primary" onClick={onClose} type="button">
            Listo
          </button>
        </footer>
      </Modal>
    );
  }

  return (
    <Modal onClose={onClose} subtitle="El maestro podrá pasar asistencia y poner notas en sus grupos." title="Dar acceso a un maestro">
      <form className="modal-form" noValidate onSubmit={handleCreate}>
        <div className="modal-body">
          <div className="form-grid">
            <Field className="span-all" htmlFor="access-teacher" label="Maestro">
              <SearchSelect
                emptyText="Todos los maestros ya tienen acceso."
                id="access-teacher"
                onChange={(teacherId) => setField('teacherId', teacherId)}
                options={toSelectOptions(teachersWithoutAccess)}
                placeholder="Busca un maestro"
                value={values.teacherId}
              />
            </Field>
            <Field className="span-all" htmlFor="access-email" label="Correo del maestro">
              <input
                autoComplete="off"
                className="input"
                id="access-email"
                onChange={(event) => setField('email', event.target.value)}
                type="email"
                value={values.email}
              />
            </Field>
            <Field className="span-all" htmlFor="access-password" label="Contraseña temporal">
              <div className="access-password">
                <input
                  autoComplete="off"
                  className="input"
                  id="access-password"
                  onChange={(event) => setField('password', event.target.value)}
                  value={values.password}
                />
                <button
                  aria-label="Generar otra contraseña"
                  className="btn btn-icon"
                  onClick={() => setField('password', generateTemporaryPassword())}
                  title="Generar otra"
                  type="button"
                >
                  <RefreshCw size={17} />
                </button>
              </div>
            </Field>
          </div>
          {error && <p className="form-alert">{error}</p>}
        </div>
        <footer className="modal-footer">
          <button className="btn btn-secondary" disabled={isRunning} onClick={onClose} type="button">
            Cancelar
          </button>
          <button className="btn btn-primary" disabled={isRunning} type="submit">
            {isRunning ? 'Creando acceso…' : 'Crear acceso'}
          </button>
        </footer>
      </form>
    </Modal>
  );
};

export default TeacherAccessForm;
