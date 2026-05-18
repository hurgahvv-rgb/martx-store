import { Product } from "@/lib/types";

export const products: Product[] = [
  {
    id: "cmp8bd8860000tmcgj2xveptj",
    name: "Өгзөг өргөгч",
    slug: "өгзөг-өргөгч",
    category: "Хувцас",
    price: 38000,
    currency: "MNT",
    image: "https://res.cloudinary.com/dww8rawj0/image/upload/v1779076067/martx/products/xdd6wealc1tbiwf6gidh.png",
    galleryImages: [
      "https://res.cloudinary.com/dww8rawj0/image/upload/v1779033999/martx/products/zyao3zei0wxaqnjpdqwn.png",
      "https://res.cloudinary.com/dww8rawj0/image/upload/v1779033999/martx/products/eigceqd2ivl0dpveqawu.png",
      "https://res.cloudinary.com/dww8rawj0/image/upload/v1779034000/martx/products/nujdijsaezycd1e8kdsu.png",
      "https://res.cloudinary.com/dww8rawj0/image/upload/v1779076090/martx/products/vtvxxh8gydmkw5u64xdq.png"
    ],
    rating: 5,
    description:
      "Өдөр тутам өмсөхөд биед эвтэйхэн, биеийн галбирыг илүү цэгцтэй харагдуулах зориулалттай хэлбэржүүлэгч шорт. Өндөр суудалтай загвар нь гэдэс, бэлхүүс орчмыг зөөлөн барьж, өгзөгний хэсгийг натурал хэлбэрээр тодруулна.",
    subtitle: "Биеийн галбирыг цэгцэлж, өгзгийг илүү гоёмсог харагдуулах тухтай хэлбэржүүлэгч шорт.",
    features: ["Өндөр суудалтай", "Өгзөг өргөж харагдуулна", "Өдөр тутам өмсөхөд эвтэйхэн"],
    bullets: ["L - 55кг", "XL - 60кг", "2XL - 68кг", "3XL - 75-85кг"],
    specs: [
      "Материал: Суналттай зөөлөн даавуу",
      "Загвар: Өндөр суудалтай хэлбэржүүлэгч шорт",
      "Өнгө: Хар, Шаргал",
      "Хэрэглээ: Өдөр тутам, арга хэмжээ, бариу хувцасны доор",
      "Арчилгаа: Гараар эсвэл зөөлөн горимоор угаах"
    ],
    stock: 50,
    isFeatured: true,
    isActive: true,
    variants: [
      { id: "cmpaphec60000k00ba3o3zgp8", color: "Шаргал", size: "L", sku: "MARTX-BEIGE-L", price: null, stock: 10, image: null, isActive: true },
      { id: "cmpaphec60001k00bjqrbaj2b", color: "Шаргал", size: "XL", sku: "MARTX-BEIGE-XL", price: null, stock: 10, image: null, isActive: true },
      { id: "cmpaphec60002k00bagqwe2p8", color: "Шаргал", size: "XXL", sku: "MARTX-BEIGE-XXL", price: null, stock: 10, image: null, isActive: true },
      { id: "cmpaphec60003k00bseikmytz", color: "Шаргал", size: "XXXL", sku: "MARTX-BEIGE-XXXL", price: null, stock: 10, image: null, isActive: true },
      { id: "cmpaphec60004k00bmgesv3s8", color: "Хар", size: "XL", sku: "MARTX-HAR-XL", price: null, stock: 10, image: null, isActive: true },
      { id: "cmpaphec60005k00b6wajn8xa", color: "Хар", size: "XXL", sku: "MARTX-HAR-XXL", price: null, stock: 10, image: null, isActive: true },
      { id: "cmpaphec60006k00bh8ip3c28", color: "Хар", size: "XXXL", sku: "MARTX-HAR-XXXL", price: null, stock: 10, image: null, isActive: true }
    ],
    stories: [
      {
        title: "Төвөггүй өмсөж, илүү цэгцтэй харагд",
        description:
          "Зарим гэдэсний даруулга өмсөхөд хэт бариу, эвгүй, өдөржин өмсөхөд төвөгтэй санагддаг. Энэ загвар нь тэр асуудлыг илүү уян хатан, биед эвтэйхэн шийдсэн. Өндөр суудалтай хэсэг нь хэвлий орчмын сул унжилтыг зөөлөн барьж, бэлхүүсийг илүү цэгцтэй харагдуулна.",
        image: "/products/shapewear/before-after-story.png"
      },
      {
        title: "Өөртөө итгэлтэй алхам бүр",
        description:
          "Бариу даашинз, юбка эсвэл өдөр тутмын хувцасны доор өмсөхөд биеийн галбирыг илүү цэгцтэй харагдуулж, хөдөлгөөнд саад болохгүй тухтай мэдрэмж өгнө. Өндөр суудалтай хэлбэржүүлэлт нь хэвлий, бэлхүүс орчмыг зөөлөн барьж, алхам бүрийг илүү өөртөө итгэлтэй болгоно.",
        image: "/products/shapewear/confidence-city-story.png"
      },
      {
        title: "Зөөлөн суналт, цэвэр оёдол",
        description:
          "Биед эвтэйхэн суухад материалын уян хатан чанар хамгийн чухал. Зөөлөн суналттай даавуу, амьсгалах mesh хэсэг болон цэвэр оёдол нь хөдөлгөөн дагаж сууж, өдөр тутмын өмсөлтөд илүү тав тухтай мэдрэмж өгнө.",
        image: "/products/shapewear/material-detail-story.png"
      }
    ],
    reviews: [
      {
        author: "Номин",
        rating: 5,
        title: "Өдөржин өмсөхөд эвтэйхэн",
        body: "Хэт бариу биш мөртлөө гэдэс, бэлхүүс хэсгийг гоё цэгцэлж өгдөг юм байна."
      },
      {
        author: "Саруул",
        rating: 5,
        title: "Даашинзны доор ил мэдэгдэхгүй",
        body: "Суухад эвгүй санагдаагүй. Өгзөгний хэлбэр арай гоё, натурал харагдсан."
      },
      {
        author: "Ариунаа",
        rating: 5,
        title: "Материал нь зөөлөн",
        body: "Хар өнгийг авсан. Суналттай, өмдний доор өмсөхөд биеийн галбир илүү цэгцтэй харагдаж байна."
      },
      {
        author: "Мөнхзаяа",
        rating: 4,
        title: "Гэдэсний хэсгийг сайн барьдаг",
        body: "Хэт шахахгүйгээр барьдаг нь таалагдсан. Өдөр тутам өмсөхөд боломжийн тухтай."
      },
      {
        author: "Энхжин",
        rating: 5,
        title: "Size chart яг таарсан",
        body: "XL авсан, яг таарсан. Бэлхүүс хэсэг доош хуйлрахгүй, хөдөлгөөнд саад болохгүй байна."
      },
      {
        author: "Уянга",
        rating: 5,
        title: "Confidence өгдөг бүтээгдэхүүн",
        body: "Бариу даашинз, юбка өмсөх үед галбир илүү цэгцтэй харагдаад их гоё санагдсан."
      }
    ]
  },
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
    id: "wave-floor-lamp",
    name: "Долгион хэлбэртэй шалны гэрэл",
    slug: "wave-floor-lamp",
    category: "Гэр ахуй",
    price: 75000,
    compareAtPrice: 81000,
    currency: "MNT",
    image: "/uploads/products/wave-floor-lamp/warm-lifestyle.png",
    galleryImages: [
      "/uploads/products/wave-floor-lamp/cool-catalog.png",
      "/uploads/products/wave-floor-lamp/natural-lifestyle.png",
      "/uploads/products/wave-floor-lamp/daylight-off.png",
      "/uploads/products/wave-floor-lamp/texture-detail.png"
    ],
    rating: 4.9,
    description:
      "Зөөлөн долгионт хэлбэр, сарнисан гэрэлтүүлэгтэй энэхүү шалны гэрэл нь өрөөнд шууд л дулаан, тухтай уур амьсгал нэмнэ. Унтлагын өрөө, зочны өрөө, булангийн чимэглэлд тохиромжтой бөгөөд шар, цагаан, байгалийн гэрлийн 3 горимоор орчны мэдрэмжийг амархан өөрчилнө.",
    subtitle:
      "Өрөөний буланг premium харагдуулах, 3 өнгийн гэрлийн горимтой долгион хэлбэрийн шалны гэрэл.",
    features: ["3 өнгийн гэрлийн горимтой", "Долгионт pleated дизайн", "Зочны болон унтлагын өрөөнд тохиромжтой"],
    bullets: [
      "Шар гэрэл - орой амрах, cozy уур амьсгал бүрдүүлэхэд",
      "Цагаан гэрэл - цэвэрхэн, тод modern мэдрэмж өгөхөд",
      "Байгалийн гэрэл - өдөр тутмын тайван гэрэлтүүлэгт",
      "Өндөр нарийн хэлбэртэй тул булангийн зайд амархан байрлана"
    ],
    specs: [
      "Гэрлийн горим: Шар, цагаан, байгалийн гэрэл",
      "Загвар: Долгион хэлбэртэй өндөр шалны гэрэл",
      "Материал: Цагаан pleated гэрэл сарниулагч бүрхүүл",
      "Хэрэглээ: Зочны өрөө, унтлагын өрөө, lounge булан",
      "Өнгө: Цагаан их бие, зөөлөн сарнисан гэрэлтүүлэг"
    ],
    stock: 45,
    isFeatured: true,
    isActive: true,
    stories: [
      {
        title: "Өрөөний буланг дулаан акцент болгоно",
        description:
          "Өндөр нарийн хэлбэр нь их зай эзлэхгүйгээр интерьерийг илүү цэгцтэй харагдуулна. Долгионт бүрхүүлээр гэрэл зөөлөн сарниж, буйдан, хөшиг, ор, комодны дэргэд дулаан уур амьсгал нэмнэ.",
        image: "/uploads/products/wave-floor-lamp/warm-lifestyle.png"
      },
      {
        title: "Гэрлийн 3 өнгөөр уур амьсгалаа соль",
        description:
          "Шар гэрэл нь оройн амралтад, цагаан гэрэл нь цэвэрхэн modern орчинд, байгалийн гэрэл нь өдөр тутмын тайван хэрэглээнд тохиромжтой. Нэг гэрэл, гурван өөр мэдрэмж.",
        image: "/uploads/products/wave-floor-lamp/natural-lifestyle.png"
      },
      {
        title: "Унтраалттай үедээ ч чимэглэл хэвээр",
        description:
          "Цагаан pleated бүрхүүл, давхар долгионт хэлбэр нь гэрэл асаагүй үед ч өрөөнд sculptural decor мэт харагдана. Minimal интерьер дээр зөөлөн, цэвэрхэн цэг нэмнэ.",
        image: "/uploads/products/wave-floor-lamp/daylight-off.png"
      }
    ],
    reviews: [
      {
        author: "Namuun",
        rating: 5,
        title: "Орой асаахад үнэхээр тухтай",
        body: "Шар гэрэл дээр нь асаахаар өрөө шууд дулаан уур амьсгалтай болдог. Буйдангийн хажууд тавихад яг тохирсон."
      },
      {
        author: "Энхриймаа",
        rating: 5,
        title: "Зураг дээрхээсээ илүү гоё харагдсан",
        body: "Долгионт хэлбэр нь гэрэл асаагүй үедээ ч чимэглэл шиг харагддаг. Унтлагын өрөөний буланд их цэвэрхэн зохисон."
      },
      {
        author: "Bilguun",
        rating: 4,
        title: "3 өнгийн горим нь хэрэгтэй юм байна",
        body: "Өдөр нь цагаан гэрэл дээр, орой нь шар гэрэл дээр хэрэглэж байна. Гэрэл нь нүдэнд хурц биш, зөөлөн сарнидаг."
      },
      {
        author: "Марал",
        rating: 5,
        title: "Зочны өрөөнд premium мэдрэмж нэмсэн",
        body: "Өндөр нарийн хэлбэртэй болохоор их зай эзлэхгүй. Комодны дэргэд тавьсан чинь өрөө илүү тохижсон харагдаж байна."
      },
      {
        author: "Tuvshin",
        rating: 5,
        title: "Бэлгэнд авахад ч гоё сонголт",
        body: "Энгийн гэрэл биш, интерьерийн decor шиг санагдсан. Байгалийн гэрэл нь өдөр тутам асаахад хамгийн таатай байна."
      }
    ]
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
  const amount = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0
  }).format(price);

  return currency === "MNT" ? `${amount} ₮` : `${amount} ${currency}`;
}
