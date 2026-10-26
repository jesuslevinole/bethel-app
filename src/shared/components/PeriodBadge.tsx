import { getPeriodStatus, PERIOD_STATUS_BADGES, PERIOD_STATUS_LABELS } from '../../utils/periodStatus';

interface PeriodBadgeProps {
  periodEnd: string;
  periodStart: string;
}

const PeriodBadge = ({ periodEnd, periodStart }: PeriodBadgeProps) => {
  const status = getPeriodStatus(periodStart, periodEnd);
  return <span className={PERIOD_STATUS_BADGES[status]}>{PERIOD_STATUS_LABELS[status]}</span>;
};

export default PeriodBadge;
