import { useMemo } from 'react';
import { useLiveCollection, useLivePeriodCollection } from '../../../shared/data/liveCollections';
import { useScopedPeriodCollection, useScopedPeriodData } from '../../../shared/data/useScopedData';
import { todayIso } from '../../../utils/dateFormat';
import { usePermissions } from '../../auth/hooks/usePermissions';
import { useEnrollmentLookups } from '../../enrollments/hooks/useEnrollmentLookups';
import { buildAccountRows } from '../accountRows';

// Todo lo de Pagos del período: pagos, inscripciones, costos y catálogos, y el estado de cuenta de cada alumno.
// Con "propios" (estudiante) solo llega lo suyo (useScoped*).
export const usePaymentsData = (periodId: string | null) => {
  const permissions = usePermissions();
  const paymentScope = permissions.scope('payments');
  const payments = useScopedPeriodCollection('payments', periodId);
  const enrollments = useScopedPeriodData('enrollments', periodId);
  // Las reglas dejan leer los costos a quien ve pagos (el estado de cuenta los necesita).
  const { data: costs } = useLivePeriodCollection('courseCosts', paymentScope !== 'none' ? periodId : null);
  const { classNames, classes, students, studentsById } = useEnrollmentLookups();
  const canReadPaymentCatalogs = permissions.scope('catalogs') === 'all' || paymentScope === 'all';
  const { data: paymentTypes } = useLiveCollection('paymentTypes', canReadPaymentCatalogs);
  const { data: incomeTypes } = useLiveCollection('incomeTypes', canReadPaymentCatalogs);
  const { data: banks } = useLiveCollection('banks', canReadPaymentCatalogs);

  const accountRows = useMemo(
    () =>
      buildAccountRows({
        classNames,
        costs,
        enrollments,
        payments: payments.data,
        studentsById,
        today: todayIso(),
      }),
    [classNames, costs, enrollments, payments.data, studentsById],
  );

  return {
    accountRows,
    banks,
    classNames,
    classes,
    costs,
    enrollments,
    incomeTypes,
    isLoading: payments.isLoading,
    paymentTypes,
    payments: payments.data,
    students,
    studentsById,
  };
};
