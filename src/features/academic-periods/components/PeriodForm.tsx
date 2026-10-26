import type { FormEvent } from 'react';
import { academicPeriodsService } from '../../../services/academicPeriodsService';
import DateInput from '../../../shared/components/DateInput';
import Field from '../../../shared/components/Field';
import Modal from '../../../shared/components/Modal';
import { useAsyncAction } from '../../../shared/hooks/useAsyncAction';
import { useFormFields } from '../../../shared/hooks/useFormFields';
import './PeriodForm.css';
import type { AcademicPeriod, AcademicSemester } from '../../../types/index';
import { INSTITUTE } from '../../../config/institute';
import { listClassDates, SEMESTER_NAMES } from '../../../utils/classDays';
import {
  getPeriodName,
  getSemesters,
  toPeriodData,
  toPeriodFormValues,
  validatePeriod,
  type PeriodFormValues,
} from '../periodForm';

interface PeriodFormProps {
  onClose: () => void;
  onSaved: (periodId: string) => void;
  period: AcademicPeriod | null;
  periods: AcademicPeriod[];
}

const PeriodForm = ({ onClose, onSaved, period, periods }: PeriodFormProps) => {
  const { setField, values } = useFormFields<PeriodFormValues>(toPeriodFormValues(period));
  const { error, isRunning, run, setError } = useAsyncAction();

  const handleNameChange = (name: string) => {
    setField('customName', name);
    setField('isNameEdited', true);
  };

  const semesters = getSemesters(values);
  // Mientras se sugieren, los campos se vuelven a montar cuando cambia la sugerencia (DateInput guarda su texto).
  const semesterKey = values.isSemestersEdited ? 'edited' : semesters.map((semester) => semester.startDate + semester.endDate).join('|');
  const classCount =
    values.startDate && values.endDate && values.endDate > values.startDate
      ? listClassDates({ endDate: values.endDate, id: '', name: '', semesters, startDate: values.startDate }).length
      : 0;

  const handleSemesterChange = (index: number, field: keyof AcademicSemester, isoDate: string) => {
    const nextSemesters = semesters.map((semester, semesterIndex) =>
      semesterIndex === index ? { ...semester, [field]: isoDate } : semester,
    );
    setField('customSemesters', nextSemesters);
    setField('isSemestersEdited', true);
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validatePeriod(values, periods, period?.id);
    if (validationError) {
      setError(validationError);
      return;
    }
    const periodData = toPeriodData(values);
    let savedId = period?.id ?? '';
    const savePeriod = async () => {
      if (period) await academicPeriodsService.update(period.id, periodData);
      else savedId = await academicPeriodsService.create(periodData);
    };
    if (await run(savePeriod)) onSaved(savedId);
  };

  const title = period ? 'Editar período académico' : 'Nuevo período académico';

  return (
    <Modal onClose={onClose} subtitle="Por ejemplo, de julio de 2026 a abril de 2027." title={title}>
      <form className="modal-form" noValidate onSubmit={handleSave}>
        <div className="modal-body">
          <div className="form-grid">
            <Field htmlFor="period-start" label="Inicio">
              <DateInput id="period-start" onChange={(isoDate) => setField('startDate', isoDate)} value={values.startDate} />
            </Field>
            <Field htmlFor="period-end" label="Fin">
              <DateInput id="period-end" onChange={(isoDate) => setField('endDate', isoDate)} value={values.endDate} />
            </Field>
            {semesters.map((semester, index) => (
              <fieldset className="period-semester" key={`${semesterKey}-${index}`}>
                <legend className="period-semester-title">{SEMESTER_NAMES[index]}</legend>
                <Field htmlFor={`semester-${index}-start`} label="Inicio">
                  <DateInput
                    id={`semester-${index}-start`}
                    onChange={(isoDate) => handleSemesterChange(index, 'startDate', isoDate)}
                    value={semester.startDate}
                  />
                </Field>
                <Field htmlFor={`semester-${index}-end`} label="Fin">
                  <DateInput
                    id={`semester-${index}-end`}
                    onChange={(isoDate) => handleSemesterChange(index, 'endDate', isoDate)}
                    value={semester.endDate}
                  />
                </Field>
              </fieldset>
            ))}
            <p className="period-semester-hint span-all">
              {values.isSemestersEdited
                ? `Las clases son los ${INSTITUTE.classWeekdayName} dentro de cada semestre.`
                : 'Los semestres se sugieren partiendo el período a la mitad; ajústalos si hace falta.'}
              {classCount > 0 && ` Son ${classCount} clases (${INSTITUTE.classWeekdayName}).`}
            </p>
            <Field className="span-all" hint="Se llena solo con las fechas; puedes cambiarlo." htmlFor="period-name" label="Nombre">
              <input
                className="input"
                id="period-name"
                onChange={(event) => handleNameChange(event.target.value)}
                placeholder="Julio 2026 – Abril 2027"
                value={getPeriodName(values)}
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
            {isRunning ? 'Guardando…' : 'Guardar período'}
          </button>
        </footer>
      </form>
    </Modal>
  );
};

export default PeriodForm;
