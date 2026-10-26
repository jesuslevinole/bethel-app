// ID corto y legible para mostrar en tablas (los ids de Firestore tienen 20 caracteres).
export const displayId = (documentId: string) => documentId.slice(0, 6).toUpperCase();
