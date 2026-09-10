import type { Order, Payment, Scenario } from '@/api/types';
import type { BadgeTone } from '@/ui/types';

export type PaymentPhase = 'none' | 'ready' | 'processing' | 'succeeded' | 'failed' | 'cancelled';

export interface PaymentFlow {
  attempt: Payment | null;
  phase: PaymentPhase;
  attempts: Payment[];
  isStarting: boolean;
  isSubmitting: boolean;
  start: () => void;
  pay: (scenario: Scenario) => void;
  cancel: () => void;
}

export interface PaymentDialogProps {
  open: boolean;
  amount: number;
  currency: string;
  flow: PaymentFlow;
  onClose: () => void;
}

export interface PaymentSectionProps {
  order: Order;
  flow: PaymentFlow;
  onOpenDialog: () => void;
}

export interface OrderStatusLabel {
  text: string;
  tone: BadgeTone;
}

export interface DeliverySummary {
  title: string;
  details: string;
}
