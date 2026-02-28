export interface WechangoCreatePaymentParams {
  amount: number;
  currency: 'XAF' | 'XOF';
  customer_phone: string;
  country: string;
  description?: string;
  reference?: string;
  customer_email?: string;
  customer_name?: string;
  operator_code?: string;
  metadata?: Record<string, unknown>;
}

export interface WechangoPayment {
  id: string;
  object: 'payment';
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'cancelled';
  customer_phone: string;
  customer_email: string | null;
  customer_name: string | null;
  description: string | null;
  reference: string | null;
  fee: number;
  net_amount: number;
  country: string;
  operator: string;
  failure_code: string | null;
  failure_message: string | null;
  livemode: boolean;
  metadata: Record<string, unknown> | null;
  succeeded_at: string | null;
  failed_at: string | null;
  created_at: string;
}

export interface WechangoWebhookEvent {
  type: 'payment.succeeded' | 'payment.failed';
  data: {
    payment_id: string;
    amount: number;
    currency: string;
    status: string;
    operator_transaction_id?: string;
    failure_code?: string;
    failure_message?: string;
  };
}
