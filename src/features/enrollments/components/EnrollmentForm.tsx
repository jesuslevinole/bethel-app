import type { FormEvent } from 'react';
import ClassSelect from '../../../shared/components/ClassSelect';
import DateInput from '../../../shared/components/DateInput';
import Field from '../../../shared/components/Field';
import Modal from '../../../shared/components/Modal';
import SearchSelect from '../../../shared/components/SearchSelect';
import { useAsyncAction } from '../../../shared/hooks/useAsyncAction';
import { useFormFields } from '../../../shared/hooks/useFormFields';
import type { AcademicPeriod, Enrollment, SchoolClass, SelectOption, Student } from '../../../types/index';
import { saveEnrollment } from '../services/enrollmentRecords';
import { toEnrollmentFormValues, validateEnrollment, type EnrollmentFormValues } from '../enrollmentForm';

interface EnrollmentFormProps {
  classNames: Map<string, string>;
  classes: SchoolClass[];
  enrollment: Enrollment | null;
  onClose: () => void;
  period: AcademicPeriod;
  periodEnrollments: Enrollment[];
  students: Student[];
}

const EnrollmentForm = ({
  classNames,
  classes,
  enrollment,
  onClose,
  period,
  periodEnrollments,
  students,
}: EnrollmentFormProps) => {
  const { setField, values } = useFormFields<EnrollmentFormValues>(toEnrollmentFormValues(enrollment));
  const { error, isRunning, run, setError } = useAsyncAction();

  const studentOptions: SelectOption[] = students.map((student) => ({
    detail: [student.code, student.church].filter(Boolean).join(', '),
    label: student.name,
    value: student.id,
  }));
  const selectedStudentCode = students.find((student) => student.id === values.studentId)?.code ?? '';

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validateEnrollment(values, periodEnrollments, classNames, enrollment?.id);
    if (validationError) {
      setError(validationError);
      return;
    }
    const enrollmentData = { ...values, periodId: enrollment?.periodId ?? period.id };
    if (await run(() => saveEnrollment(enrollment, enrollmentData))) onClose();
  };

  const title = enrollment ? 'Editar inscripción' : 'Inscripciones';

  return (
    <Modal onClose={onClose} subtitle={`Período académico ${period.name}`} title={title}>
      <form className="modal-form" noValidate onSubmit={handleSave}>
        <div className="modal-body">
          <div className="form-grid">
            <Field className="span-all" htmlFor="enrollment-student" label="Alumno">
              <SearchSelect
                emptyText="Ningún alumno coincide. Regístralo primero en Alumnos."
                id="enrollment-student"
                onChange={(studentId) => setField('studentId', studentId)}
                options={studentOptions}
                placeholder="Busca por nombre o código"
                value={values.studentId}
              />
            </Field>
            <Field htmlFor="enrollment-student-code" label="ID alumno">
              <input
                className="input"
                id="enrollment-student-code"
                placeholder="Se llena al elegir alumno"
                readOnly
                value={selectedStudentCode}
              />
            </Field>
            <Field htmlFor="enrollment-date" label="Fecha de inscripción">
              <DateInput id="enrollment-date" onChange={(isoDate) => setField('date', isoDate)} value={values.date} />
            </Field>
            <Field className="span-all" htmlFor="enrollment-class" label="Clase">
              <ClassSelect
                classes={classes}
                id="enrollment-class"
                onChange={(classId) => setField('classId', classId)}
                value={values.classId}
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
            {isRunning ? 'Guardando…' : 'Guardar inscripción'}
          </button>
        </footer>
      </form>
    </Modal>
  );
};

export default EnrollmentForm;
