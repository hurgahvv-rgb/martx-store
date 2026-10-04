const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const headerMenu = [
  { id: "patterns", label: "Pattern", href: "/products?category=Pattern", isActive: true },
  { id: "courses", label: "Сургалт", href: "/products?category=Сургалт", isActive: true },
  { id: "kits", label: "Материалын багц", href: "/products?category=Материалын багц", isActive: true },
  { id: "featured", label: "Онцлох", href: "/products?filter=featured", isActive: true }
];

const footerMenu = [
  { id: "products", label: "Бүх pattern", href: "/products", isActive: true },
  { id: "shipping", label: "Файл ба хүргэлт", href: "/shipping", isActive: true },
  { id: "returns", label: "Буцаалт", href: "/returns", isActive: true },
  { id: "contact", label: "Холбоо барих", href: "/contact", isActive: true },
  { id: "terms", label: "Нөхцөл", href: "/terms", isActive: true }
];

const categories = [
  {
    name: "Pattern",
    slug: "pattern",
    description: "Арьсан түрийвч, card holder, жижиг цүнх хийх хэв загварууд."
  },
  {
    name: "Сургалт",
    slug: "surgalt",
    description: "Анхан шатны болон сэдэвчилсэн арьсан урлалын online/offline хичээлүүд."
  },
  {
    name: "Материалын багц",
    slug: "materialiin-bagts",
    description: "Pattern эхлэхэд хэрэгтэй арьс, утас, тоноглолын багцууд."
  }
];

const products = [
  {
    name: "Анхан шатны түрийвчний pattern",
    slug: "wallet-pattern-beginner",
    category: "Pattern",
    description:
      "PDF хэлбэрээр хэвлэж ашиглах түрийвчний pattern. Анхлан суралцагчдад зориулж зүсэлт, нүхлэлт, оёдлын дарааллыг ойлгомжтой тэмдэглэсэн.",
    subtitle: "Хэвлээд шууд ашиглах боломжтой, анхны арьсан түрийвч хийх pattern.",
    price: 19000,
    compareAtPrice: 29000,
    image: "/uploads/products/leather-wallet-pattern.svg",
    galleryImages: ["/uploads/products/card-holder-pattern.svg"],
    stock: 100,
    isFeatured: true,
    variants: [
      {
        id: "wallet-pattern-brown",
        color: "Бор",
        size: "PDF",
        sku: "URLAYA-BOR-PDF",
        stock: 100,
        image: "/uploads/products/leather-wallet-pattern.svg"
      },
      {
        id: "wallet-pattern-black",
        color: "Хар",
        size: "PDF",
        sku: "URLAYA-HAR-PDF",
        stock: 100,
        image: "/uploads/products/card-holder-pattern.svg"
      },
      {
        id: "wallet-pattern-red",
        color: "Улаан",
        size: "PDF",
        sku: "URLAYA-ULAAN-PDF",
        stock: 100,
        image: "/uploads/products/starter-kit.svg"
      }
    ],
    bullets: [
      "A4 дээр хэвлэхэд тохиромжтой PDF pattern",
      "Нүхлэлт, нугалаас, ирмэгийн тэмдэглэгээтэй",
      "Анхан шатны оёдлын дарааллын тайлбартай"
    ],
    specs: [
      "Файл: PDF pattern",
      "Түвшин: Анхан шат",
      "Зөвлөмж: 1.2-1.6мм vegetable leather",
      "Бүтээл: bifold wallet"
    ],
    stories: [
      {
        title: "Эхний түрийвчээ айхгүй эхлүүл",
        description:
          "Pattern дээр зүсэх шугам, нүхлэлт, нугалаасын тэмдэглэгээ тусдаа байгаа тул хаанаас эхлэхээ мэдэхгүй гацахгүй.",
        image: "/uploads/products/leather-wallet-pattern.svg",
        sortOrder: 0
      }
    ]
  },
  {
    name: "Card holder pattern",
    slug: "card-holder-pattern",
    category: "Pattern",
    description:
      "Жижиг, хурдан дуусдаг card holder хийх pattern. Сургалтын эхний бүтээл эсвэл бэлгийн жижиг бүтээгдэхүүн хийхэд тохиромжтой.",
    subtitle: "Цөөн хэсэгтэй, хурдан хийж сурах card holder pattern.",
    price: 15000,
    compareAtPrice: null,
    image: "/uploads/products/card-holder-pattern.svg",
    galleryImages: ["/uploads/products/leather-wallet-pattern.svg"],
    stock: 100,
    isFeatured: true,
    variants: [],
    bullets: ["Хялбар зүсэлттэй", "2-3 картны халаастай", "Гараар оёх дадлага хийхэд тохиромжтой"],
    specs: ["Файл: PDF pattern", "Түвшин: Анхан шат", "Арьс: 1.0-1.4мм", "Хэрэгсэл: хутга, цоологч, утас"],
    stories: []
  },
  {
    name: "Арьсан урлалын анхан шатны сургалт",
    slug: "leathercraft-basic-course",
    category: "Сургалт",
    description:
      "Арьс сонгох, pattern хэвлэх, зүсэх, цоолох, ирмэг боловсруулах, гараар оёх үндсэн техникийг нэг дор үзэх сургалтын багц.",
    subtitle: "Анх удаа арьсан бүтээл хийх гэж байгаа хүмүүст зориулсан хичээл.",
    price: 89000,
    compareAtPrice: 129000,
    image: "/uploads/products/leather-course.svg",
    galleryImages: ["/uploads/products/leather-wallet-pattern.svg", "/uploads/products/starter-kit.svg"],
    stock: 30,
    isFeatured: true,
    variants: [],
    bullets: ["Video хичээл + pattern жишээ", "Материал сонголтын зөвлөгөө", "Гараар оёх үндсэн техник"],
    specs: ["Формат: online сургалт", "Түвшин: анхан шат", "Хугацаа: 2-3 цагийн багц", "Access: төлбөр баталгаажсаны дараа"],
    stories: [
      {
        title: "Зөв дарааллаар сурвал хурдан ахина",
        description:
          "Сургалт нь хэрэгсэл сонгохоос эхлээд эхний бүтээлээ дуусгах хүртэл алхам бүрийг дараалалтай тайлбарлана.",
        image: "/uploads/products/leather-course.svg",
        sortOrder: 0
      }
    ]
  },
  {
    name: "Эхлэгчийн материалын багц",
    slug: "leathercraft-starter-kit",
    category: "Материалын багц",
    description:
      "Түрийвч болон card holder pattern туршихад хэрэгтэй жижиг арьс, утас, тоноглолын багц. Хичээлтэй хамт авахад тохиромжтой.",
    subtitle: "Pattern эхлүүлэхэд хэрэгтэй материалуудыг нэг багцад.",
    price: 59000,
    compareAtPrice: 69000,
    image: "/uploads/products/starter-kit.svg",
    galleryImages: ["/uploads/products/leather-wallet-pattern.svg"],
    stock: 25,
    isFeatured: true,
    variants: [],
    bullets: ["Жижиг арьсны хэсгүүд", "Оёдлын утас", "Тоноглолын basic сонголт"],
    specs: ["Хүргэлт: биет багц", "Түвшин: анхан шат", "Pattern: тусдаа худалдаж авна", "Өнгө: боломжит материалаас хамаарна"],
    stories: []
  }
];

async function main() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category
    });
  }

  const savedProducts = [];

  for (const product of products) {
    const saved = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        category: product.category,
        description: product.description,
        subtitle: product.subtitle,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        currency: "MNT",
        image: product.image,
        galleryImages: product.galleryImages,
        rating: 5,
        stock: product.stock,
        isFeatured: product.isFeatured,
        isActive: true,
        bullets: product.bullets,
        specs: product.specs
      },
      create: {
        name: product.name,
        slug: product.slug,
        category: product.category,
        description: product.description,
        subtitle: product.subtitle,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        currency: "MNT",
        image: product.image,
        galleryImages: product.galleryImages,
        rating: 5,
        stock: product.stock,
        isFeatured: product.isFeatured,
        isActive: true,
        bullets: product.bullets,
        specs: product.specs
      }
    });

    for (const [index, story] of product.stories.entries()) {
      const storyId = `${product.slug}-story-${index + 1}`;
      await prisma.productStory.upsert({
        where: { id: storyId },
        update: {
          title: story.title,
          description: story.description,
          image: story.image,
          sortOrder: story.sortOrder ?? index
        },
        create: {
          id: storyId,
          productId: saved.id,
          title: story.title,
          description: story.description,
          image: story.image,
          sortOrder: story.sortOrder ?? index
        }
      });
    }

    for (const variant of product.variants) {
      await prisma.productVariant.upsert({
        where: { id: variant.id },
        update: {
          productId: saved.id,
          color: variant.color,
          size: variant.size,
          sku: variant.sku,
          stock: variant.stock,
          image: variant.image,
          isActive: true
        },
        create: {
          id: variant.id,
          productId: saved.id,
          color: variant.color,
          size: variant.size,
          sku: variant.sku,
          stock: variant.stock,
          image: variant.image,
          isActive: true
        }
      });
    }

    savedProducts.push(saved);
  }

  const heroProduct = savedProducts.find((product) => product.slug === "wallet-pattern-beginner") ?? savedProducts[0];

  await prisma.storeSetting.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      storeName: "Өөрсдөө урлая",
      storeSubtitle: "Арьсан бүтээлийн pattern, сургалт",
      storeLogo: "/uursduu-urlaya-logo.svg",
      contactPhone: "+976 95958506",
      contactEmail: "narastore.help@gmail.com",
      footerText: "Copyright © Өөрсдөө урлая | Арьсан бүтээлийн pattern ба сургалт",
      announcementText: "ӨӨРСДӨӨ УРЛАЯ | АРЬСАН БҮТЭЭЛИЙН PATTERN, МАТЕРИАЛЫН БАГЦ, СУРГАЛТ",
      shippingText:
        "Digital pattern файлыг төлбөр баталгаажсаны дараа илгээнэ. Материалын багцыг Улаанбаатарт хүргэлтээр, орон нутагт каргогоор явуулна.",
      returnsText:
        "Digital pattern татагдсан болон сургалтын эрх баталгаажсан тохиолдолд буцаалт хийхгүй. Материалын багцад гэмтэл байвал солих хүсэлт авна.",
      warrantyText: "Pattern файл, video хичээлийн access, сургалтын мэдээллийг захиалгын дугаараар баталгаажуулна.",
      helpText: "Pattern унших, материал сонгох, сургалтад бүртгүүлэх талаар асуух зүйл байвал бидэнтэй холбогдоорой.",
      heroProductId: heroProduct.id,
      headerMenuJson: JSON.stringify(headerMenu),
      footerMenuJson: JSON.stringify(footerMenu)
    },
    update: {
      storeName: "Өөрсдөө урлая",
      storeSubtitle: "Арьсан бүтээлийн pattern, сургалт",
      storeLogo: "/uursduu-urlaya-logo.svg",
      contactPhone: "+976 95958506",
      contactEmail: "narastore.help@gmail.com",
      footerText: "Copyright © Өөрсдөө урлая | Арьсан бүтээлийн pattern ба сургалт",
      announcementText: "ӨӨРСДӨӨ УРЛАЯ | АРЬСАН БҮТЭЭЛИЙН PATTERN, МАТЕРИАЛЫН БАГЦ, СУРГАЛТ",
      shippingText:
        "Digital pattern файлыг төлбөр баталгаажсаны дараа илгээнэ. Материалын багцыг Улаанбаатарт хүргэлтээр, орон нутагт каргогоор явуулна.",
      returnsText:
        "Digital pattern татагдсан болон сургалтын эрх баталгаажсан тохиолдолд буцаалт хийхгүй. Материалын багцад гэмтэл байвал солих хүсэлт авна.",
      warrantyText: "Pattern файл, video хичээлийн access, сургалтын мэдээллийг захиалгын дугаараар баталгаажуулна.",
      helpText: "Pattern унших, материал сонгох, сургалтад бүртгүүлэх талаар асуух зүйл байвал бидэнтэй холбогдоорой.",
      heroProductId: heroProduct.id,
      headerMenuJson: JSON.stringify(headerMenu),
      footerMenuJson: JSON.stringify(footerMenu)
    }
  });

  console.log(`Upserted Uursduu Urlaya store settings and ${savedProducts.length} products without deleting existing data.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
