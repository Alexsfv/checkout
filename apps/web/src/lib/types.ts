export type Rule<V = unknown> = (value: string, values: V) => string | undefined;

export type Values = Record<string, string>;

export interface FormConfig<V extends Values> {
  initial: V;
  rules: Partial<Record<keyof V, Rule<V>>>;
  activeFields: (values: V) => ReadonlyArray<keyof V>;
  storageKey?: string;
}

export interface Form<V extends Values> {
  values: V;
  errors: Partial<Record<keyof V, string>>;
  setValue: <K extends keyof V>(name: K, value: V[K]) => void;
  touch: (name: keyof V) => void;
  validate: () => boolean;
  applyServerErrors: (errors: Record<string, string>) => void;
  reset: () => void;
  isValid: boolean;
}

export interface PluralForms {
  one: string;
  few: string;
  many: string;
}
