import { ProductDetail } from "@/lib/types";

const defaultCare = {
  shipping: "Dostupnou dopravu a cenu uvidíte v pokladně před odesláním objednávky.",
  returns: "Nepoužité zboží můžete vrátit podle podmínek uvedených na stránce Vrácení zboží.",
  warranty: "Na vady se vztahují zákonná práva z odpovědnosti za vady.",
  help: "Pokud potřebujete poradit s výběrem, napište nám přes kontaktní stránku."
};

export const productDetails: Record<string, ProductDetail> = {
  "duna-street-shopper": {
    slug: "duna-street-shopper",
    subtitle: "Prostorná kožená shopper kabelka pro práci, město i každodenní nošení.",
    gallery: ["/uploads/products/starter-kit.svg", "/uploads/products/card-holder-pattern.svg", "/uploads/products/leather-wallet-pattern.svg"],
    variants: ["Béžová / Standard", "Černá / Standard"],
    bullets: ["Pevné uši do ruky i přes rameno", "Minimalistický vzhled bez výrazného loga", "Vhodná do práce i na cestování"],
    specs: ["Materiál: přírodní kůže", "Zapínání: otevřený shopper", "Vyrobeno v malé sérii"],
    ...defaultCare,
    story: [
      {
        title: "Tichá elegance",
        description: "Čistý tvar nechává vyniknout materiál a hodí se k pracovnímu i volnějšímu stylu.",
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
  "nara-card-holder": {
    slug: "nara-card-holder",
    subtitle: "Kompaktní kožené pouzdro na karty a drobnosti do malé kabelky.",
    gallery: ["/uploads/products/card-holder-pattern.svg", "/uploads/products/leather-wallet-pattern.svg"],
    variants: ["Hnědá", "Černá"],
    bullets: ["Na karty a drobné bankovky", "Lehké a praktické", "Vhodné jako dárek"],
    specs: ["Materiál: přírodní kůže", "Velikost: kompaktní", "Údržba: jemná péče o kůži"],
    ...defaultCare,
    story: [],
    reviews: []
  },
  "nara-mini-bag": {
    slug: "nara-mini-bag",
    subtitle: "Menší kožená kabelka na telefon, peněženku a každodenní drobnosti.",
    gallery: ["/uploads/products/leather-wallet-pattern.svg", "/uploads/products/starter-kit.svg"],
    variants: ["Černá", "Béžová"],
    bullets: ["Na telefon a drobnosti", "Čistý minimalistický vzhled", "Dobře se kombinuje s každodenním outfitem"],
    specs: ["Materiál: přírodní kůže", "Popruh: nastavitelný", "Výroba: ruční práce"],
    ...defaultCare,
    story: [],
    reviews: []
  }
};
