'use client';

import { cn } from '@/lib/cn';
import styles from './RadioCards.module.css';
import type { RadioCardsProps } from './types';

export const RadioCards = <T extends string>({
  legend,
  name,
  value,
  options,
  onChange,
  error,
  columns = false,
  fieldName,
}: RadioCardsProps<T>) => {
  const errorId = error ? `${name}-error` : undefined;
  return (
    <fieldset
      className={styles.fieldset}
      aria-describedby={errorId}
      aria-invalid={error ? true : undefined}
      data-field={fieldName}
      tabIndex={fieldName ? -1 : undefined}
    >
      <legend className={styles.legend}>{legend}</legend>
      <div className={cn(styles.list, columns && styles.columns)}>
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              styles.card,
              value === option.value && styles.selected,
              option.disabled && styles.disabled,
            )}
          >
            <input
              className={styles.input}
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              disabled={option.disabled}
              onChange={() => onChange(option.value)}
            />
            <span className={styles.marker} aria-hidden="true" />
            <span className={styles.body}>
              <span className={styles.title}>{option.title}</span>
              {option.description ? (
                <span className={styles.description}>{option.description}</span>
              ) : null}
            </span>
            {option.aside ? <span className={styles.aside}>{option.aside}</span> : null}
          </label>
        ))}
      </div>
      {error ? (
        <p className={styles.error} id={errorId}>
          {error}
        </p>
      ) : null}
    </fieldset>
  );
};
