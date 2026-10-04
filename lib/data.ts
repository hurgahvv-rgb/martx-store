import { Product } from "@/lib/types";

export const products: Product[] = [
  {
    id: "duna-street-shopper",
    name: "Duna Street shopper",
    slug: "duna-street-shopper",
    category: "Kabelky",
    price: 2690,
    currency: "CZK",
    image: "/uploads/products/starter-kit.svg",
    galleryImages: ["/uploads/products/starter-kit.svg"],
    rating: 4.9,
    description: "Prostorná kožená shopper kabelka pro práci, město i každodenní nošení.",
    subtitle: "Čistý tvar, měkká kůže a dostatek prostoru na běžný den.",
    features: ["Ručně šitá", "Přírodní kůže", "Každodenní velikost"],
    bullets: ["Pevné uši do ruky i přes rameno", "Minimalistický vzhled bez výrazného loga", "Vhodná do práce i na cestování"],
    specs: ["Materiál: přírodní kůže", "Zapínání: otevřený shopper", "Vyrobeno v malé sérii"],
    stock: 12,
    isFeatured: true,
    isActive: true,
    variants: [
      {
        id: "duna-beige",
        color: "Béžová",
        size: "Standard",
        sku: "NARA-DUNA-BEIGE",
        price: null,
        stock: 6,
        image: "/uploads/products/starter-kit.svg",
        isActive: true
      },
      {
        id: "duna-black",
        color: "Černá",
        size: "Standard",
        sku: "NARA-DUNA-BLACK",
        price: null,
        stock: 6,
        image: "/uploads/products/card-holder-pattern.svg",
        isActive: true
      }
    ],
    stories: [
      {
        title: "Na každý den",
        description: "Velikost kabelky je navržená tak, aby unesla běžné věci do práce i na procházku městem.",
        image: "/uploads/products/starter-kit.svg"
      }
    ],
    reviews: [
      {
        author: "Klára",
        rating: 5,
        title: "Krásná jednoduchá kabelka",
        body: "Líbí se mi čistý tvar a kvalitní materiál. Působí elegantně a není přezdobená."
      }
    ]
  },
  {
    id: "nara-card-holder",
    name: "Kožené pouzdro na karty",
    slug: "nara-card-holder",
    category: "Peněženky",
    price: 690,
    currency: "CZK",
    image: "/uploads/products/card-holder-pattern.svg",
    galleryImages: ["/uploads/products/card-holder-pattern.svg"],
    rating: 4.8,
    description: "Kompaktní kožené pouzdro na karty a drobnosti do malé kabelky.",
    subtitle: "Malý kožený doplněk, který se vejde všude.",
    features: ["Kompaktní", "Pevné šití", "Dárkové balení"],
    bullets: ["Na karty a drobné bankovky", "Lehké a praktické", "Vhodné jako dárek"],
    specs: ["Materiál: přírodní kůže", "Velikost: kompaktní", "Údržba: jemná péče o kůži"],
    stock: 20,
    isFeatured: true,
    isActive: true
  },
  {
    id: "nara-mini-bag",
    name: "Mini kožená kabelka",
    slug: "nara-mini-bag",
    category: "Kabelky",
    price: 1890,
    currency: "CZK",
    image: "/uploads/products/leather-wallet-pattern.svg",
    galleryImages: ["/uploads/products/leather-wallet-pattern.svg"],
    rating: 4.9,
    description: "Menší kožená kabelka na telefon, peněženku a každodenní drobnosti.",
    subtitle: "Lehká kabelka pro dny, kdy chcete mít volné ruce.",
    features: ["Nastavitelný popruh", "Malá série", "Lehká konstrukce"],
    bullets: ["Na telefon a drobnosti", "Čistý minimalistický vzhled", "Dobře se kombinuje s každodenním outfitem"],
    specs: ["Materiál: přírodní kůže", "Popruh: nastavitelný", "Výroba: ruční práce"],
    stock: 10,
    isFeatured: true,
    isActive: true
  }
];

export const featuredProducts = products.filter((product) => product.isFeatured);

export function formatPrice(price: number, currency: string) {
  const amount = new Intl.NumberFormat("cs-CZ", {
    maximumFractionDigits: 0
  }).format(price);

  if (currency === "MNT") {
    return `${amount} ₮`;
  }

  if (currency === "CZK") {
    return `${amount} Kč`;
  }

  return `${amount} ${currency}`;
}
