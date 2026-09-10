'use client';

import { useId } from 'react';
import { Button } from './Button';
import styles from './QuantityStepper.module.css';
import type { QuantityStepperProps } from './types';

export const QuantityStepper = ({
  value,
  min = 1,
  max,
  busy = false,
  label,
  onChange,
}: QuantityStepperProps) => {
  const id = useId();
  const clamp = (next: number) => Math.min(max, Math.max(min, next));

  return (
    <div className={styles.stepper}>
      <label className="visually-hidden" htmlFor={id}>
        {label}
      </label>
      <Button
        size="sm"
        variant="ghost"
        className={styles.step}
        onClick={() => onChange(clamp(value - 1))}
        disabled={busy || value <= min}
        aria-label="Уменьшить количество"
      >
        −
      </Button>
      <input
        id={id}
        className={styles.value}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        disabled={busy}
        onChange={(event) => {
          const next = Number(event.target.value);
          if (Number.isFinite(next)) onChange(clamp(Math.trunc(next)));
        }}
      />
      <Button
        size="sm"
        variant="ghost"
        className={styles.step}
        onClick={() => onChange(clamp(value + 1))}
        disabled={busy || value >= max}
        aria-label="Увеличить количество"
      >
        +
      </Button>
    </div>
  );
};
