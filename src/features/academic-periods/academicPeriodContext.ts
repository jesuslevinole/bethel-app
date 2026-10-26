import { createContext, useContext } from 'react';
import type { AcademicPeriod } from '../../types/index';

export interface AcademicPeriodControls {
  isLoading: boolean;
  periods: AcademicPeriod[];
  selectPeriod: (periodId: string) => void;
  selectedPeriod: AcademicPeriod | null;
}

export const AcademicPeriodContext = createContext<AcademicPeriodControls>({
  isLoading: true,
  periods: [],
  selectPeriod: () => undefined,
  selectedPeriod: null,
});

// Período académico elegido en el menú lateral: todos los módulos trabajan sobre él.
export const useAcademicPeriod = () => useContext(AcademicPeriodContext);
