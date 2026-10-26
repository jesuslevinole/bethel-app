import { unzipSync, strFromU8 } from 'fflate';
import { UserFacingError } from '../../../utils/userFacingError';
import { parseStudentTable, parseStudentText } from './parseStudentList';

const WORD_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';

// Las tablas de un .docx: cada fila (w:tr) con el texto de sus celdas (w:tc).
const readDocxTables = (buffer: ArrayBuffer) => {
  const files = unzipSync(new Uint8Array(buffer), { filter: (file) => file.name === 'word/document.xml' });
  const documentXml = files['word/document.xml'];
  if (!documentXml) throw new UserFacingError('El archivo no parece un documento de Word (.docx).');
  const xml = new DOMParser().parseFromString(strFromU8(documentXml), 'application/xml');
  return Array.from(xml.getElementsByTagNameNS(WORD_NS, 'tr')).map((row) =>
    Array.from(row.getElementsByTagNameNS(WORD_NS, 'tc')).map((cell) =>
      Array.from(cell.getElementsByTagNameNS(WORD_NS, 't'))
        .map((textNode) => textNode.textContent ?? '')
        .join(''),
    ),
  );
};

// Lee la lista de alumnos de un Word (.docx, su tabla), un CSV o un texto.
export const readStudentFile = async (file: File) => {
  const name = file.name.toLowerCase();
  if (name.endsWith('.docx')) return parseStudentTable(readDocxTables(await file.arrayBuffer()));
  if (name.endsWith('.csv') || name.endsWith('.txt')) return parseStudentText(await file.text());
  throw new UserFacingError('Usa un archivo de Word (.docx), CSV o de texto. También puedes pegar la lista.');
};
