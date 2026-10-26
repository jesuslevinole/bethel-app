import type { ReactNode } from 'react';

interface FieldProps {
  children: ReactNode;
  className?: string;
  error?: string | null;
  hint?: string;
  htmlFor?: string;
  label: string;
}

const Field = ({ children, className, error, hint, htmlFor, label }: FieldProps) => {
  const fieldClassName = className ? `field ${className}` : 'field';
  const helperText = error ?? hint;
  const helperClassName = error ? 'field-error' : 'field-hint';

  return (
    <div className={fieldClassName}>
      <label className="field-label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {helperText && <span className={helperClassName}>{helperText}</span>}
    </div>
  );
};

export default Field;
