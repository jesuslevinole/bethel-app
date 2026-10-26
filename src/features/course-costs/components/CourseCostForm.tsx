import type { FormEvent } from 'react';
import { courseCostsService } from '../../../services/courseCostsService';
import ClassSelect from '../../../shared/components/ClassSelect';
import DateInput from '../../../shared/components/DateInput';
import Field from '../../../shared/components/Field';
import Modal from '../../../shared/components/Modal';
import MoneyInput from '../../../shared/components/MoneyInput';
import { useLiveCollection } from '../../../shared/data/liveCollections';
import { useAsyncAction } from '../../../shared/hooks/useAsyncAction';
import { useFormFields } from '../../../shared/hooks/useFormFields';
import type { AcademicPeriod, CourseCost, SchoolClass } from '../../../types/index';
import {
  addCatalogBooks,
  hasOnlyBlankRows,
  toCourseCostData,
  toCourseCostFormValues,
  validateCourseCost,
  type CourseCostFormValues,
} from '../courseCostForm';
import BookListEditor from './BookListEditor';
import CostSummary from './CostSummary';
import MonthlyFeeEditor from './MonthlyFeeEditor';
import './CourseCosts.css';

interface CourseCostFormProps {
  classNames: Map<string, string>;
  classes: SchoolClass[];
  cost: CourseCost | null;
  onClose: () => void;
  period: AcademicPeriod;
  periodCosts: CourseCost[];
}

const CourseCostForm = ({ classNames, classes, cost, onClose, period, periodCosts }: CourseCostFormProps) => {
  const { setField, values } = useFormFields<CourseCostFormValues>(toCourseCostFormValues(cost, period));
  const { error, isRunning, run, setError } = useAsyncAction();
  const { data: allBooks } = useLiveCollection('books');
  const getClassBooks = (classId: string) => allBooks.filter((book) => book.classId === classId);

  // Con la lista de libros vacía, elegir la clase trae sus libros del catálogo para solo poner los precios.
  const handleClassChange = (classId: string) => {
    setField('classId', classId);
    if (hasOnlyBlankRows(values.books)) setField('books', addCatalogBooks(values.books, getClassBooks(classId)));
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validateCourseCost(values, { classNames, ownId: cost?.id, periodCosts });
    if (validationError) {
      setError(validationError);
      return;
    }
    const costData = toCourseCostData(values, cost?.periodId ?? period.id);
    const saveCost = async () => {
      if (cost) await courseCostsService.update(cost.id, costData);
      else await courseCostsService.create(costData);
    };
    if (await run(saveCost)) onClose();
  };

  const title = cost ? 'Editar costos del curso' : 'Nuevos costos del curso';

  return (
    <Modal onClose={onClose} size="full" subtitle={`Lo que paga un alumno de esta clase en ${period.name}.`} title={title}>
      <form className="modal-form" noValidate onSubmit={handleSave}>
        <div className="modal-body">
          <div className="cost-form-columns form-columns">
            <div className="form-column">
              <h3 className="form-section-title">Clase y montos</h3>
              <div className="cost-form-grid">
                <Field htmlFor="cost-class" label="Clase">
                  <ClassSelect
                    classes={classes}
                    id="cost-class"
                    onChange={handleClassChange}
                    value={values.classId}
                  />
                </Field>
                <Field htmlFor="cost-date" label="Fecha">
                  <DateInput id="cost-date" onChange={(isoDate) => setField('date', isoDate)} value={values.date} />
                </Field>
                <Field htmlFor="cost-enrollment" label="Inscripción">
                  <MoneyInput
                    id="cost-enrollment"
                    onChange={(amount) => setField('enrollmentFee', amount)}
                    value={values.enrollmentFee}
                  />
                </Field>
                <Field htmlFor="cost-graduation" label="Graduación">
                  <MoneyInput
                    id="cost-graduation"
                    onChange={(amount) => setField('graduationFee', amount)}
                    value={values.graduationFee}
                  />
                </Field>
              </div>
              <div className="form-column-panel">
                <CostSummary
                  books={values.books}
                  enrollmentFee={values.enrollmentFee}
                  graduationFee={values.graduationFee}
                  monthlyFees={values.monthlyFees}
                />
              </div>
            </div>
            <BookListEditor
              books={values.books}
              catalogBooks={getClassBooks(values.classId)}
              onChange={(books) => setField('books', books)}
            />
            <MonthlyFeeEditor
              fees={values.monthlyFees}
              onChange={(monthlyFees) => setField('monthlyFees', monthlyFees)}
            />
          </div>
          {error && <p className="form-alert">{error}</p>}
        </div>
        <footer className="modal-footer">
          <button className="btn btn-secondary" disabled={isRunning} onClick={onClose} type="button">
            Cancelar
          </button>
          <button className="btn btn-primary" disabled={isRunning} type="submit">
            {isRunning ? 'Guardando…' : 'Guardar costos'}
          </button>
        </footer>
      </form>
    </Modal>
  );
};

export default CourseCostForm;
