// Datos del instituto que aparecen en documentos impresos (carnet, hoja de asistencia, expediente, boletas).
export const INSTITUTE = {
  address: '219 Clifton Ave. Lakewood NJ 08701',
  church: 'Bethel Spanish Pentecostal Church A/G',
  // Día de clases (0 = domingo … 3 = miércoles). La asistencia solo deja elegir ese día.
  classWeekday: 3,
  classWeekdayName: 'miércoles',
  // Director y decano de educación: firman expediente y boletas.
  dean: 'Rev. Rodys E. Morales',
  // Frase al pie de la boleta (la hoja la traía en inglés).
  motto:
    'Con esfuerzo y perseverancia el estudiante alcanza sus metas. Nunca veas el estudio como una obligación, sino como una oportunidad. El conocimiento es la capacidad de enseñar y dirigir a otros.',
  name: 'Bethel Bible Institute',
  principal: 'Rev. Manuel De Jesús Cruz',
} as const;
