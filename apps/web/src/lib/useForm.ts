'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { readStored, removeStored, writeStored } from './storage';
import type { Form, FormConfig, Values } from './types';

export const useForm = <V extends Values>({
  initial,
  rules,
  activeFields,
  storageKey,
}: FormConfig<V>): Form<V> => {
  const [values, setValues] = useState<V>(initial);
  const [touched, setTouched] = useState<Partial<Record<keyof V, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [serverErrors, setServerErrors] = useState<Partial<Record<keyof V, string>>>({});

  useEffect(() => {
    if (!storageKey) return;
    const draft = readStored<Partial<V> | null>(storageKey, null);
    if (draft) setValues((current) => ({ ...current, ...draft }));
  }, [storageKey]);

  const firstRender = useRef(true);
  useEffect(() => {
    if (!storageKey) return;
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    writeStored(storageKey, values);
  }, [storageKey, values]);

  const schema = useRef({ rules, activeFields, initial });
  schema.current = { rules, activeFields, initial };

  const allErrors = useMemo(() => {
    const { rules: currentRules, activeFields: currentActive } = schema.current;
    return currentActive(values).reduce<Partial<Record<keyof V, string>>>((acc, name) => {
      const error = currentRules[name]?.(values[name] ?? '', values);
      if (error) acc[name] = error;
      return acc;
    }, {});
  }, [values]);

  const visibleErrors = useMemo(() => {
    return (Object.keys(allErrors) as Array<keyof V>).reduce<Partial<Record<keyof V, string>>>(
      (acc, name) => {
        if (submitted || touched[name]) acc[name] = allErrors[name];
        return acc;
      },
      { ...serverErrors },
    );
  }, [allErrors, serverErrors, submitted, touched]);

  const setValue = useCallback(<K extends keyof V>(name: K, value: V[K]) => {
    setValues((current) => (current[name] === value ? current : { ...current, [name]: value }));

    setServerErrors((current) => (name in current ? { ...current, [name]: undefined } : current));
  }, []);

  const touch = useCallback((name: keyof V) => {
    setTouched((current) => (current[name] ? current : { ...current, [name]: true }));
  }, []);

  const validate = useCallback(() => {
    setSubmitted(true);
    const names = Object.keys(allErrors);
    const first = names[0];
    if (first === undefined) return true;

    document.querySelector<HTMLElement>(`[data-field="${first}"]`)?.focus();
    return false;
  }, [allErrors]);

  const applyServerErrors = useCallback((incoming: Record<string, string>) => {
    setSubmitted(true);
    setServerErrors(incoming as Partial<Record<keyof V, string>>);
  }, []);

  const reset = useCallback(() => {
    setValues(schema.current.initial);
    setTouched({});
    setSubmitted(false);
    setServerErrors({});
    if (storageKey) removeStored(storageKey);
  }, [storageKey]);

  return {
    values,
    errors: visibleErrors,
    setValue,
    touch,
    validate,
    applyServerErrors,
    reset,
    isValid: Object.keys(allErrors).length === 0,
  };
};
