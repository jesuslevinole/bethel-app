import './Crest.css';

interface CrestProps {
  inverted?: boolean;
  size?: number;
}

// Escudo de Bethel: la "B" en Caslon dentro de un blasón con filete dorado.
const Crest = ({ inverted = false, size = 40 }: CrestProps) => (
  <svg
    aria-hidden="true"
    className={`crest${inverted ? ' is-inverted' : ''}`}
    height={size}
    viewBox="0 0 64 64"
    width={size}
  >
    <path className="crest-shield" d="M32 3 57 11.5V30c0 15.5-10.4 25.8-25 31C17.4 55.8 7 45.5 7 30V11.5z" />
    <path className="crest-rule" d="M32 8.5 52 15.3V30c0 12.6-8.3 21.3-20 25.8C20.3 51.3 12 42.6 12 30V15.3z" />
    <text className="crest-letter" textAnchor="middle" x="32" y="41">
      B
    </text>
  </svg>
);

export default Crest;
