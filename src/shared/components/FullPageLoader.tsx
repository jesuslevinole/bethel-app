import Crest from './Crest';
import './FullPageLoader.css';

const FullPageLoader = () => (
  <div aria-busy="true" aria-label="Cargando" className="full-page-loader">
    <Crest size={56} />
  </div>
);

export default FullPageLoader;
