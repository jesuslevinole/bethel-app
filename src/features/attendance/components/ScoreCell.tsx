import { useState, type ChangeEvent } from 'react';
import { parseScore } from '../gradeScores';

interface ScoreCellProps {
  className?: string;
  isEditable: boolean;
  label: string;
  onChange: (score: number | null) => void;
  value: number | null | undefined;
}

// Nota editable (0–100). Guarda el texto mientras se escribe para no pelear con "4." a medias.
const ScoreCell = ({ className, isEditable, label, onChange, value }: ScoreCellProps) => {
  const [text, setText] = useState(value === null || value === undefined ? '' : String(value));

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextText = event.target.value.replace(',', '.');
    setText(nextText);
    onChange(parseScore(nextText));
  };

  return (
    <input
      aria-label={label}
      className={className ? `score-cell ${className}` : 'score-cell'}
      inputMode="decimal"
      onChange={handleChange}
      readOnly={!isEditable}
      value={text}
    />
  );
};

export default ScoreCell;
