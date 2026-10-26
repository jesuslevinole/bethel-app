// Regla del negocio: toda fecha visible va en MM/DD/AAAA y se guarda como AAAA-MM-DD.
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const US_DATE_PATTERN = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;

const padNumber = (value: number) => String(value).padStart(2, '0');

const isRealDate = (year: number, month: number, day: number) => {
  const candidate = new Date(year, month - 1, day);
  return candidate.getFullYear() === year && candidate.getMonth() === month - 1 && candidate.getDate() === day;
};

// "Hoy" en hora local. Nunca toISOString(): da la fecha UTC y cambia de día en la tarde.
export const todayIso = () => {
  const now = new Date();
  return `${now.getFullYear()}-${padNumber(now.getMonth() + 1)}-${padNumber(now.getDate())}`;
};

export const isIsoDate = (value: string) => {
  const match = ISO_DATE_PATTERN.exec(value);
  if (!match) return false;
  return isRealDate(Number(match[1]), Number(match[2]), Number(match[3]));
};

export const formatDate = (isoDate: string | null | undefined) => {
  if (!isoDate || !isIsoDate(isoDate)) return '—';
  const [year, month, day] = isoDate.split('-');
  return `${month}/${day}/${year}`;
};

export const formatDateRange = (startIso: string, endIso: string) => `${formatDate(startIso)} – ${formatDate(endIso)}`;

// Convierte lo que escribe el usuario (MM/DD/AAAA) a AAAA-MM-DD; null si no es una fecha real.
export const parseUsDate = (text: string) => {
  const match = US_DATE_PATTERN.exec(text.trim());
  if (!match) return null;
  const month = Number(match[1]);
  const day = Number(match[2]);
  const year = Number(match[3]);
  if (!isRealDate(year, month, day)) return null;
  return `${year}-${padNumber(month)}-${padNumber(day)}`;
};

// Las fechas ISO se comparan como texto sin problema (mismo largo y orden).
export const isDateWithin = (isoDate: string, startIso: string, endIso: string) =>
  isoDate >= startIso && isoDate <= endIso;

export const compareIsoDesc = (first: string, second: string) => second.localeCompare(first);

// Suma (o resta) días a una fecha AAAA-MM-DD, en hora local.
export const shiftIsoDate = (isoDate: string, days: number) => {
  const [year, month, day] = isoDate.split('-').map(Number);
  const shifted = new Date(year, month - 1, day + days);
  return `${shifted.getFullYear()}-${padNumber(shifted.getMonth() + 1)}-${padNumber(shifted.getDate())}`;
};

const LONG_DATE_FORMAT = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'long', weekday: 'long' });

// "viernes, 23 de octubre" (para encabezados; los campos siguen en MM/DD/AAAA).
export const formatLongDate = (isoDate: string) => {
  if (!isIsoDate(isoDate)) return '';
  const [year, month, day] = isoDate.split('-').map(Number);
  return LONG_DATE_FORMAT.format(new Date(year, month - 1, day));
};
