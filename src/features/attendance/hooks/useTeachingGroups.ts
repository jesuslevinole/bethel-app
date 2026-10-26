import { useMemo } from 'react';
import { useLiveData } from '../../../shared/data/liveCollections';
import type { TeacherAssignment } from '../../../types/index';
import { buildNameMap } from '../../../utils/relations';
import { toTeachingGroups } from '../teachingGroups';

export const useTeachingGroups = (assignments: TeacherAssignment[]) => {
  const classes = useLiveData('classes');
  const subjects = useLiveData('subjects');
  const teachers = useLiveData('teachers');

  return useMemo(
    () =>
      toTeachingGroups(assignments, {
        classNames: buildNameMap(classes),
        subjectNames: buildNameMap(subjects),
        teacherNames: buildNameMap(teachers),
      }),
    [assignments, classes, subjects, teachers],
  );
};
