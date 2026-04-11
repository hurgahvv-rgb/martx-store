import { Product } from "@/lib/types";

export const products: Product[] = [
  {
    id: "felt-weekender",
    name: "Эсгий аяллын цүнх",
    slug: "felt-weekender-bag",
    category: "Цүнх",
    price: 189000,
    compareAtPrice: 229000,
    currency: "MNT",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=80",
    rating: 4.8,
    description: "Монгол эсгий урлалаас санаа авсан, аялал болон өдөр тутмын хэрэглээнд тохирсон premium цүнх.",
    features: ["Ус тогтоохгүй доторлогоо", "Laptop хийх тасалгаа", "Онгоцонд авч явахад тохиромжтой"],
    isFeatured: true
  },
  {
    id: "cashmere-wrap",
    name: "Ноолууран нөмрөг",
    slug: "nomad-cashmere-wrap",
    category: "Хувцас",
    price: 249000,
    compareAtPrice: 289000,
    currency: "MNT",
    image:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80",
    rating: 4.9,
    description: "Хүйтэн өглөө, аялал, өдөр тутмын давхарлаж өмсөхөд зориулсан зөөлөн ноолууран нөмрөг.",
    features: ["100% ноолуур", "Бэлгийн хайрцагтай", "Дөрвөн улиралд өмсөх боломжтой"],
    isFeatured: true
  },
  {
    id: "cedar-candle",
    name: "Талын хуш үнэрт лаа",
    slug: "steppe-cedar-candle",
    category: "Гэр ахуй",
    price: 59000,
    compareAtPrice: 79000,
    currency: "MNT",
    image:
      "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1200&q=80",
    rating: 4.6,
    description: "Хуш мод, зөөлөн утаат үнэр хосолсон, өрөөнд тайван premium уур амьсгал бүрдүүлэх лаа.",
    features: ["45 цаг асна", "Шар буурцгийн лавтай", "Дахин ашиглах шилэн савтай"]
  },
  {
    id: "ceramic-set",
    name: "Шороон өнгийн керамик сет",
    slug: "earth-tone-ceramic-set",
    category: "Гэр ахуй",
    price: 129000,
    compareAtPrice: 159000,
    currency: "MNT",
    image:
      "https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=1200&q=80",
    rating: 4.7,
    description: "Ширээний засалт болон өдөр тутмын хэрэглээнд зориулсан minimal загвартай аяга, тавагны цуглуулга.",
    features: ["Гараар бүрж шатаасан", "Аяга угаагчинд хийж болно", "Хязгаарлагдмал тоо ширхэгтэй"]
  }
];

export const featuredProducts = products.filter((product) => product.isFeatured);

export function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat("mn-MN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(price);
}
