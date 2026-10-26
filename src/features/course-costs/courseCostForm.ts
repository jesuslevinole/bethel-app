import type { AcademicPeriod, Book, CourseBook, CourseBookRow, CourseCost, MonthlyFee, NewRecord } from '../../types/index';
import { countPaidMonths, listPeriodMonths } from '../../utils/courseCost';
import { todayIso } from '../../utils/dateFormat';
import { getRelationName } from '../../utils/relations';
import { normalizeText } from '../../utils/search';

export interface CourseCostFormValues {
  books: CourseBookRow[];
  classId: string;
  date: string;
  enrollmentFee: number;
  graduationFee: number;
  monthlyFees: MonthlyFee[];
}

export const createBookRow = (book?: CourseBook): CourseBookRow => ({
  amount: book?.amount ?? 0,
  rowId: crypto.randomUUID(),
  title: book?.title ?? '',
});

const isBlankRow = (book: CourseBookRow) => !book.title.trim() && book.amount === 0;

export const hasOnlyBlankRows = (books: CourseBookRow[]) => books.every(isBlankRow);

// Agrega los libros del catálogo de la clase que aún no están en la lista (sin precio: se pone en cada período).
// Las filas vacías se quitan; las ya escritas se quedan como están.
export const addCatalogBooks = (books: CourseBookRow[], catalogBooks: Book[]) => {
  const filledRows = books.filter((book) => !isBlankRow(book));
  const listedTitles = new Set(filledRows.map((book) => normalizeText(book.title)));
  const newRows = catalogBooks
    .filter((book) => !listedTitles.has(normalizeText(book.name)))
    .map((book) => createBookRow({ amount: 0, title: book.name }));
  const mergedRows = [...filledRows, ...newRows];
  return mergedRows.length > 0 ? mergedRows : [createBookRow()];
};

export const countMissingCatalogBooks = (books: CourseBookRow[], catalogBooks: Book[]) => {
  const listedTitles = new Set(books.map((book) => normalizeText(book.title)));
  return catalogBooks.filter((book) => !listedTitles.has(normalizeText(book.name))).length;
};

// Un mes por cada mes del período; lo que ya estaba guardado se conserva (y meses guardados fuera del período también).
const toMonthlyFeeRows = (cost: CourseCost | null, period: AcademicPeriod): MonthlyFee[] => {
  const saved = new Map((cost?.monthlyFees ?? []).map((fee) => [fee.month, fee.amount]));
  const months = [...new Set([...listPeriodMonths(period), ...saved.keys()])].sort();
  return months.map((month) => ({ amount: saved.get(month) ?? 0, month }));
};

export const toCourseCostFormValues = (cost: CourseCost | null, period: AcademicPeriod): CourseCostFormValues => ({
  books: cost?.books.length ? cost.books.map(createBookRow) : [createBookRow()],
  classId: cost?.classId ?? '',
  date: cost?.date ?? todayIso(),
  enrollmentFee: cost?.enrollmentFee ?? 0,
  graduationFee: cost?.graduationFee ?? 0,
  monthlyFees: toMonthlyFeeRows(cost, period),
});

// Filas totalmente vacías se ignoran; las que tienen monto deben tener título.
const getFilledBooks = (books: CourseBookRow[]) => books.filter((book) => book.title.trim() || book.amount > 0);

interface CourseCostValidationContext {
  classNames: Map<string, string>;
  ownId?: string;
  periodCosts: CourseCost[];
}

// Una clase tiene un solo registro de costos por período académico.
export const validateCourseCost = (values: CourseCostFormValues, context: CourseCostValidationContext) => {
  if (!values.date || !values.classId) return 'Elige la clase y la fecha.';
  const isDuplicateClass = context.periodCosts.some(
    (cost) => cost.id !== context.ownId && cost.classId === values.classId,
  );
  if (isDuplicateClass) {
    return `${getRelationName(context.classNames, values.classId)} ya tiene costos en este período. Edítalos desde la lista.`;
  }
  if (getFilledBooks(values.books).some((book) => !book.title.trim())) return 'Cada libro con monto necesita su nombre.';
  if (countPaidMonths(values.monthlyFees) === 0) return 'Escribe la mensualidad de al menos un mes.';
  return null;
};

export const toCourseCostData = (values: CourseCostFormValues, periodId: string): NewRecord<CourseCost> => ({
  books: getFilledBooks(values.books).map((book) => ({ amount: book.amount, title: book.title.trim() })),
  classId: values.classId,
  date: values.date,
  enrollmentFee: values.enrollmentFee,
  graduationFee: values.graduationFee,
  monthlyFees: values.monthlyFees,
  months: countPaidMonths(values.monthlyFees),
  periodId,
});
