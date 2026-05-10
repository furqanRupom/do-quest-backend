export enum TransactionType {
  credit = 'CREDIT',
  debit = 'DEBIT',
}

export enum TransactionCategory {
  earning = 'EARNING',           // Worker earned from approved submission
  withdrawal = 'WITHDRAWAL',     // Worker withdrew to bank
  refund = 'REFUND',             // Creator got refunded after cancellation
  escrow_hold = 'ESCROW_HELD',   // Creator funded task (held in escrow)
  escrow_release = 'ESCROW_RELEASE', // Funds released to worker
}

export enum TransactionStatus {
  pending = 'PENDING',
  completed = 'COMPLETED',
  failed = 'FAILED',
}
