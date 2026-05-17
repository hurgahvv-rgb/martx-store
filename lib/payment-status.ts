export const paymentStatuses = ["PENDING", "CONFIRMED", "REFUNDED", "FAILED"] as const;

export const paymentStatusLabels: Record<(typeof paymentStatuses)[number], string> = {
  PENDING: "Төлбөр хүлээгдэж байна",
  CONFIRMED: "Төлбөр баталгаажсан",
  REFUNDED: "Буцаалт хийсэн",
  FAILED: "Төлбөр амжилтгүй"
};

export function getPaymentStatusLabel(status: string) {
  return paymentStatusLabels[status as (typeof paymentStatuses)[number]] ?? status;
}
