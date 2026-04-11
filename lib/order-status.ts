export const orderStatuses = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELED"
] as const;

export const orderStatusLabels: Record<(typeof orderStatuses)[number], string> = {
  PENDING: "Хүлээгдэж байна",
  PAID: "Төлбөр төлөгдсөн",
  PROCESSING: "Бэлтгэж байна",
  SHIPPED: "Хүргэлтэд гарсан",
  DELIVERED: "Хүргэгдсэн",
  CANCELED: "Цуцлагдсан"
};
