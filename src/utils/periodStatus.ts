import { todayIso } from './dateFormat';

export type PeriodStatus = 'active' | 'finished' | 'upcoming';

export const getPeriodStatus = (periodStart: string, periodEnd: string, today = todayIso()): PeriodStatus => {
  if (today < periodStart) return 'upcoming';
  if (today > periodEnd) return 'finished';
  return 'active';
};

export const PERIOD_STATUS_LABELS: Record<PeriodStatus, string> = {
  active: 'Vigente',
  finished: 'Terminado',
  upcoming: 'Próximo',
};

export const PERIOD_STATUS_BADGES: Record<PeriodStatus, string> = {
  active: 'badge badge-success',
  finished: 'badge badge-muted',
  upcoming: 'badge badge-warning',
};

