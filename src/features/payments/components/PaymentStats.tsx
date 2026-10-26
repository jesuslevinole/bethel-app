import { AlertTriangle, Banknote, Users, Wallet } from 'lucide-react';
import StatCard from '../../../shared/components/StatCard';
import type { Payment } from '../../../types/index';
import { formatMoney, sumMoney } from '../../../utils/money';
import { pluralize } from '../../../utils/plural';
import type { AccountRow } from '../accountRows';

interface PaymentStatsProps {
  accountRows: AccountRow[];
  payments: Payment[];
}

// Cobrado, vencido, por cobrar y deudores del período.
const PaymentStats = ({ accountRows, payments }: PaymentStatsProps) => {
  const debtorCount = accountRows.filter((row) => row.account.overdue > 0).length;

  return (
    <div className="payment-stats">
      <StatCard
        detail={pluralize(payments.length, 'pago registrado', 'pagos registrados')}
        icon={Banknote}
        label="Cobrado"
        value={formatMoney(sumMoney(payments.map((payment) => payment.total)))}
      />
      <StatCard
        detail="Vencido a hoy, sin pagar"
        icon={AlertTriangle}
        label="Vencido"
        value={formatMoney(sumMoney(accountRows.map((row) => row.account.overdue)))}
      />
      <StatCard
        detail="Lo que falta de todo el programa"
        icon={Wallet}
        label="Por cobrar"
        value={formatMoney(sumMoney(accountRows.map((row) => row.account.balance)))}
      />
      <StatCard
        detail={`de ${pluralize(accountRows.length, 'alumno inscrito', 'alumnos inscritos')}`}
        icon={Users}
        label="Deudores"
        value={String(debtorCount)}
      />
    </div>
  );
};

export default PaymentStats;
