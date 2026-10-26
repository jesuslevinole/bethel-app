import { useMemo } from 'react';
import { useLiveData } from '../../../shared/data/liveCollections';
import { buildNameMap } from '../../../utils/relations';

export const useAssignmentLookups = () => {
  const teachers = useLiveData('teachers');
  const classes = useLiveData('classes');
  const subjects = useLiveData('subjects');

  const teacherNames = useMemo(() => buildNameMap(teachers), [teachers]);
  const classNames = useMemo(() => buildNameMap(classes), [classes]);
  const subjectNames = useMemo(() => buildNameMap(subjects), [subjects]);

  return { classNames, classes, subjectNames, subjects, teacherNames, teachers };
};
