import type { AssignmentRow, TeacherAssignment } from '../../types/index';
import { getRelationName } from '../../utils/relations';

interface AssignmentNameMaps {
  classNames: Map<string, string>;
  subjectNames: Map<string, string>;
  teacherNames: Map<string, string>;
}

export const toAssignmentRows = (assignments: TeacherAssignment[], names: AssignmentNameMaps): AssignmentRow[] =>
  assignments.map((assignment) => ({
    assignment,
    className: getRelationName(names.classNames, assignment.classId),
    subjectNames: assignment.subjectIds.map((subjectId) => getRelationName(names.subjectNames, subjectId)),
    teacherName: getRelationName(names.teacherNames, assignment.teacherId),
  }));
