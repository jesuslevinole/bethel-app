import { useState } from 'react';
import ConfirmDialog from '../../../shared/components/ConfirmDialog';
import type { Student } from '../../../types/index';
import { pluralize } from '../../../utils/plural';
import { deleteTestData } from '../services/testData';

interface TestDataBannerProps {
  canDelete: boolean;
  testStudents: Student[];
}

// Aviso mientras haya alumnos de prueba, con el botón para borrarlos (y lo que se les registró).
const TestDataBanner = ({ canDelete, testStudents }: TestDataBannerProps) => {
  const [isConfirming, setIsConfirming] = useState(false);

  return (
    <div className="seed-banner">
      <div className="seed-banner-text">
        <span className="seed-banner-title">
          {pluralize(testStudents.length, 'alumno de prueba', 'alumnos de prueba')}
        </span>
        <span className="seed-banner-detail">
          Úsalos para probar inscripciones, asistencia y pagos. Al terminar, bórralos con sus inscripciones, pagos y
          los costos creados como prueba.
        </span>
      </div>
      {canDelete && (
        <button className="btn btn-danger-outline" onClick={() => setIsConfirming(true)} type="button">
          Eliminar datos de prueba
        </button>
      )}
      {isConfirming && (
        <ConfirmDialog
          confirmLabel="Eliminar todo"
          description={`Se borrarán ${pluralize(testStudents.length, 'alumno de prueba', 'alumnos de prueba')} con sus inscripciones de todos los períodos, sus pagos y su foto, y los costos del curso creados como prueba. No se puede deshacer.`}
          item={testStudents}
          onCancel={() => setIsConfirming(false)}
          onConfirm={async (students) => {
            await deleteTestData(students);
          }}
          title="Eliminar datos de prueba"
        />
      )}
    </div>
  );
};

export default TestDataBanner;
