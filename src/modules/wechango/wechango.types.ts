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

/**
 * Maps Wechango failure codes to user-friendly French messages.
 */
const FAILURE_MESSAGES: Record<string, string> = {
  INSUFFICIENT_FUNDS: 'Solde insuffisant. Veuillez recharger votre compte et reessayer.',
  TIMEOUT: "Vous n'avez pas confirme le paiement a temps. Veuillez reessayer.",
  REFUSED: "L'operateur a refuse la transaction. Veuillez verifier votre compte ou reessayer plus tard.",
  OM_MP_PAY_FAILED:
    "L'operateur a refuse le paiement. Verifiez que votre compte Mobile Money est actif et que votre solde est suffisant.",
  CANCELLED: 'Vous avez annule le paiement.',
  PAYMENT_FAILED: 'Le paiement a echoue. Veuillez reessayer.',
  INIT_ERROR: "Impossible d'initier le paiement. Veuillez reessayer dans quelques instants.",
};

export function getUserFriendlyMessage(
  failureCode: string | null | undefined,
  failureMessage: string | null | undefined,
): string {
  if (failureCode && FAILURE_MESSAGES[failureCode]) {
    return FAILURE_MESSAGES[failureCode];
  }
  if (failureMessage) {
    return failureMessage;
  }
  return 'Le paiement a echoue. Veuillez reessayer.';
}
