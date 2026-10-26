// Búsqueda sin importar mayúsculas ni acentos ("Martinez" encuentra "Martínez").
export const normalizeText = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

export const matchesSearch = (fields: string[], query: string) => {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return true;
  return fields.some((field) => normalizeText(field).includes(normalizedQuery));
};
