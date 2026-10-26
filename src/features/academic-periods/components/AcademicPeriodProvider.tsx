import { useMemo, type ReactNode } from 'react';
import { useLiveCollection } from '../../../shared/data/liveCollections';
import { getDefaultPeriod } from '../../../utils/academicPeriods';
import { AcademicPeriodContext, type AcademicPeriodControls } from '../academicPeriodContext';
import { useStoredPeriodId } from '../hooks/useStoredPeriodId';

interface AcademicPeriodProviderProps {
  children: ReactNode;
}

const AcademicPeriodProvider = ({ children }: AcademicPeriodProviderProps) => {
  const { data: periods, isLoading } = useLiveCollection('academicPeriods');
  const { storePeriodId, storedId } = useStoredPeriodId();

  // Si el período guardado ya no existe (lo borraron), vuelve al vigente.
  const selectedPeriod = periods.find((period) => period.id === storedId) ?? getDefaultPeriod(periods);

  const controls = useMemo<AcademicPeriodControls>(
    () => ({ isLoading, periods, selectPeriod: storePeriodId, selectedPeriod }),
    [isLoading, periods, selectedPeriod, storePeriodId],
  );

  return <AcademicPeriodContext.Provider value={controls}>{children}</AcademicPeriodContext.Provider>;
};

export default AcademicPeriodProvider;
