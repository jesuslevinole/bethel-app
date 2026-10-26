import { useMemo } from 'react';
import { useLiveData } from '../../../shared/data/liveCollections';
import { useStudentDirectory } from '../../../shared/data/useScopedData';
import { buildNameMap } from '../../../utils/relations';

// Alumnos (los que el rol puede ver) y clases en vivo, con mapas por id para resolver nombres.
export const useEnrollmentLookups = () => {
  const { data: students } = useStudentDirectory();
  const classes = useLiveData('classes');

  const studentsById = useMemo(() => new Map(students.map((student) => [student.id, student])), [students]);
  const classNames = useMemo(() => buildNameMap(classes), [classes]);

  return { classNames, classes, students, studentsById };
};
