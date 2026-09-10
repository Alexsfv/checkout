import type { ButtonHTMLAttributes, ElementType, InputHTMLAttributes, ReactNode } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';

export type Tone = 'info' | 'success' | 'danger' | 'warning';

export type BadgeTone = 'neutral' | 'accent' | 'success' | 'danger' | 'warning';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export type ButtonSize = 'sm' | 'md' | 'lg';

export type SpinnerSize = 'sm' | 'md';

export type ToastTone = 'info' | 'success' | 'danger';

export interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
  label?: string;
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  block?: boolean;
  icon?: ReactNode;
}

export interface LinkButtonProps {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  className?: string;
  children: ReactNode;
  'aria-label'?: string;
}

export interface FieldControlProps {
  id: string;
  'aria-describedby'?: string;
  'aria-invalid'?: true;
  'aria-required'?: true;
}

export interface FieldProps {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  className?: string;
  children: (control: FieldControlProps) => ReactNode;
}

export interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  fieldClassName?: string;
}

export interface RadioOption<T extends string> {
  value: T;
  title: ReactNode;
  description?: ReactNode;
  aside?: ReactNode;
  disabled?: boolean;
}

export interface RadioCardsProps<T extends string> {
  legend: ReactNode;
  name: string;
  value: T | null;
  options: ReadonlyArray<RadioOption<T>>;
  onChange: (value: T) => void;
  error?: ReactNode;
  columns?: boolean;
  fieldName?: string;
}

export interface AlertProps {
  tone?: Tone;
  title: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  live?: 'polite' | 'assertive';
  className?: string;
}

export interface BadgeProps {
  tone?: BadgeTone;
  icon?: ReactNode;
  children: ReactNode;
}

export interface CardProps {
  as?: ElementType;
  title?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export interface SkeletonProps {
  height?: number;
  width?: number | string;
  className?: string;
}

export interface SkeletonListProps {
  rows?: number;
  height?: number;
}

export interface DialogProps {
  open: boolean;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  dismissible?: boolean;
}

export interface EmptyStateProps {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}

export interface QueryBoundaryProps<T> {
  query: UseQueryResult<T>;
  skeleton?: ReactNode;
  children: (data: T) => ReactNode;
}

export interface QuantityStepperProps {
  value: number;
  min?: number;
  max: number;
  busy?: boolean;
  label: string;
  onChange: (value: number) => void;
}

export interface TotalsRow {
  label: ReactNode;
  value: ReactNode;
  muted?: boolean;
  emphasis?: boolean;
  live?: boolean;
}

export interface TotalsProps {
  rows: readonly TotalsRow[];
  className?: string;
}

export interface Toast {
  id: string;
  tone: ToastTone;
  title: string;
  description?: string;
  createdAt: number;
}

export interface ToastState {
  items: Toast[];
}

export interface ToastInput {
  tone?: ToastTone;
  title: string;
  description?: string;
}
