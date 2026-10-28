export interface SelectOption {
  detail?: string;
  // Se ve pero no se puede elegir (si ya estaba elegida, solo se puede quitar).
  disabled?: boolean;
  label: string;
  value: string;
}
