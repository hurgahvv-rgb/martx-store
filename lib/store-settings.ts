import { shouldSkipDatabaseReads } from "@/lib/database-guard";
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
    label: "Bankovní převod",
    description: "Platbu odešlete na bankovní účet a do zprávy pro příjemce uvedete telefon z objednávky.",
    isActive: true
  },
  {
    id: "qpay",
    label: "QPay",
    description: "Platba přes QR kód bude dostupná po napojení platební brány.",
    isActive: false
  },
  {
    id: "socialpay",
    label: "SocialPay",
    description: "Volitelný způsob platby pro budoucí nastavení.",
    isActive: false
  },
  {
    id: "storepay",
    label: "StorePay",
    description: "Volitelná platba na splátky nebo odložená platba.",
    isActive: false
  },
  {
    id: "cash_on_delivery",
    label: "Dobírka",
    description: "Platba při převzetí zásilky.",
    isActive: false
  }
];

export const defaultPaymentAccounts: PaymentAccountSetting[] = [
  {
    id: "main",
    bank: "Banka",
    owner: "NaRa",
    number: "5020961431",
    isActive: true
  }
];

export const defaultHeaderMenu: MenuLinkSetting[] = [
  { id: "products", label: "Všechny produkty", href: "/products", isActive: true },
  { id: "categories", label: "Kategorie", href: "/categories", isActive: true },
  { id: "new", label: "Novinky", href: "/products?filter=new", isActive: true },
  { id: "featured", label: "Doporučené", href: "/products?filter=featured", isActive: true }
];

export const defaultFooterMenu: MenuLinkSetting[] = [
  { id: "products", label: "Produkty", href: "/products", isActive: true },
  { id: "shipping", label: "Doprava a platba", href: "/info/doprava", isActive: true },
  { id: "returns", label: "Vrácení", href: "/info/vraceni", isActive: true },
  { id: "contact", label: "Kontakt", href: "/info/kontakt", isActive: true },
  { id: "terms", label: "Obchodní podmínky", href: "/info/obchodni-podminky", isActive: true }
];

export const defaultStoreSettings = {
  shippingText: "Dostupné způsoby dopravy a cenu uvidíte v pokladně ještě před odesláním objednávky.",
  returnsText: "Nepoužité zboží můžete vrátit podle podmínek uvedených na stránce Vrácení zboží.",
  warrantyText: "Na vady se vztahují zákonná práva z odpovědnosti za vady.",
  helpText: "Pokud potřebujete poradit s výběrem, napište nám přes kontaktní stránku.",
  paymentBank: "Banka",
  paymentAccountOwner: "NaRa",
  paymentAccountNumber: "5020961431",
  paymentPhone: "+420 736 924 533",
  paymentInstructions: "Při bankovním převodu uveďte do zprávy pro příjemce telefon z objednávky.",
  paymentReferenceFormat: "{phone}",
  paymentWarningText: "Pokud objednávka nebude uhrazena včas, může být zrušena.",
  shippingUlaanbaatarFee: 0,
  shippingProvinceFee: 171,
  freeShippingThreshold: 0,
  paymentMethods: defaultPaymentMethods,
  paymentAccounts: defaultPaymentAccounts,
  storeName: "NaRa",
  storeSubtitle: "Handmade leather bags",
  storeLogo: "/nara-logo.svg",
  contactPhone: "+420 736 924 533",
  contactEmail: "narastore.help@gmail.com",
  facebookUrl: "#",
  instagramUrl: "#",
  youtubeUrl: "#",
  footerText: "Copyright © NaRa | Handmade leather bags",
  announcementText: "NARA | HANDMADE LEATHER BAGS",
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
  if (shouldSkipDatabaseReads()) {
    return defaultStoreSettings;
  }

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
