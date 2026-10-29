import SignaturePad from '../../../shared/components/SignaturePad';
import type { Signature, YesNo } from '../../../types/index';
import { PASTOR_CERTIFICATION, PASTOR_QUESTIONS, toChoiceOptions, YES_NO_LABELS } from '../applicationForm';
import ChoiceField from './ChoiceField';

interface PastorSectionProps {
  answers: YesNo[];
  disabled?: boolean;
  onAnswersChange: (answers: YesNo[]) => void;
  onSignatureChange: (signature: Signature | null) => void;
  pastorName: string;
  signature: Signature | null;
}

const YES_NO_OPTIONS = toChoiceOptions(YES_NO_LABELS);

// "Para el uso del pastor del solicitante": sus 5 respuestas y su firma en pantalla.
const PastorSection = ({
  answers,
  disabled = false,
  onAnswersChange,
  onSignatureChange,
  pastorName,
  signature,
}: PastorSectionProps) => {
  const handleAnswer = (index: number, answer: YesNo) =>
    onAnswersChange(
      PASTOR_QUESTIONS.map((_, questionIndex) => (questionIndex === index ? answer : (answers[questionIndex] ?? ''))),
    );

  return (
    <div className="pastor-section">
      {PASTOR_QUESTIONS.map((question, index) => (
        <ChoiceField
          key={question}
          label={`${index + 1}. ${question}`}
          onChange={(answer) => handleAnswer(index, answer)}
          options={YES_NO_OPTIONS}
          value={answers[index] ?? ''}
        />
      ))}
      <p className="application-note">{PASTOR_CERTIFICATION}</p>
      <SignaturePad
        disabled={disabled}
        label={`Firma del pastor${pastorName.trim() ? ` (${pastorName.trim()})` : ''}`}
        onChange={onSignatureChange}
        signerName={pastorName}
        value={signature}
      />
    </div>
  );
};

export default PastorSection;
