import { prisma } from "@/lib/prisma";

export type PaymentMethodSetting = {
  id: string;
  label: string;
  description: string;
  isActive: boolean;
};

export type PaymentAccountSetting = {
  id: string;
  bank: string;
  owner: string;
  number: string;
  isActive: boolean;
};

export type MenuLinkSetting = {
  id: string;
  label: string;
  href: string;
  isActive: boolean;
};

export const defaultPaymentMethods: PaymentMethodSetting[] = [
  {
    id: "bank_transfer",
    label: "Дансаар шилжүүлэх",
    description: "Банкны данс руу шилжүүлээд гүйлгээний утга дээр утасны дугаараа бичнэ.",
    isActive: true
  },
  {
    id: "qpay",
    label: "QPay",
    description: "QR кодоор төлөх тохиргоог дараа API-тай холбоно.",
    isActive: false
  },
  {
    id: "socialpay",
    label: "SocialPay",
    description: "SocialPay-р төлөх боломжийг checkout дээр харуулна.",
    isActive: false
  },
  {
    id: "storepay",
    label: "StorePay",
    description: "Хувааж төлөх эсвэл зээлээр авах сонголт.",
    isActive: false
  },
  {
    id: "cash_on_delivery",
    label: "Хүргэлтийн үед төлөх",
    description: "Бараа хүрэх үед бэлнээр эсвэл шилжүүлгээр төлнө.",
    isActive: false
  }
];

export const defaultPaymentAccounts: PaymentAccountSetting[] = [
  {
    id: "main",
    bank: "Хаан банк",
    owner: "Сайнбаяр Даваа",
    number: "5015262578",
    isActive: true
  }
];

export const defaultHeaderMenu: MenuLinkSetting[] = [
  { id: "products", label: "Бүх бараа", href: "/products", isActive: true },
  { id: "categories", label: "Ангилал", href: "/categories", isActive: true },
  { id: "new", label: "Шинэ", href: "/products?filter=new", isActive: true },
  { id: "featured", label: "Онцлох", href: "/products?filter=featured", isActive: true }
];

export const defaultFooterMenu: MenuLinkSetting[] = [
  { id: "shipping", label: "Хүргэлт", href: "/shipping", isActive: true },
  { id: "returns", label: "Буцаалт", href: "/returns", isActive: true },
  { id: "contact", label: "Холбоо барих", href: "/contact", isActive: true },
  { id: "partners", label: "Хамтын ажиллагаа", href: "/partners", isActive: true },
  { id: "terms", label: "Нөхцөл", href: "/terms", isActive: true }
];

export const defaultStoreSettings = {
  shippingText: "Улаанбаатар хотод 24-48 цаг, орон нутагт 2-5 хоногт хүргэнэ.",
  returnsText: "Хүлээн авснаас хойш 7 хоногийн дотор солих, буцаах хүсэлт гаргах боломжтой.",
  warrantyText: "Үйлдвэрлэлийн гэмтэлд баталгаа өгнө.",
  helpText: "Асуух зүйл байвал дэлгүүртэй чат эсвэл утсаар холбогдоорой.",
  paymentBank: "Хаан банк",
  paymentAccountOwner: "Сайнбаяр Даваа",
  paymentAccountNumber: "5015262578",
  paymentPhone: "+976 95958506",
  paymentInstructions: "Төлбөр шилжүүлэхдээ гүйлгээний утга дээр захиалга өгсөн утасны дугаараа бичнэ үү.",
  paymentReferenceFormat: "{phone}",
  paymentWarningText: "Захиалга 24 цагийн дотор төлөгдөөгүй бол автоматаар цуцлагдаж болно.",
  shippingUlaanbaatarFee: 12000,
  shippingProvinceFee: 18000,
  freeShippingThreshold: 0,
  paymentMethods: defaultPaymentMethods,
  paymentAccounts: defaultPaymentAccounts,
  storeName: "MartX",
  storeSubtitle: "martx.market.shop",
  storeLogo: "/martx-logo.png",
  contactPhone: "+976 95958506",
  contactEmail: "hello@martx.mn",
  facebookUrl: "#",
  instagramUrl: "#",
  youtubeUrl: "#",
  footerText: "Copyright © All Right Reserved | Powered by MartX",
  announcementText: "MARTX | 200,000₮-С ДЭЭШ ҮНЭТЭЙ ЗАХИАЛГАД ХҮРГЭЛТ ҮНЭГҮЙ",
  heroProductId: "",
  headerMenu: defaultHeaderMenu,
  footerMenu: defaultFooterMenu
};

type RawStoreSetting = {
  shippingText: string | null;
  returnsText: string | null;
  warrantyText: string | null;
  helpText: string | null;
  paymentBank: string | null;
  paymentAccountOwner: string | null;
  paymentAccountNumber: string | null;
  paymentPhone: string | null;
  paymentInstructions: string | null;
  paymentMethodsJson: string | null;
  paymentAccountsJson: string | null;
  paymentReferenceFormat: string | null;
  paymentWarningText: string | null;
  shippingUlaanbaatarFee: number | null;
  shippingProvinceFee: number | null;
  freeShippingThreshold: number | null;
  storeName: string | null;
  storeSubtitle: string | null;
  storeLogo: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  youtubeUrl: string | null;
  footerText: string | null;
  announcementText: string | null;
  heroProductId: string | null;
  headerMenuJson: string | null;
  footerMenuJson: string | null;
};

function parseJsonArray<T>(value: string | null, fallback: T[]) {
  if (!value) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
}

export async function getStoreSettings() {
  try {
    const rows = await prisma.$queryRaw<RawStoreSetting[]>`
      SELECT
        "shippingText",
        "returnsText",
        "warrantyText",
        "helpText",
        "paymentBank",
        "paymentAccountOwner",
        "paymentAccountNumber",
        "paymentPhone",
        "paymentInstructions",
        "paymentMethodsJson",
        "paymentAccountsJson",
        "paymentReferenceFormat",
        "paymentWarningText",
        "shippingUlaanbaatarFee",
        "shippingProvinceFee",
        "freeShippingThreshold",
        "storeName",
        "storeSubtitle",
        "storeLogo",
        "contactPhone",
        "contactEmail",
        "facebookUrl",
        "instagramUrl",
        "youtubeUrl",
        "footerText",
        "announcementText",
        "heroProductId",
        "headerMenuJson",
        "footerMenuJson"
      FROM "StoreSetting"
      WHERE id = 'default'
      LIMIT 1
    `;
    const settings = rows[0];

    return {
      shippingText: settings?.shippingText || defaultStoreSettings.shippingText,
      returnsText: settings?.returnsText || defaultStoreSettings.returnsText,
      warrantyText: settings?.warrantyText || defaultStoreSettings.warrantyText,
      helpText: settings?.helpText || defaultStoreSettings.helpText,
      paymentBank: settings?.paymentBank || defaultStoreSettings.paymentBank,
      paymentAccountOwner: settings?.paymentAccountOwner || defaultStoreSettings.paymentAccountOwner,
      paymentAccountNumber: settings?.paymentAccountNumber || defaultStoreSettings.paymentAccountNumber,
      paymentPhone: settings?.paymentPhone || defaultStoreSettings.paymentPhone,
      paymentInstructions: settings?.paymentInstructions || defaultStoreSettings.paymentInstructions,
      paymentMethods: parseJsonArray<PaymentMethodSetting>(settings?.paymentMethodsJson ?? null, defaultPaymentMethods),
      paymentAccounts: parseJsonArray<PaymentAccountSetting>(settings?.paymentAccountsJson ?? null, [
        {
          id: "main",
          bank: settings?.paymentBank || defaultStoreSettings.paymentBank,
          owner: settings?.paymentAccountOwner || defaultStoreSettings.paymentAccountOwner,
          number: settings?.paymentAccountNumber || defaultStoreSettings.paymentAccountNumber,
          isActive: true
        }
      ]),
      paymentReferenceFormat: settings?.paymentReferenceFormat || defaultStoreSettings.paymentReferenceFormat,
      paymentWarningText: settings?.paymentWarningText || defaultStoreSettings.paymentWarningText,
      shippingUlaanbaatarFee: settings?.shippingUlaanbaatarFee ?? defaultStoreSettings.shippingUlaanbaatarFee,
      shippingProvinceFee: settings?.shippingProvinceFee ?? defaultStoreSettings.shippingProvinceFee,
      freeShippingThreshold: settings?.freeShippingThreshold ?? defaultStoreSettings.freeShippingThreshold,
      storeName: settings?.storeName || defaultStoreSettings.storeName,
      storeSubtitle: settings?.storeSubtitle || defaultStoreSettings.storeSubtitle,
      storeLogo: settings?.storeLogo || defaultStoreSettings.storeLogo,
      contactPhone: settings?.contactPhone || defaultStoreSettings.contactPhone,
      contactEmail: settings?.contactEmail || defaultStoreSettings.contactEmail,
      facebookUrl: settings?.facebookUrl || defaultStoreSettings.facebookUrl,
      instagramUrl: settings?.instagramUrl || defaultStoreSettings.instagramUrl,
      youtubeUrl: settings?.youtubeUrl || defaultStoreSettings.youtubeUrl,
      footerText: settings?.footerText || defaultStoreSettings.footerText,
      announcementText: settings?.announcementText || defaultStoreSettings.announcementText,
      heroProductId: settings?.heroProductId || defaultStoreSettings.heroProductId,
      headerMenu: parseJsonArray<MenuLinkSetting>(settings?.headerMenuJson ?? null, defaultHeaderMenu),
      footerMenu: parseJsonArray<MenuLinkSetting>(settings?.footerMenuJson ?? null, defaultFooterMenu)
    };
  } catch {
    return defaultStoreSettings;
  }
}
