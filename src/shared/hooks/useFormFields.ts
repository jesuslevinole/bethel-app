import { useCallback, useState } from 'react';

// Estado de un formulario como un solo objeto, con un setter por campo tipado.
export const useFormFields = <T extends object>(initialValues: T) => {
  const [values, setValues] = useState(initialValues);

  const setField = useCallback(<Key extends keyof T>(key: Key, value: T[Key]) => {
    setValues((currentValues) => ({ ...currentValues, [key]: value }));
  }, []);

  return { setField, setValues, values };
};
