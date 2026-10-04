export const paymentStatuses = ["PENDING", "CONFIRMED", "REFUNDED", "FAILED"] as const;

export const paymentStatusLabels: Record<(typeof paymentStatuses)[number], string> = {
  PENDING: "Platba čeká na potvrzení",
  CONFIRMED: "Platba potvrzena",
  REFUNDED: "Vráceno",
  FAILED: "Platba se nezdařila"
};

export function getPaymentStatusLabel(status: string) {
  return paymentStatusLabels[status as (typeof paymentStatuses)[number]] ?? status;
}
