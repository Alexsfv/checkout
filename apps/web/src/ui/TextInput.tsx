'use client';

import { Field } from './Field';
import styles from './TextInput.module.css';
import { cn } from '@/lib/cn';
import type { TextInputProps } from './types';

export const TextInput = ({
  label,
  hint,
  error,
  fieldClassName,
  className,
  required,
  ...rest
}: TextInputProps) => {
  return (
    <Field label={label} hint={hint} error={error} required={required} className={fieldClassName}>
      {(control) => (
        <input
          {...rest}
          {...control}
          required={required}
          className={cn(styles.input, error && styles.invalid, className)}
        />
      )}
    </Field>
  );
};
