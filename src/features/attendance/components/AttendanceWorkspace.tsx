import { ClipboardCheck } from 'lucide-react';
import { useState } from 'react';
import EmptyState from '../../../shared/components/EmptyState';
import Field from '../../../shared/components/Field';
import SearchSelect from '../../../shared/components/SearchSelect';
import type { AcademicPeriod, SelectOption, TeacherAssignment } from '../../../types/index';
import { usePermissions } from '../../auth/hooks/usePermissions';
import { useTeachingGroups } from '../hooks/useTeachingGroups';
import { getGroupLabel } from '../teachingGroups';
import GroupSession from './GroupSession';
import { MODE_MODULES, type SessionMode } from '../sessionModes';
import ModeTabs from './ModeTabs';
import './Attendance.css';

interface AttendanceWorkspaceProps {
  assignments: TeacherAssignment[];
  availableModes: SessionMode[];
  period: AcademicPeriod;
}

// Pasar asistencia y poner notas. Con "ver todos" se elige primero el maestro;
// con "ver propios" solo aparecen los grupos del maestro ligado al usuario.
const AttendanceWorkspace = ({ assignments, availableModes, period }: AttendanceWorkspaceProps) => {
  const permissions = usePermissions();
  const [teacherId, setTeacherId] = useState('');
  const [selectedGroupKey, setSelectedGroupKey] = useState('');
  const [chosenMode, setChosenMode] = useState<SessionMode>(availableModes[0]);

  const mode = availableModes.includes(chosenMode) ? chosenMode : availableModes[0];
  const modeScope = permissions.scope(MODE_MODULES[mode]);
  const scopedAssignments =
    modeScope === 'own' ? assignments.filter((assignment) => assignment.teacherId === permissions.teacherId) : assignments;
  const groups = useTeachingGroups(scopedAssignments);
  const showTeacherPicker = modeScope === 'all';

  const teacherOptions: SelectOption[] = [
    ...new Map(groups.map((group) => [group.assignment.teacherId, group.teacherName])).entries(),
  ].map(([value, label]) => ({ label, value }));
  const activeTeacherId = showTeacherPicker ? teacherId || teacherOptions[0]?.value || '' : '';
  const visibleGroups = groups.filter((group) => !activeTeacherId || group.assignment.teacherId === activeTeacherId);
  const selectedGroup = visibleGroups.find((group) => group.key === selectedGroupKey) ?? visibleGroups[0] ?? null;
  const groupOptions: SelectOption[] = visibleGroups.map((group) => ({ label: getGroupLabel(group), value: group.key }));
  const emptyText =
    modeScope === 'own'
      ? 'Todavía no tienes materias asignadas en este período. Pide a Administración que te las asigne en Materias por maestro.'
      : 'Asigna materias a los maestros en Materias por maestro para poder pasar asistencia.';

  const handleTeacherChange = (nextTeacherId: string) => {
    setTeacherId(nextTeacherId);
    setSelectedGroupKey('');
  };

  return (
    <>
      <div className="session-toolbar">
        <div className="session-toolbar-fields">
          {showTeacherPicker && groups.length > 0 && (
            <Field className="session-toolbar-teacher" htmlFor="session-teacher" label="Maestro">
              <SearchSelect
                emptyText="Ningún maestro coincide."
                id="session-teacher"
                onChange={handleTeacherChange}
                options={teacherOptions}
                placeholder="Busca un maestro"
                value={activeTeacherId}
              />
            </Field>
          )}
          {groups.length > 0 && (
            <Field className="session-toolbar-group" htmlFor="session-group" label="Clase y materia">
              <select
                className="input input-select"
                id="session-group"
                onChange={(event) => setSelectedGroupKey(event.target.value)}
                value={selectedGroup?.key ?? ''}
              >
                {groupOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>
          )}
        </div>
        <ModeTabs availableModes={availableModes} mode={mode} onChange={setChosenMode} />
      </div>
      {groups.length === 0 && (
        <section className="panel">
          <EmptyState icon={ClipboardCheck} text={emptyText} title="Sin grupos en este período" />
        </section>
      )}
      {selectedGroup && <GroupSession group={selectedGroup} key={selectedGroup.key} mode={mode} period={period} />}
    </>
  );
};

export default AttendanceWorkspace;
