import { useState, type ChangeEvent, type WheelEvent } from 'react';
import { parseAmount } from '../../utils/money';
import './MoneyInput.css';

interface MoneyInputProps {
  ariaLabel?: string;
  id?: string;
  invalid?: boolean;
  onChange: (amount: number) => void;
  value: number;
}

// Guarda el texto que escribe el usuario (para no pelear con "12." a medio escribir)
// y avisa el monto ya convertido a número.
const MoneyInput = ({ ariaLabel, id, invalid = false, onChange, value }: MoneyInputProps) => {
  const [text, setText] = useState(value > 0 ? String(value) : '');

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value);
    onChange(parseAmount(event.target.value));
  };

  // Evita que la rueda del mouse cambie el monto sin querer.
  const handleWheel = (event: WheelEvent<HTMLInputElement>) => event.currentTarget.blur();

  return (
    <div className="money-input">
      <span aria-hidden="true" className="money-input-symbol">
        $
      </span>
      <input
        aria-label={ariaLabel}
        className={`input money-input-field${invalid ? ' is-invalid' : ''}`}
        id={id}
        inputMode="decimal"
        min="0"
        onChange={handleChange}
        onWheel={handleWheel}
        placeholder="0.00"
        step="0.01"
        type="number"
        value={text}
      />
    </div>
  );
};

export default MoneyInput;
