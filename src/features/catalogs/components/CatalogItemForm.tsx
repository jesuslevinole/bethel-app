import type { FormEvent, KeyboardEvent } from 'react';
import ClassSelect from '../../../shared/components/ClassSelect';
import Field from '../../../shared/components/Field';
import { useAsyncAction } from '../../../shared/hooks/useAsyncAction';
import { useFormFields } from '../../../shared/hooks/useFormFields';
import { SEMESTER_OPTIONS } from '../../../utils/classDays';
import type { CatalogExtraField, CatalogFormValues, CatalogRecord, SchoolClass } from '../../../types/index';
import type { CatalogDefinition } from '../catalogDefinitions';
import {
  findMissingExtraField,
  getNextOrder,
  isDuplicateName,
  toCatalogFormValues,
  toCatalogRecordData,
} from '../catalogForm';

interface CatalogItemFormProps {
  classes: SchoolClass[];
  // Clase y semestre sugeridos al agregar (los del filtro activo).
  defaultClassId?: string;
  defaultSemester?: string;
  definition: CatalogDefinition;
  item: CatalogRecord | null;
  items: CatalogRecord[];
  onClose: () => void;
}

// Agregar o editar un elemento de catálogo en la misma lista (sin modal).
const CatalogItemForm = ({
  classes,
  defaultClassId = '',
  defaultSemester = '',
  definition,
  item,
  items,
  onClose,
}: CatalogItemFormProps) => {
  const { setField, values } = useFormFields<CatalogFormValues>({
    ...toCatalogFormValues(item, getNextOrder(items)),
    ...(item ? {} : { classId: defaultClassId, semester: defaultSemester }),
  });
  const { error, isRunning, run, setError } = useAsyncAction();
  const fieldIdPrefix = `catalog-${definition.key}-${item?.id ?? 'new'}`;

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!values.name.trim()) {
      setError(`Escribe ${definition.nameLabel.toLowerCase()}.`);
      return;
    }
    if (isDuplicateName(items, values.name, item?.id)) {
      setError(`Ya existe "${values.name.trim()}" en ${definition.title.toLowerCase()}.`);
      return;
    }
    const missingField = findMissingExtraField(values, definition);
    if (missingField) {
      setError(missingField.kind === 'semester' ? 'Elige el semestre.' : 'Elige la clase.');
      return;
    }
    const recordData = toCatalogRecordData(values, definition);
    const saveItem = async () => {
      if (item) await definition.service.update(item.id, recordData);
      else await definition.service.create(recordData);
    };
    if (await run(saveItem)) onClose();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key === 'Escape') onClose();
  };

  const renderExtraField = (field: CatalogExtraField) => {
    const fieldId = `${fieldIdPrefix}-${field.name}`;
    if (field.kind === 'toggle') {
      return (
        <label className="catalog-form-toggle" key={field.name}>
          <input
            checked={values.usesBank}
            onChange={(event) => setField('usesBank', event.target.checked)}
            type="checkbox"
          />
          {field.label}
        </label>
      );
    }
    if (field.kind === 'semester') {
      return (
        <Field className="catalog-form-extra" htmlFor={fieldId} key={field.name} label={field.label}>
          <select
            className="input input-select"
            id={fieldId}
            onChange={(event) => setField('semester', event.target.value)}
            value={values.semester}
          >
            <option value="">Elige el semestre</option>
            {SEMESTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
      );
    }
    if (field.kind === 'class') {
      return (
        <Field className="catalog-form-extra" htmlFor={fieldId} key={field.name} label={field.label}>
          <ClassSelect
            classes={classes}
            id={fieldId}
            onChange={(classId) => setField('classId', classId)}
            value={values.classId}
          />
        </Field>
      );
    }
    const textFieldName = field.name as Exclude<CatalogExtraField['name'], 'classId' | 'semester' | 'usesBank'>;
    return (
      <Field className="catalog-form-extra" htmlFor={fieldId} key={field.name} label={field.label}>
        <input
          className="input"
          id={fieldId}
          inputMode={field.kind === 'number' ? 'numeric' : undefined}
          onChange={(event) => setField(textFieldName, event.target.value)}
          placeholder={field.placeholder}
          type={field.kind === 'number' ? 'number' : 'text'}
          value={values[textFieldName]}
        />
      </Field>
    );
  };

  return (
    <form className="catalog-form" noValidate onKeyDown={handleKeyDown} onSubmit={handleSave}>
      <Field className="catalog-form-name" htmlFor={`${fieldIdPrefix}-name`} label={definition.nameLabel}>
        <input
          autoFocus
          className="input"
          id={`${fieldIdPrefix}-name`}
          onChange={(event) => setField('name', event.target.value)}
          value={values.name}
        />
      </Field>
      {definition.extraFields.map(renderExtraField)}
      <div className="catalog-form-actions">
        <button className="btn btn-secondary" disabled={isRunning} onClick={onClose} type="button">
          Cancelar
        </button>
        <button className="btn btn-primary" disabled={isRunning} type="submit">
          {isRunning ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
      {error && <p className="catalog-form-error form-alert">{error}</p>}
    </form>
  );
};

export default CatalogItemForm;
