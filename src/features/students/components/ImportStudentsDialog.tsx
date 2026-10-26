import { FileUp } from 'lucide-react';
import { useState, type ChangeEvent } from 'react';
import Field from '../../../shared/components/Field';
import Modal from '../../../shared/components/Modal';
import { useLiveData, useLivePeriodCollection } from '../../../shared/data/liveCollections';
import { useScopedPeriodData } from '../../../shared/data/useScopedData';
import { useAsyncAction } from '../../../shared/hooks/useAsyncAction';
import type { AcademicPeriod, Student } from '../../../types/index';
import { formatMoney } from '../../../utils/money';
import { usePermissions } from '../../auth/hooks/usePermissions';
import { pluralize } from '../../../utils/plural';
import { buildNameMap, getRelationName } from '../../../utils/relations';
import { importStudents, planImport, type ImportOptions, type ImportSummary } from '../import/importStudents';
import { parseStudentText, type ImportRow } from '../import/parseStudentList';
import { readStudentFile } from '../import/readStudentFile';
import './ImportStudents.css';

interface ImportStudentsDialogProps {
  onClose: () => void;
  period: AcademicPeriod | null;
  students: Student[];
}

const DEFAULT_OPTIONS: ImportOptions = { classId: '', createCosts: true, enroll: true, isTest: true };

// Importar alumnos desde la tabla de un Word (como las listas de contabilidad semanal), un CSV o una lista
// pegada. Puede inscribirlos en el período y crear los costos con su mensualidad. Marcados como prueba,
// se borran después todos juntos.
const ImportStudentsDialog = ({ onClose, period, students }: ImportStudentsDialogProps) => {
  const permissions = usePermissions();
  const canCreateCosts = permissions.can('courseCosts', 'create');
  const classes = useLiveData('classes');
  const enrollments = useScopedPeriodData('enrollments', period?.id ?? null);
  const { data: costs } = useLivePeriodCollection('courseCosts', period?.id ?? null);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [pastedText, setPastedText] = useState('');
  const [fileName, setFileName] = useState('');
  const [options, setOptions] = useState<ImportOptions>({ ...DEFAULT_OPTIONS, createCosts: canCreateCosts });
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const reading = useAsyncAction();
  const saving = useAsyncAction();

  const sources = { classes, costs, enrollments, period, students };
  const plan = planImport(rows, options, sources);
  const classNames = buildNameMap(classes);
  const hasFees = rows.some((row) => row.monthlyFee);
  const newCount = plan.filter((planRow) => planRow.status === 'new').length;
  const withoutClass = plan.filter((planRow) => !planRow.classId).length;

  const setOption = <Key extends keyof ImportOptions>(key: Key, value: ImportOptions[Key]) =>
    setOptions((current) => ({ ...current, [key]: value }));

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setFileName(file.name);
    await reading.run(async () => setRows(await readStudentFile(file)));
  };

  const handleReadPasted = () => setRows(parseStudentText(pastedText));

  const handleImport = () =>
    saving.run(async () => {
      setSummary(await importStudents(plan, options, sources));
    });

  if (summary) {
    return (
      <Modal onClose={onClose} size="sm" title="Alumnos importados">
        <div className="modal-body">
          <ul className="import-summary">
            <li>{pluralize(summary.students, 'alumno nuevo', 'alumnos nuevos')}</li>
            <li>{pluralize(summary.enrollments, 'inscripción', 'inscripciones')} en {period?.name ?? 'el período'}</li>
            <li>{pluralize(summary.costs, 'registro de costos', 'registros de costos')} con mensualidad</li>
          </ul>
          {options.isTest && (
            <p className="import-hint">Quedaron marcados como prueba: en Alumnos puedes borrarlos todos con un botón.</p>
          )}
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
    <Modal onClose={onClose} size="full" subtitle="Desde la tabla de un Word (.docx), un CSV o una lista pegada." title="Importar alumnos">
      <div className="modal-body">
        <div className="import-columns form-columns">
          <div className="form-column">
            <h3 className="form-section-title">Lista</h3>
            <label className="btn btn-secondary import-file">
              <FileUp size={18} />
              {fileName || 'Elegir archivo (.docx, .csv)'}
              <input accept=".docx,.csv,.txt" className="visually-hidden" onChange={(event) => void handleFile(event)} type="file" />
            </label>
            <Field htmlFor="import-paste" label="O pega la lista (con su encabezado)">
              <textarea
                className="input import-paste"
                id="import-paste"
                onChange={(event) => setPastedText(event.target.value)}
                placeholder={'Estudiante #\tNombre del Estudiante\tAño\tMensualidad\n12857\tDaniel Arroyo\t1\t35'}
                rows={5}
                value={pastedText}
              />
            </Field>
            <button className="btn btn-ghost" disabled={!pastedText.trim()} onClick={handleReadPasted} type="button">
              Leer lista pegada
            </button>
            {reading.error && <p className="form-alert">{reading.error}</p>}
          </div>
          <div className="form-column">
            <h3 className="form-section-title">Opciones</h3>
            <Field htmlFor="import-class" label="Clase">
              <select
                className="input input-select"
                id="import-class"
                onChange={(event) => setOption('classId', event.target.value)}
                value={options.classId}
              >
                <option value="">Según la columna "Año" de la lista</option>
                {classes.map((schoolClass) => (
                  <option key={schoolClass.id} value={schoolClass.id}>
                    Todos a {schoolClass.name}
                  </option>
                ))}
              </select>
            </Field>
            <label className="import-check">
              <input
                checked={options.enroll}
                disabled={!period}
                onChange={(event) => setOption('enroll', event.target.checked)}
                type="checkbox"
              />
              Inscribirlos en {period?.name ?? 'el período elegido'}
            </label>
            {hasFees && canCreateCosts && (
              <label className="import-check">
                <input
                  checked={options.createCosts}
                  disabled={!period}
                  onChange={(event) => setOption('createCosts', event.target.checked)}
                  type="checkbox"
                />
                Crear los costos del curso con la mensualidad de la lista (solo en clases que no tienen)
              </label>
            )}
            <label className="import-check">
              <input checked={options.isTest} onChange={(event) => setOption('isTest', event.target.checked)} type="checkbox" />
              Son datos de prueba (se pueden borrar todos juntos después)
            </label>
          </div>
        </div>
        {plan.length > 0 && (
          <>
            <p className="import-count">
              {pluralize(plan.length, 'alumno en la lista', 'alumnos en la lista')} · {pluralize(newCount, 'nuevo', 'nuevos')}
              {withoutClass > 0 && ` · ${withoutClass} sin clase (no se inscriben)`}
            </p>
            <div className="table-wrap import-preview">
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">Código</th>
                    <th scope="col">Nombre</th>
                    <th scope="col">Clase</th>
                    <th className="cell-num" scope="col">
                      Mensualidad
                    </th>
                    <th scope="col">Qué pasa</th>
                  </tr>
                </thead>
                <tbody>
                  {plan.map((planRow) => (
                    <tr key={planRow.row.key}>
                      <td className="cell-id">{planRow.code}</td>
                      <td className="cell-strong">{planRow.row.name}</td>
                      <td>{planRow.classId ? getRelationName(classNames, planRow.classId) : '—'}</td>
                      <td className="cell-num">{planRow.row.monthlyFee ? formatMoney(planRow.row.monthlyFee) : '—'}</td>
                      <td>
                        {planRow.status === 'new' ? (
                          <span className="badge badge-success">Nuevo</span>
                        ) : (
                          <span className="badge badge-muted">
                            Ya existe{planRow.isAlreadyEnrolled ? ' e inscrito' : ''}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        {saving.error && <p className="form-alert">{saving.error}</p>}
      </div>
      <footer className="modal-footer">
        <button className="btn btn-secondary" disabled={saving.isRunning} onClick={onClose} type="button">
          Cancelar
        </button>
        <button className="btn btn-primary" disabled={saving.isRunning || plan.length === 0} onClick={() => void handleImport()} type="button">
          {saving.isRunning ? 'Importando…' : `Importar ${pluralize(plan.length, 'alumno', 'alumnos')}`}
        </button>
      </footer>
    </Modal>
  );
};

export default ImportStudentsDialog;
