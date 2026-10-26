// Plan de estudios de la hoja "Instituto" (Trabajo): por clase (año) y semestre, cuatro materias cada uno.
// names[0] es el nombre con que se carga; los demás son otras formas en que aparece (hoja de configuración).
// Sirve para cargar el catálogo vacío y para completar clase y semestre de materias ya guardadas.
export interface CurriculumEntry {
  className: string;
  names: string[];
  semester: 1 | 2;
}

const entry = (className: string, semester: 1 | 2, ...names: string[]): CurriculumEntry => ({ className, names, semester });

export const CURRICULUM: CurriculumEntry[] = [
  entry('Primer', 1, 'Pentateuco y geografía', 'Pentateuco'),
  entry('Primer', 1, 'Los libros históricos'),
  entry('Primer', 1, 'Los libros poéticos'),
  entry('Primer', 1, 'Profetas del Antiguo Testamento I', 'Profetas del Antig. Testamento I'),
  entry('Primer', 2, 'Las epístolas generales'),
  entry('Primer', 2, 'Las epístolas paulinas'),
  entry('Primer', 2, 'Los evangelios'),
  entry('Primer', 2, 'Profetas del Antiguo Testamento II', 'Profetas del Antig. Testamento II'),
  entry('Segundo', 1, 'Hechos', 'Los Hechos I'),
  entry('Segundo', 1, 'Doctrinas bíblicas'),
  entry('Segundo', 1, 'Hermenéutica I'),
  entry('Segundo', 1, 'Historia de la iglesia'),
  entry('Segundo', 2, 'Una iglesia en el poder del Espíritu Santo'),
  entry('Segundo', 2, 'Homilética'),
  entry('Segundo', 2, 'Hermenéutica II'),
  entry(
    'Segundo',
    2,
    'Historia, misiones y gobierno de las A/D',
    'Historia misionera y gobierno de las A.G.',
    'Historia,Misiones y Gobierno de la A/D',
  ),
  entry('Tercer', 1, 'Escatología I'),
  entry('Tercer', 1, 'Administración de iglesia'),
  entry('Tercer', 1, 'Pedagogía'),
  entry('Tercer', 1, 'Teología pastoral I'),
  entry('Tercer', 2, 'Oración y adoración'),
  entry('Tercer', 2, 'Finanza y ley'),
  entry('Tercer', 2, 'Escatología II', 'Escatoligia II'),
  entry('Tercer', 2, 'Teología pastoral II'),
  entry('Cuarto', 1, 'Teología sistemática I'),
  entry('Cuarto', 1, 'Relaciones interpersonales'),
  entry('Cuarto', 1, 'Las epístolas a los Corintios'),
  entry('Cuarto', 1, 'Práctica ministerial A.V.A.', 'Practica M.A', 'Práctica M.A.'),
  entry('Cuarto', 2, 'Teología sistemática II'),
  entry('Cuarto', 2, 'Predicación al mundo contemporáneo', 'Predic. al Mundo Contemporaneo'),
  entry('Cuarto', 2, 'Los Romanos'),
  entry('Cuarto', 2, 'Manejo de conflictos'),
];
