import type { FormEvent } from 'react';
import { studentsService } from '../../../services/studentsService';
import Field from '../../../shared/components/Field';
import Modal from '../../../shared/components/Modal';
import { useAsyncAction } from '../../../shared/hooks/useAsyncAction';
import { useFormFields } from '../../../shared/hooks/useFormFields';
import type { Student } from '../../../types/index';
import { getNextStudentCode, isStudentCodeTaken } from '../../../utils/studentCode';
import { updateStudent } from '../services/studentRecords';
import { toStudentFormValues, trimStudentValues, type StudentFormValues } from '../studentForm';

interface StudentFormProps {
  onClose: () => void;
  // Recibe el id del alumno guardado (uno nuevo se abre en su ficha para subir la foto).
  onSaved: (studentId: string) => void;
  student: Student | null;
  students: Student[];
}

const StudentForm = ({ onClose, onSaved, student, students }: StudentFormProps) => {
  const { setField, values } = useFormFields<StudentFormValues>(
    toStudentFormValues(student, getNextStudentCode(students)),
  );
  const { error, isRunning, run, setError } = useAsyncAction();

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanValues = trimStudentValues(values);
    if (!cleanValues.code || !cleanValues.name) {
      setError('El código y el nombre del alumno son obligatorios.');
      return;
    }
    if (isStudentCodeTaken(students, cleanValues.code, student?.id)) {
      setError(`El código ${cleanValues.code} ya es de otro alumno.`);
      return;
    }
    let savedId = student?.id ?? '';
    const saveStudent = async () => {
      if (student) await updateStudent(student, cleanValues);
      else savedId = await studentsService.create(cleanValues);
    };
    if (await run(saveStudent)) onSaved(savedId);
  };

  const title = student ? 'Editar alumno' : 'Registrar alumno';
  const subtitle = student ? 'Datos personales y de su iglesia.' : 'Después de guardar se abre su ficha para subir la foto.';

  return (
    <Modal onClose={onClose} subtitle={subtitle} title={title}>
      <form className="modal-form" noValidate onSubmit={handleSave}>
        <div className="modal-body">
          <div className="form-grid">
            <Field hint="Se sugiere el siguiente libre." htmlFor="student-code" label="Código">
              <input
                className="input"
                id="student-code"
                onChange={(event) => setField('code', event.target.value)}
                value={values.code}
              />
            </Field>
            <Field htmlFor="student-name" label="Alumno">
              <input
                autoFocus
                className="input"
                id="student-name"
                onChange={(event) => setField('name', event.target.value)}
                placeholder="Nombre y apellido"
                value={values.name}
              />
            </Field>
            <Field className="span-all" htmlFor="student-address" label="Dirección">
              <input
                className="input"
                id="student-address"
                onChange={(event) => setField('address', event.target.value)}
                value={values.address}
              />
            </Field>
            <Field htmlFor="student-city" label="Ciudad">
              <input
                className="input"
                id="student-city"
                onChange={(event) => setField('city', event.target.value)}
                value={values.city}
              />
            </Field>
            <Field htmlFor="student-church" label="Iglesia">
              <input
                className="input"
                id="student-church"
                onChange={(event) => setField('church', event.target.value)}
                value={values.church}
              />
            </Field>
            <Field className="span-all" htmlFor="student-pastor" label="Pastor">
              <input
                className="input"
                id="student-pastor"
                onChange={(event) => setField('pastor', event.target.value)}
                value={values.pastor}
              />
            </Field>
          </div>
          {error && <p className="form-alert">{error}</p>}
        </div>
        <footer className="modal-footer">
          <button className="btn btn-secondary" disabled={isRunning} onClick={onClose} type="button">
            Cancelar
          </button>
          <button className="btn btn-primary" disabled={isRunning} type="submit">
            {isRunning ? 'Guardando…' : 'Guardar alumno'}
          </button>
        </footer>
      </form>
    </Modal>
  );
};

export default StudentForm;
