import type { AttendanceSheet, SessionDraft } from '../../types/index';

export const EMPTY_DRAFT: SessionDraft = { dailyScores: {}, marks: {} };

export const toSessionDraft = (session: AttendanceSheet | undefined): SessionDraft =>
  session ? { dailyScores: session.dailyScores ?? {}, marks: session.marks } : EMPTY_DRAFT;

// Solo cuenta lo que tiene valor: un ND borrado (null) y uno que nunca existió son lo mismo.
const cleanDraft = ({ dailyScores, marks }: SessionDraft) => ({
  dailyScores: Object.fromEntries(Object.entries(dailyScores).filter(([, score]) => score !== null).sort()),
  marks: Object.fromEntries(Object.entries(marks).sort()),
});

export const isSameDraft = (first: SessionDraft, second: SessionDraft) =>
  JSON.stringify(cleanDraft(first)) === JSON.stringify(cleanDraft(second));

// Solo los alumnos que siguen en la lista (si alguien se dio de baja, su marca no se arrastra).
export const keepRosterOnly = (draft: SessionDraft, studentIds: string[]): SessionDraft => ({
  dailyScores: Object.fromEntries(Object.entries(draft.dailyScores).filter(([id]) => studentIds.includes(id))),
  marks: Object.fromEntries(Object.entries(draft.marks).filter(([id]) => studentIds.includes(id))) as SessionDraft['marks'],
});
