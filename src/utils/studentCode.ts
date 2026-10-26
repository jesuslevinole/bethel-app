import type { Student } from '../types/index';

const CODE_PREFIX = 'BBI-';
const CODE_DIGITS = 4;

// Siguiente código libre (BBI-0001, BBI-0002…). Es una sugerencia editable en el formulario.
export const getNextStudentCode = (students: Student[]) => {
  const highestNumber = students.reduce((highest, student) => {
    const codeNumber = Number.parseInt(student.code.replace(CODE_PREFIX, ''), 10);
    return Number.isFinite(codeNumber) ? Math.max(highest, codeNumber) : highest;
  }, 0);
  return `${CODE_PREFIX}${String(highestNumber + 1).padStart(CODE_DIGITS, '0')}`;
};

export const isStudentCodeTaken = (students: Student[], code: string, ownId?: string) =>
  students.some((student) => student.id !== ownId && student.code.trim().toLowerCase() === code.trim().toLowerCase());
