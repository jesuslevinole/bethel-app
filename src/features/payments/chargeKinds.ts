import type { ChargeKind } from '../../types/index';
import { normalizeText } from '../../utils/search';

// Qué concepto cobra un tipo de pago, por su nombre en Catálogos (como en la hoja: Inscripción, Libros,
// Graduación, Mensualidad). Un tipo con otro nombre ("Anuario") cuenta como "otro": baja el saldo total.
export const getChargeKind = (paymentTypeName: string): ChargeKind => {
  const name = normalizeText(paymentTypeName);
  if (name.includes('inscrip')) return 'enrollment';
  if (name.includes('gradua')) return 'graduation';
  if (name.includes('libro')) return 'books';
  if (name.includes('mensual')) return 'monthly';
  return 'other';
};

export const CHARGE_LABELS: Record<Exclude<ChargeKind, 'other'>, string> = {
  books: 'Libros',
  enrollment: 'Inscripción',
  graduation: 'Graduación',
  monthly: 'Mensualidades',
};
