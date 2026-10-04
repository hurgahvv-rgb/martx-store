export const orderStatuses = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELED"
] as const;

export const orderStatusLabels: Record<(typeof orderStatuses)[number], string> = {
  PENDING: "Čeká na zpracování",
  PAID: "Zaplaceno",
  PROCESSING: "Připravuje se",
  SHIPPED: "Odesláno",
  DELIVERED: "Doručeno",
  CANCELED: "Zrušeno"
};
