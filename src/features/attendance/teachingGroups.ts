import type { TeacherAssignment, TeachingGroup } from '../../types/index';
import { getRelationName } from '../../utils/relations';

interface GroupNameMaps {
  classNames: Map<string, string>;
  subjectNames: Map<string, string>;
  teacherNames: Map<string, string>;
}

export const toTeachingGroups = (assignments: TeacherAssignment[], names: GroupNameMaps): TeachingGroup[] =>
  assignments.flatMap((assignment) =>
    assignment.subjectIds.map((subjectId) => ({
      assignment,
      className: getRelationName(names.classNames, assignment.classId),
      key: `${assignment.id}_${subjectId}`,
      subjectId,
      subjectName: getRelationName(names.subjectNames, subjectId),
      teacherName: getRelationName(names.teacherNames, assignment.teacherId),
    })),
  );

export const getGroupLabel = (group: TeachingGroup) => `${group.className} · ${group.subjectName}`;
