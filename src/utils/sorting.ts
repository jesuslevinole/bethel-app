const nameCollator = new Intl.Collator('es', { sensitivity: 'base' });

export const compareByName = (first: { name: string }, second: { name: string }) =>
  nameCollator.compare(first.name, second.name);

export const compareByOrder = (first: { name: string; order: number }, second: { name: string; order: number }) =>
  first.order - second.order || compareByName(first, second);

export const compareByDateDesc = (first: { date: string }, second: { date: string }) =>
  second.date.localeCompare(first.date);

export const compareByStartDateDesc = (first: { startDate: string }, second: { startDate: string }) =>
  second.startDate.localeCompare(first.startDate);

// Pagos: los más recientes primero; el mismo día, el invoice más nuevo primero.
export const compareByPaymentDesc = (
  first: { date: string; invoiceNumber: number },
  second: { date: string; invoiceNumber: number },
) => second.date.localeCompare(first.date) || second.invoiceNumber - first.invoiceNumber;
