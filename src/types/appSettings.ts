// Lista desplegable del menú creada en Personalizar (nombre libre).
export interface NavGroup {
  id: string;
  label: string;
}

// Personalización de la app: app_settings/config. La leen todos los miembros; la cambia quien tenga
// "Personalizar". Sin documento (o sin un campo) se usa el menú y los encabezados originales.
export interface AppSettings {
  // Encabezados de columnas cambiados: tabla → columna → nombre.
  columnLabels?: Record<string, Record<string, string>>;
  id: string;
  navGroups?: NavGroup[];
  // Nombre cambiado de cada ítem del menú (por su ruta).
  navLabels?: Record<string, string>;
  // Orden del menú: rutas de ítems e ids de listas desplegables.
  navOrder?: string[];
  // Ítem (ruta) → lista desplegable donde va.
  navParents?: Record<string, string>;
}
