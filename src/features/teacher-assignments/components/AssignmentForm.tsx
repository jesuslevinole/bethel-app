import type { FormEvent } from 'react';
import ChipPicker from '../../../shared/components/ChipPicker';
import ClassSelect from '../../../shared/components/ClassSelect';
import DateInput from '../../../shared/components/DateInput';
import Field from '../../../shared/components/Field';
import Modal from '../../../shared/components/Modal';
import SearchSelect from '../../../shared/components/SearchSelect';
import { useAsyncAction } from '../../../shared/hooks/useAsyncAction';
import { useFormFields } from '../../../shared/hooks/useFormFields';
import type { AcademicPeriod, SchoolClass, Subject, Teacher, TeacherAssignment } from '../../../types/index';
import { getSemesterLabel } from '../../../utils/classDays';
import { getRelationName } from '../../../utils/relations';
import { useTeacherOptions } from '../hooks/useTeacherOptions';
import { resolveTeacherId, saveAssignment } from '../services/assignmentRecords';
import {
  getClassSubjects,
  getTakenSubjects,
  toAssignmentFormValues,
  validateAssignment,
  type AssignmentFormValues,
} from '../assignmentForm';
import './AssignmentForm.css';

interface AssignmentFormProps {
  assignment: TeacherAssignment | null;
  classes: SchoolClass[];
  onClose: () => void;
  period: AcademicPeriod;
  periodAssignments: TeacherAssignment[];
  subjectNames: Map<string, string>;
  subjects: Subject[];
  teacherNames: Map<string, string>;
  teachers: Teacher[];
}

const getSubjectsEmptyText = (classId: string, subjectCount: number) => {
  if (!classId) return 'Elige la clase para ver sus materias.';
  if (subjectCount === 0) return 'Esta clase no tiene materias. Agrégalas en Catálogos → Materias.';
  return 'Ninguna materia coincide.';
};

const AssignmentForm = ({
  assignment,
  classes,
  onClose,
  period,
  periodAssignments,
  subjectNames,
  subjects,
  teacherNames,
  teachers,
}: AssignmentFormProps) => {
  const { setField, values } = useFormFields<AssignmentFormValues>(toAssignmentFormValues(assignment));
  const { error, isRunning, run, setError } = useAsyncAction();
  const { options: teacherOptions, users } = useTeacherOptions(teachers);
  const classSubjects = getClassSubjects(subjects, values.classId, values.subjectIds);
  const takenSubjects = getTakenSubjects(periodAssignments, assignment?.id);

  // Al cambiar de clase se quitan las materias elegidas que son de otra clase.
  const handleClassChange = (classId: string) => {
    setField('classId', classId);
    const subjectClasses = new Map(subjects.map((subject) => [subject.id, subject.classId]));
    setField(
      'subjectIds',
      values.subjectIds.filter((subjectId) => {
        const subjectClassId = subjectClasses.get(subjectId);
        return !subjectClassId || subjectClassId === classId;
      }),
    );
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validateAssignment(values, {
      ownId: assignment?.id,
      periodAssignments,
      subjectNames,
      teacherNames,
    });
    if (validationError) {
      setError(validationError);
      return;
    }
    const saveRecord = async () => {
      const teacherId = await resolveTeacherId(values.teacherId, teachers, users);
      await saveAssignment(assignment, { ...values, periodId: assignment?.periodId ?? period.id, teacherId });
    };
    if (await run(saveRecord)) onClose();
  };

  const title = assignment ? 'Editar materias del maestro' : 'Asignar materias';

  return (
    <Modal onClose={onClose} size="full" subtitle={`Período académico ${period.name}`} title={title}>
      <form className="modal-form" noValidate onSubmit={handleSave}>
        <div className="modal-body">
          <div className="assignment-form-columns form-columns">
            <div className="form-column">
              <h3 className="form-section-title">Maestro y clase</h3>
              <Field htmlFor="assignment-teacher" label="Maestro">
                <SearchSelect
                  emptyText="Nadie coincide. Agrega el maestro en Catálogos o crea su usuario (Maestro, Director o Administración)."
                  id="assignment-teacher"
                  onChange={(teacherId) => setField('teacherId', teacherId)}
                  options={teacherOptions}
                  placeholder="Busca un maestro"
                  value={values.teacherId}
                />
              </Field>
              <Field htmlFor="assignment-class" label="Clase">
                <ClassSelect
                  classes={classes}
                  id="assignment-class"
                  onChange={handleClassChange}
                  value={values.classId}
                />
              </Field>
              <Field htmlFor="assignment-date" label="Fecha del registro">
                <DateInput id="assignment-date" onChange={(isoDate) => setField('date', isoDate)} value={values.date} />
              </Field>
              <p className="assignment-form-note">
                Un solo registro por maestro y clase, con todas las materias que dará en el período. Puede ser un
                maestro, un director o alguien de administración; un alumno no puede ser maestro. Cada materia la da un
                solo maestro por período: las que ya tienen maestro salen bloqueadas.
              </p>
            </div>
            <div className="assignment-form-subjects form-column">
              <h3 className="form-section-title">Materias</h3>
              <ChipPicker
                emptyText={getSubjectsEmptyText(values.classId, classSubjects.length)}
                itemNamePlural="materias"
                onChange={(subjectIds) => setField('subjectIds', subjectIds)}
                options={classSubjects.map((subject) => {
                  const takenBy = takenSubjects.get(subject.id);
                  return {
                    detail: takenBy
                      ? `Asignada a ${getRelationName(teacherNames, takenBy)}`
                      : getSemesterLabel(subject.semester),
                    disabled: Boolean(takenBy),
                    label: subject.name,
                    value: subject.id,
                  };
                })}
                searchPlaceholder="Buscar materia"
                selectedValues={values.subjectIds}
              />
            </div>
          </div>
          {error && <p className="form-alert">{error}</p>}
        </div>
        <footer className="modal-footer">
          <button className="btn btn-secondary" disabled={isRunning} onClick={onClose} type="button">
            Cancelar
          </button>
          <button className="btn btn-primary" disabled={isRunning} type="submit">
            {isRunning ? 'Guardando…' : 'Guardar materias'}
          </button>
        </footer>
      </form>
    </Modal>
  );
};

export default AssignmentForm;
