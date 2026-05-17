"use client";

import Image from "next/image";
import { Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { CartItem, readCart, writeCart } from "@/lib/cart";
import { formatPrice } from "@/lib/data";

const provinces = [
  "Улаанбаатар",
  "Архангай",
  "Баян-Өлгий",
  "Баянхонгор",
  "Булган",
  "Говь-Алтай",
  "Говьсүмбэр",
  "Дархан-Уул",
  "Дорноговь",
  "Дорнод",
  "Дундговь",
  "Завхан",
  "Орхон",
  "Өвөрхангай",
  "Өмнөговь",
  "Сүхбаатар",
  "Сэлэнгэ",
  "Төв",
  "Увс",
  "Ховд",
  "Хөвсгөл",
  "Хэнтий"
];
const ubDistricts = [
  "Багануур",
  "Багахангай",
  "Баянгол",
  "Баянзүрх",
  "Налайх",
  "Сонгинохайрхан",
  "Сүхбаатар",
  "Хан-Уул",
  "Чингэлтэй"
];

type PaymentSettings = {
  paymentBank: string;
  paymentAccountOwner: string;
  paymentAccountNumber: string;
  paymentPhone: string;
  paymentInstructions: string;
  paymentMethods: { id: string; label: string; description: string; isActive: boolean }[];
  paymentAccounts: { id: string; bank: string; owner: string; number: string; isActive: boolean }[];
  paymentReferenceFormat: string;
  paymentWarningText: string;
  shippingUlaanbaatarFee: number;
  shippingProvinceFee: number;
  freeShippingThreshold: number;
};

const defaultPaymentSettings: PaymentSettings = {
  paymentBank: "Хаан банк",
  paymentAccountOwner: "Сайнбаяр Даваа",
  paymentAccountNumber: "5015262578",
  paymentPhone: "+976 95958506",
  paymentInstructions: "Төлбөр шилжүүлэхдээ гүйлгээний утга дээр захиалга өгсөн утасны дугаараа бичнэ үү.",
  paymentMethods: [
    {
      id: "bank_transfer",
      label: "Дансаар шилжүүлэх",
      description: "Банкны данс руу шилжүүлээд гүйлгээний утга дээр утасны дугаараа бичнэ.",
      isActive: true
    }
  ],
  paymentAccounts: [
    {
      id: "main",
      bank: "Хаан банк",
      owner: "Сайнбаяр Даваа",
      number: "5015262578",
      isActive: true
    }
  ],
  paymentReferenceFormat: "{phone}",
  paymentWarningText: "Захиалга 24 цагийн дотор төлөгдөөгүй бол автоматаар цуцлагдаж болно.",
  shippingUlaanbaatarFee: 12000,
  shippingProvinceFee: 18000,
  freeShippingThreshold: 0
};

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    city: "Улаанбаатар",
    district: "",
    address: ""
  });
  const [copied, setCopied] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(defaultPaymentSettings);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("bank_transfer");

  useEffect(() => {
    setCartItems(readCart());
  }, []);

  useEffect(() => {
    let active = true;

    async function loadPaymentSettings() {
      try {
        const response = await fetch("/api/settings/payment", { cache: "no-store" });
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as PaymentSettings;
        if (active) {
          setPaymentSettings(data);
          const firstActiveMethod = data.paymentMethods.find((method) => method.isActive);
          if (firstActiveMethod) {
            setSelectedPaymentMethod(firstActiveMethod.id);
          }
        }
      } catch {
        // Default payment settings keep checkout usable if the API is temporarily unavailable.
      }
    }

    loadPaymentSettings();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setCustomer((current) => ({ ...current, district: "" }));
  }, [customer.city]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const orderCode = useMemo(() => `MX-${Date.now().toString().slice(-6)}`, []);
  const isUlaanbaatar = customer.city === "Улаанбаатар";
  const freeShippingThreshold = paymentSettings.freeShippingThreshold;
  const qualifiesForFreeShipping = freeShippingThreshold > 0 && subtotal >= freeShippingThreshold;
  const shippingFee =
    cartItems.length === 0 || qualifiesForFreeShipping
      ? 0
      : isUlaanbaatar
        ? paymentSettings.shippingUlaanbaatarFee
        : paymentSettings.shippingProvinceFee;
  const total = cartItems.length > 0 ? subtotal + shippingFee : 0;
  const activePaymentMethods = paymentSettings.paymentMethods.filter((method) => method.isActive);
  const activePaymentAccounts = paymentSettings.paymentAccounts.filter((account) => account.isActive);
  const paymentReference = customer.phone || "утасны дугаар";

  const updateCustomer = (key: keyof typeof customer, value: string) => {
    const nextValue = key === "phone" ? value.replace(/\D/g, "").slice(0, 8) : value;
    setCustomer((current) => ({ ...current, [key]: nextValue }));
  };

  const copyToClipboard = async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      setCopied(null);
    }
  };

  const handleSubmitOrder = async () => {
    setSubmitError("");

    if (cartItems.length === 0) {
      setSubmitError("Сагс хоосон байна.");
      return;
    }

    if (!/^\d{8}$/.test(customer.phone)) {
      setSubmitError("Утасны дугаар 8 оронтой байх ёстой. Жишээ: 99112233");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          orderCode,
          total,
          subtotal,
          shippingFee,
          customer,
          paymentMethod: selectedPaymentMethod,
          items: cartItems
        })
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Захиалгын email илгээхэд алдаа гарлаа.");
      }

      writeCart([]);
      const params = new URLSearchParams({
        order: orderCode,
        total: String(total),
        phone: customer.phone
      });

      router.push(`/thank-you?${params.toString()}`);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Захиалга илгээхэд алдаа гарлаа.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          <div className="glass-panel space-y-6 rounded-[2rem] p-6">
            <div>
              <p className="section-title text-sm text-slate-500">Төлбөр</p>
              <h1 className="mt-2 text-4xl font-semibold text-ink">Хүргэлт ба төлбөр</h1>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Захиалгын мэдээллээ бөглөөд доорх данс руу нийт дүнгээ шилжүүлнэ. Захиалга илгээхэд дэлгүүрийн email рүү мэдээлэл очно.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { key: "firstName", label: "Нэр" },
                { key: "lastName", label: "Овог" },
                { key: "phone", label: "Утас" },
                { key: "email", label: "И-мэйл" }
              ].map((field) => (
                <label key={field.key} className="space-y-2 text-sm text-slate-600">
                  <span>{field.label}</span>
                  <input
                    value={customer[field.key as keyof typeof customer]}
                    onChange={(event) => updateCustomer(field.key as keyof typeof customer, event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 outline-none transition focus:border-ember"
                    placeholder={field.key === "phone" ? "99112233" : field.label}
                    type={field.key === "email" ? "email" : field.key === "phone" ? "tel" : "text"}
                    inputMode={field.key === "phone" ? "numeric" : undefined}
                    maxLength={field.key === "phone" ? 8 : undefined}
                    pattern={field.key === "phone" ? "\\d{8}" : undefined}
                  />
                  {field.key === "phone" ? (
                    <span className="block text-xs text-slate-400">Монгол утасны дугаар 8 оронтой байна.</span>
                  ) : null}
                </label>
              ))}

              <label className="space-y-2 text-sm text-slate-600">
                <span>Хот / Аймаг</span>
                <select
                  value={customer.city}
                  onChange={(event) => updateCustomer("city", event.target.value)}
                  className="w-full cursor-pointer rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 outline-none transition focus:border-ember"
                >
                  {provinces.map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 text-sm text-slate-600">
                <span>{isUlaanbaatar ? "Дүүрэг" : "Сум / хаягийн хэсэг"}</span>
                {isUlaanbaatar ? (
                  <select
                    value={customer.district}
                    onChange={(event) => updateCustomer("district", event.target.value)}
                    className="w-full cursor-pointer rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 outline-none transition focus:border-ember"
                  >
                    <option value="">Дүүрэг сонгох</option>
                    {ubDistricts.map((districtName) => (
                      <option key={districtName} value={districtName}>
                        {districtName}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    value={customer.district}
                    onChange={(event) => updateCustomer("district", event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 outline-none transition focus:border-ember"
                    placeholder="Сум, баг эсвэл хүргэлтийн бүс"
                  />
                )}
              </label>
            </div>
            <label className="block space-y-2 text-sm text-slate-600">
              <span>Хаягийн дэлгэрэнгүй</span>
              <textarea
                value={customer.address}
                onChange={(event) => updateCustomer("address", event.target.value)}
                className="min-h-32 w-full rounded-[1.5rem] border border-slate-200 bg-white/80 px-4 py-3 outline-none transition focus:border-ember"
                placeholder="Байр, орц, давхар, хүргэлтийн тайлбар"
              />
            </label>
          </div>

          <div className="glass-panel rounded-[2rem] p-6">
            <p className="section-title text-sm text-slate-500">Төлбөрийн арга</p>
            <div className="mt-5 grid gap-3">
              {activePaymentMethods.map((method) => (
                <label
                  key={method.id}
                  className={[
                    "block cursor-pointer rounded-2xl border bg-white/80 p-4 transition",
                    selectedPaymentMethod === method.id ? "border-pine ring-2 ring-pine/10" : "border-slate-200 hover:border-pine/50"
                  ].join(" ")}
                >
                  <span className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={selectedPaymentMethod === method.id}
                      onChange={() => setSelectedPaymentMethod(method.id)}
                      className="mt-1 accent-pine"
                    />
                      <span>
                        <span className="block font-semibold text-ink">{method.label}</span>
                      <span className="mt-1 block text-sm leading-6 text-slate-500">
                        {method.id === "bank_transfer"
                          ? "Банкны данс руу шилжүүлээд гүйлгээний утга дээр утасны дугаараа бичнэ."
                          : method.description}
                      </span>
                    </span>
                  </span>
                </label>
              ))}
            </div>

            <p className="section-title mt-7 text-sm text-slate-500">Дансаар шилжүүлэх</p>
            <div className="mt-5 grid gap-3">
              {activePaymentAccounts.map((account) => (
                <div key={account.id} className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{account.bank}</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {[
                      { label: "Данс эзэмшигч", value: account.owner, key: `${account.id}-owner` },
                      { label: "Дансны дугаар", value: account.number, key: `${account.id}-number` }
                    ].map((item) => (
                      <CopyRow key={item.key} item={item} copied={copied} onCopy={copyToClipboard} />
                    ))}
                  </div>
                </div>
              ))}

              {[
                { label: "Гүйлгээний утга", value: paymentReference, key: "order" },
                { label: "Төлөх дүн", value: formatPrice(total, "MNT"), key: "amount" }
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/80 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
                    <p className="mt-1 text-lg font-semibold text-ink">{item.value}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(item.value, item.key)}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-pine hover:text-pine"
                  >
                    <Copy size={15} />
                    {copied === item.key ? "Хууллаа" : "Хуулах"}
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm leading-7 text-amber-900">
              Төлбөр шилжүүлэхдээ гүйлгээний утга дээр захиалга өгсөн утасны дугаараа бичнэ үү. Бид банкны гүйлгээний утга дээрх утсаар захиалгыг таньж баталгаажуулна.
              <br />
              {paymentSettings.paymentWarningText}
            </div>
          </div>
        </div>

        <aside className="h-fit rounded-[2rem] bg-gradient-to-br from-pine via-[#2f5d53] to-[#164e63] p-6 text-white shadow-card">
          <p className="section-title text-sm text-sand">Захиалгын товчоо</p>

          <div className="mt-5 space-y-4">
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <div key={`${item.productId}-${item.variant}`} className="flex gap-3 rounded-2xl bg-white/10 p-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white/10">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{item.name}</p>
                    <p className="mt-1 text-xs text-white/70">
                      {item.variant} · {item.quantity}ш
                    </p>
                    <p className="mt-1 text-sm font-semibold">
                      {formatPrice(item.price * item.quantity, item.currency)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-2xl bg-white/10 p-4 text-sm leading-7 text-white/80">
                Сагс хоосон байна. Бүтээгдэхүүн сонгоод checkout руу орно уу.
              </p>
            )}
          </div>

          <div className="mt-6 space-y-3 border-t border-white/20 pt-5 text-sm text-white/85">
            <div className="flex justify-between">
              <span>Барааны дүн</span>
              <span>{formatPrice(subtotal, "MNT")}</span>
            </div>
            <div className="flex justify-between">
              <span>Хүргэлт</span>
              <span>{cartItems.length > 0 ? formatPrice(shippingFee, "MNT") : formatPrice(0, "MNT")}</span>
            </div>
            {qualifiesForFreeShipping ? (
              <div className="flex justify-between text-emerald-100">
                <span>Үнэгүй хүргэлт</span>
                <span>{formatPrice(freeShippingThreshold, "MNT")}+</span>
              </div>
            ) : null}
            <div className="flex justify-between pt-3 text-lg font-semibold text-white">
              <span>Нийт</span>
              <span>{formatPrice(total, "MNT")}</span>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-white/10 p-4 text-sm leading-7 text-white/85">
            <p className="font-semibold text-white">Төлбөрийн заавар</p>
            <p className="mt-1">
              Гүйлгээний утга дээр <strong>{paymentReference}</strong> гэж бичээд, нийт {formatPrice(total, "MNT")} шилжүүлнэ.
            </p>
          </div>

          {submitError ? (
            <p className="mt-4 rounded-2xl bg-red-500/20 p-4 text-sm leading-7 text-white">{submitError}</p>
          ) : null}

          <button
            type="button"
            disabled={cartItems.length === 0 || submitting}
            onClick={handleSubmitOrder}
            className="mt-6 w-full rounded-full bg-white px-6 py-3 text-sm font-semibold text-pine transition hover:bg-sand disabled:cursor-not-allowed disabled:bg-white/40"
          >
            {submitting ? "Илгээж байна..." : "Захиалга илгээх"}
          </button>
        </aside>
      </div>
    </section>
  );
}

function CopyRow({
  item,
  copied,
  onCopy
}: {
  item: { label: string; value: string; key: string };
  copied: string | null;
  onCopy: (value: string, key: string) => Promise<void>;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
      <p className="mt-1 font-semibold text-ink">{item.value}</p>
      <button
        type="button"
        onClick={() => onCopy(item.value, item.key)}
        className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-pine"
      >
        <Copy size={15} />
        {copied === item.key ? "Хууллаа" : "Хуулах"}
      </button>
    </div>
  );
}
