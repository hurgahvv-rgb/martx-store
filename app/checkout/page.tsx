"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { CartItem, readCart, writeCart } from "@/lib/cart";

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
  paymentBank: "Banka",
  paymentAccountOwner: "MartX",
  paymentAccountNumber: "5015262578",
  paymentPhone: "+420 736 924 533",
  paymentInstructions: "Do zprávy pro příjemce napište telefonní číslo uvedené v objednávce.",
  paymentMethods: [
    {
      id: "bank_transfer",
      label: "Bankovní převod",
      description: "Po odeslání objednávky vám zobrazíme platební údaje.",
      isActive: true
    }
  ],
  paymentAccounts: [
    {
      id: "main",
      bank: "Banka",
      owner: "MartX",
      number: "5015262578",
      isActive: true
    }
  ],
  paymentReferenceFormat: "{phone}",
  paymentWarningText: "Objednávka může být zrušena, pokud platba nebude přijata do 24 hodin.",
  shippingUlaanbaatarFee: 0,
  shippingProvinceFee: 5000,
  freeShippingThreshold: 0
};

function formatCzk(price: number) {
  return `${new Intl.NumberFormat("cs-CZ", {
    maximumFractionDigits: 0
  }).format(price)} Kč`;
}

const EUR_TO_CZK_RATE = 24.44;
const deliveryPriceFromEur = (eur: number) => Math.round(eur * EUR_TO_CZK_RATE);

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    city: "Česká republika",
    district: "",
    address: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(defaultPaymentSettings);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("bank_transfer");
  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "home">("pickup");
  const [createAccount, setCreateAccount] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);
  const [couponOpen, setCouponOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);

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
        // Default payment settings keep checkout usable.
      }
    }

    loadPaymentSettings();

    return () => {
      active = false;
    };
  }, []);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const orderCode = useMemo(() => `MX-${Date.now().toString().slice(-6)}`, []);
  const freeShippingThreshold = paymentSettings.freeShippingThreshold;
  const qualifiesForFreeShipping = freeShippingThreshold > 0 && subtotal >= freeShippingThreshold;
  const deliveryOptions = [
    {
      id: "pickup" as const,
      label: "Packeta - výdejní místo",
      helper: "Vybereme nejbližší výdejní místo po potvrzení objednávky.",
      fee: deliveryPriceFromEur(5)
    },
    {
      id: "home" as const,
      label: "Packeta - doručení domů",
      helper: "Doručení na adresu uvedenou níže.",
      fee: deliveryPriceFromEur(7)
    }
  ];
  const selectedDelivery = deliveryOptions.find((option) => option.id === deliveryMethod) ?? deliveryOptions[0];
  const shippingFee = cartItems.length === 0 || qualifiesForFreeShipping ? 0 : selectedDelivery.fee;
  const total = cartItems.length > 0 ? subtotal + shippingFee : 0;

  const updateCustomer = (key: keyof typeof customer, value: string) => {
    const nextValue = key === "phone" ? value.replace(/\D/g, "").slice(0, 9) : value;
    setCustomer((current) => ({ ...current, [key]: nextValue }));
  };

  const handleSubmitOrder = async () => {
    setSubmitError("");

    if (cartItems.length === 0) {
      setSubmitError("Košík je prázdný.");
      return;
    }

    if (!customer.email.trim() || !customer.firstName.trim() || !customer.lastName.trim()) {
      setSubmitError("Vyplňte prosím e-mail, jméno a příjmení.");
      return;
    }

    if (!/^\d{9}$/.test(customer.phone)) {
      setSubmitError("Telefonní číslo musí mít 9 číslic. Například 777123456.");
      return;
    }

    if (!acceptedTerms) {
      setSubmitError("Potvrďte prosím obchodní podmínky a zpracování osobních údajů.");
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
          customer: {
            ...customer,
            district: deliveryMethod === "pickup" ? "Packeta výdejní místo" : selectedDelivery.label
          },
          paymentMethod: selectedPaymentMethod,
          items: cartItems
        })
      });

      const data = (await response.json().catch(() => null)) as { error?: string; orderCode?: string; total?: number } | null;

      if (!response.ok) {
        throw new Error(data?.error ?? "Objednávku se nepodařilo odeslat.");
      }

      writeCart([]);
      const params = new URLSearchParams({
        order: data?.orderCode ?? orderCode,
        total: String(data?.total ?? total),
        phone: customer.phone
      });

      router.push(`/thank-you?${params.toString()}`);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Objednávku se nepodařilo odeslat.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="public-shell bg-white">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8 lg:py-20">
        <div className="max-w-2xl">
          <h1 className="font-serif text-5xl font-normal tracking-tight text-stone-950">Pokladna</h1>

          <section className="mt-12 border-b border-stone-200 pb-8">
            <h2 className="text-xl font-medium text-stone-950">Vaše údaje</h2>
            <CheckoutInput label="E-MAIL" value={customer.email} onChange={(value) => updateCustomer("email", value)} type="email" />
            <div className="grid gap-6 sm:grid-cols-2">
              <CheckoutInput label="JMÉNO" value={customer.firstName} onChange={(value) => updateCustomer("firstName", value)} />
              <CheckoutInput label="PŘÍJMENÍ" value={customer.lastName} onChange={(value) => updateCustomer("lastName", value)} />
            </div>
            <CheckoutInput
              label="TELEFON"
              value={customer.phone}
              onChange={(value) => updateCustomer("phone", value)}
              type="tel"
              inputMode="numeric"
              maxLength={9}
              helper="České telefonní číslo napište bez předvolby, 9 číslic."
            />
          </section>

          <section className="border-b border-stone-200 py-8">
            <h2 className="text-xl font-medium text-stone-950">Doručení</h2>
            <div className="mt-7 space-y-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-400">ZEMĚ</p>
                <p className="mt-5 border-b border-stone-200 pb-4 text-sm text-stone-950">Česká republika</p>
              </div>

              {freeShippingThreshold > 0 && !qualifiesForFreeShipping ? (
                <div className="text-sm text-stone-500">
                  <p>
                    Do dopravy zdarma chybí ještě {formatCzk(Math.max(freeShippingThreshold - subtotal, 0))}.
                  </p>
                  <div className="mt-3 h-1.5 bg-stone-100">
                    <div
                      className="h-full bg-[#9f8767]"
                      style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
                    />
                  </div>
                </div>
              ) : null}

              <div className="grid gap-2">
                {deliveryOptions.map((option) => (
                  <label
                    key={option.id}
                    className={[
                      "flex cursor-pointer items-center justify-between border px-4 py-4 text-sm transition",
                      deliveryMethod === option.id ? "border-stone-950" : "border-stone-200 hover:border-stone-400"
                    ].join(" ")}
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="delivery"
                        checked={deliveryMethod === option.id}
                        onChange={() => setDeliveryMethod(option.id)}
                        className="h-4 w-4 accent-stone-950"
                      />
                      <span>
                        <span className="block text-stone-950">{option.label}</span>
                        <span className="mt-1 block text-xs text-stone-500">{option.helper}</span>
                      </span>
                    </span>
                    <span className="shrink-0 text-stone-600">
                      {qualifiesForFreeShipping ? "Zdarma" : formatCzk(option.fee)}
                    </span>
                  </label>
                ))}
              </div>

              {deliveryMethod === "pickup" ? (
                <button
                  type="button"
                  className="w-full border border-stone-950 px-5 py-4 text-sm font-medium text-stone-950 transition hover:bg-stone-950 hover:text-white"
                >
                  Vybrat výdejní místo
                </button>
              ) : null}

            </div>
          </section>

          <section className="border-b border-stone-200 py-8">
            <h2 className="text-xl font-medium text-stone-950">Ateliér</h2>
            <label className="mt-6 flex cursor-pointer items-start gap-3 text-sm text-stone-950">
              <input
                type="checkbox"
                checked={createAccount}
                onChange={(event) => setCreateAccount(event.target.checked)}
                className="mt-1 h-4 w-4 rounded-none accent-stone-950"
              />
              <span>
                <span className="block">Vytvořte mi účet v ateliéru</span>
                <span className="mt-2 block max-w-xl text-xs leading-6 text-stone-500">
                  Rychlejší další objednávka, přehled o dopravě a jednodušší vrácení zboží. Účet vytvoříme z údajů, které jste zadali.
                </span>
              </span>
            </label>
          </section>

          <section className="border-b border-stone-200 py-8">
            <h2 className="text-xl font-medium text-stone-950">Další možnosti</h2>
            <div className="mt-6 divide-y divide-stone-100 text-sm">
              <OptionToggle open={companyOpen} onClick={() => setCompanyOpen((open) => !open)} title="Nakupuji na firmu" />
              {companyOpen ? <CheckoutInput label="IČO / FIRMA" value={customer.district} onChange={(value) => updateCustomer("district", value)} /> : null}
              <OptionToggle open={couponOpen} onClick={() => setCouponOpen((open) => !open)} title="Mám dárkovou poukázku nebo kód" />
              {couponOpen ? <CheckoutInput label="KÓD" value="" onChange={() => undefined} /> : null}
              <OptionToggle open={noteOpen} onClick={() => setNoteOpen((open) => !open)} title="Chci přidat poznámku k objednávce" />
              {noteOpen ? <CheckoutInput label="POZNÁMKA" value={customer.address} onChange={(value) => updateCustomer("address", value)} /> : null}
            </div>
          </section>

          <div className="mt-8 bg-[#e8ded0] px-5 py-4 text-sm leading-7 text-[#876947]">
            ✦ Platíte bankovním převodem. Hned po odeslání objednávky vám ukážeme QR kód a platební údaje - zaplatit můžete do pěti dnů.
          </div>

          <label className="mt-8 flex cursor-pointer items-start gap-3 text-sm leading-6 text-stone-600">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(event) => setAcceptedTerms(event.target.checked)}
              className="mt-1 h-4 w-4 rounded-none accent-stone-950"
            />
            <span>
              Potvrzuji, že jsem se seznámil/a s{" "}
              <a href="/terms" className="text-stone-950 underline">
                obchodními podmínkami
              </a>{" "}
              a zásadami zpracování osobních údajů.
            </span>
          </label>

          <div className="mt-6 flex flex-wrap justify-center gap-5 text-xs text-stone-400">
            <span>Šité v našem ateliéru</span>
            <span>Vrácení do 14 dní</span>
            <span>Platba převodem</span>
          </div>

          {submitError ? (
            <p className="mt-6 border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">{submitError}</p>
          ) : null}

          <button
            type="button"
            disabled={cartItems.length === 0 || submitting}
            onClick={handleSubmitOrder}
            className="mt-6 w-full bg-[#2d241f] px-6 py-4 text-xs font-bold uppercase tracking-[0.22em] text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-stone-300"
          >
            {submitting ? "ODESÍLÁM..." : `OBJEDNAT S POVINNOSTÍ PLATBY · ${formatCzk(total)}`}
          </button>
        </div>

        <aside className="h-fit bg-[#f8f7f5] p-6 lg:sticky lg:top-28">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-400">SOUHRN</p>

          <div className="mt-5 divide-y divide-stone-200">
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <div key={`${item.productId}-${item.variant}`} className="py-4">
                  <div className="flex items-start justify-between gap-4 text-sm">
                    <div className="min-w-0">
                      <p className="truncate text-stone-950">{item.name}</p>
                      <p className="mt-1 text-xs text-stone-500">
                        {item.variant === "Bez varianty" ? "Bez varianty" : item.variant} · x {item.quantity}
                      </p>
                    </div>
                    <p className="shrink-0 text-stone-950">{formatCzk(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-4 text-sm leading-6 text-stone-500">Košík je prázdný.</p>
            )}
          </div>

          <div className="mt-4 space-y-4 border-t border-stone-200 pt-5 text-sm text-stone-600">
            <SummaryRow label="Mezisoučet" value={formatCzk(subtotal)} />
            <SummaryRow label="Doprava" value={cartItems.length > 0 ? formatCzk(shippingFee) : formatCzk(0)} />
            {qualifiesForFreeShipping ? <SummaryRow label="Doprava zdarma" value="Ano" /> : null}
            <div className="flex items-end justify-between border-t border-stone-200 pt-5">
              <span>Celkem</span>
              <span className="font-serif text-3xl text-stone-950">{formatCzk(total)}</span>
            </div>
          </div>

        </aside>
      </div>
    </section>
  );
}

function CheckoutInput({
  label,
  value,
  onChange,
  type = "text",
  inputMode,
  maxLength,
  helper
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  inputMode?: "numeric";
  maxLength?: number;
  helper?: string;
}) {
  return (
    <label className="mt-6 block">
      <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-400">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        inputMode={inputMode}
        maxLength={maxLength}
        className="mt-3 w-full border-0 border-b border-stone-200 bg-transparent px-0 py-3 text-base text-stone-950 outline-none transition placeholder:text-stone-300 focus:border-stone-950 focus:ring-0"
      />
      {helper ? <span className="mt-2 block text-xs text-stone-400">{helper}</span> : null}
    </label>
  );
}

function OptionToggle({ title, open, onClick }: { title: string; open: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 py-3 text-left text-stone-950 transition hover:text-stone-600"
    >
      <span className="w-3 text-center text-stone-500">{open ? "-" : "+"}</span>
      <span>{title}</span>
    </button>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span>{label}</span>
      <span className="text-stone-950">{value}</span>
    </div>
  );
}
