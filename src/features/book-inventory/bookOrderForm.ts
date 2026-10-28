// Libros del "Formulario para pedido de libros" (IBAD11) del Instituto Bíblico de las Asambleas de Dios,
// con su código de clase, precio y el año (clase) que lo usa. Se cargan desde Inventario de libros.
// † en el formulario = libro opcional de referencia (isOptional).
// Ojo: BIB212S y BIB214S vienen en el formulario con el mismo nombre; al segundo se le agrega el código.
export interface OrderFormBook {
  code: string;
  isOptional: boolean;
  name: string;
  price: number;
  // 1 = Primer año … 4 = Cuarto año (la clase con ese orden en Catálogos).
  year: number;
}

const book = (year: number, code: string, name: string, price: number, isOptional = false): OrderFormBook => ({
  code,
  isOptional,
  name,
  price,
  year,
});

export const BOOK_ORDER_FORM: OrderFormBook[] = [
  book(1, 'BIB212S', 'Estudio del Nuevo Testamento', 33),
  book(1, 'BIB214S', 'Estudio del Nuevo Testamento (BIB214S)', 33),
  book(1, 'BIB318S', 'El Pentateuco', 33, true),
  book(1, 'BIB117S', 'Epístolas de la Prisión', 33, true),
  book(1, 'BIB112S', 'Evangelios Sinópticos', 33, true),
  book(1, 'BIB322S', 'Los Libros Poéticos', 33, true),
  book(2, 'THE114S', 'Introducción a la Doctrina Pentecostal', 33),
  book(2, 'HLI201', 'La Historia de la Iglesia Cristiana', 12),
  book(2, 'BIB115S', 'Hechos', 33),
  book(2, 'MIN171S', 'Una Iglesia en el Poder del Espíritu', 33),
  book(2, 'BIB121S', 'Introducción a la Hermenéutica', 33),
  book(2, 'MIN123S', 'Introducción al Evangelismo en la Iglesia Local', 33),
  book(2, 'THE142S', 'Historia, Misiones y Gobierno de las A/D', 33),
  book(2, 'MIN223S', 'Introducción a la Homilética', 33),
  book(2, 'MIN261S', 'Introducción a las Misiones', 33, true),
  book(3, 'UCTB401', 'Usos y Costumbres de las Tierras Bíblicas (Arqueología)', 33),
  book(3, 'MIN381S', 'El Ministerio Pastoral', 33),
  book(3, 'MIN251S', 'Liderazgo Eficaz', 33),
  book(3, 'EPCV301', 'Enseñando para Cambiar Vidas (Pedagogía)', 15),
  book(3, 'EAED301', 'El Administrador de Escuela Dominical (Pedagogía)', 20),
  book(3, 'MIN327S', 'Administración de la Iglesia, Finanzas y Ley I & II', 33),
  book(3, 'PARL201S', 'Reglas Parlamentarias', 7),
  book(3, 'THE245S', 'Escatología', 33),
  book(3, 'CCW301', 'Cuál Camino (Sectas)', 11),
  book(4, 'TEOS401', 'Teología Sistemática I & II', 33),
  book(4, 'BIB313S', 'Las Epístolas a los Corintios', 33),
  book(4, 'MIN181S', 'Relaciones Interpersonales y la Ética en el Ministerio', 33),
  book(4, 'MIN391S', 'Práctica Ministerial – Nivel Avanzado', 33),
  book(4, 'MIN391ST', 'Práctica Ministerial – Nivel Avanzado – Mentor', 33),
  book(4, 'BIB215S', 'Romanos', 33),
  book(4, 'MIN325S', 'Predicando en el Mundo Contemporáneo', 33),
  book(4, 'MIN281S', 'Manejo de Conflictos', 33),
];
