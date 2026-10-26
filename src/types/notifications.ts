// Aviso calculado a partir de los datos (no se guarda en Firestore): desaparece solo cuando se resuelve.
export interface AppNotification {
  detail: string;
  id: string;
  path?: string;
  title: string;
  tone: 'info' | 'warning';
}
