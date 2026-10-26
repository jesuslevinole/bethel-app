import { INSTITUTE } from '../../../config/institute';
import Crest from '../../../shared/components/Crest';

interface DocumentHeaderProps {
  title: string;
}

// Membrete de los documentos impresos del instituto (expediente, boletas).
const DocumentHeader = ({ title }: DocumentHeaderProps) => (
  <header className="doc-header">
    <Crest size={52} />
    <div className="doc-header-text">
      <span className="doc-institute">{INSTITUTE.name}</span>
      <span className="doc-church">{INSTITUTE.church}</span>
      <span className="doc-address">{INSTITUTE.address}</span>
    </div>
    <span className="doc-title">{title}</span>
  </header>
);

export default DocumentHeader;
