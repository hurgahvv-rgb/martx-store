"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, X } from "lucide-react";

import { addCartItem, createCartItem, openCartDrawer } from "@/lib/cart";
import { formatPrice } from "@/lib/data";
import { Product, ProductDetail } from "@/lib/types";

type AccordionKey = "size" | "care" | "question";
type SubmitState = "idle" | "sending" | "success" | "error";

const colorMap: Record<string, string> = {
  black: "#050505",
  cern: "#050505",
  hned: "#6f453d",
  brown: "#6f453d",
  bez: "#c3926f",
  beige: "#c3926f",
  zelen: "#a9c8ac",
  green: "#a9c8ac"
};

function normalizeColor(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function swatchColor(value: string, index: number) {
  const normalized = normalizeColor(value);
  const match = Object.entries(colorMap).find(([key]) => normalized.includes(key));

  if (match) {
    return match[1];
  }

  return ["#050505", "#151515", "#6f453d", "#c3926f", "#a9c8ac"][index % 5];
}

export function ProductPurchasePanel({
  product,
  detail,
  onVariantImageChange
}: {
  product: Product;
  detail: ProductDetail;
  onVariantImageChange?: (image: string) => void;
}) {
  const variantOptions = product.variants?.length
    ? product.variants.map((item, index) => {
        const label = [item.color, item.size].filter(Boolean).join(" / ") || item.sku || "Standard";
        return {
          id: item.id,
          label,
          color: item.color || label,
          image: item.image,
          price: item.price ?? product.price,
          stock: item.stock,
          swatch: swatchColor(item.color || label, index)
        };
      })
    : detail.variants.map((item, index) => ({
        id: undefined,
        label: item,
        color: item,
        image: null,
        price: product.price,
        stock: product.stock ?? 0,
        swatch: swatchColor(item, index)
      }));

  const hasSelectableVariants =
    (product.variants?.length ?? 0) > 0 || detail.variants.some((item) => item.toLowerCase() !== "standard");
  const [variant, setVariant] = useState(variantOptions[0]?.label ?? "Standard");
  const [variantId, setVariantId] = useState<string | undefined>(variantOptions[0]?.id);
  const [added, setAdded] = useState(false);
  const [openItem, setOpenItem] = useState<AccordionKey | null>(null);
  const [questionStatus, setQuestionStatus] = useState<SubmitState>("idle");
  const [questionMessage, setQuestionMessage] = useState("");

  const selectedVariant = variantOptions.find((item) => item.label === variant && item.id === variantId) ?? variantOptions[0];
  const displayPrice = selectedVariant?.price ?? product.price;
  const selectedStock = selectedVariant?.stock ?? product.stock ?? 0;
  const selectedColorLabel = selectedVariant?.color ?? variant;
  const specsText = useMemo(() => detail.specs.join("\n"), [detail.specs]);
  const careText = detail.warranty || "Kůži pravidelně ošetřujte jemným voskem a chraňte před vlhkem a přímým sluncem.";

  const handleAddToCart = () => {
    addCartItem(createCartItem(product, hasSelectableVariants ? variant : "Bez varianty", 1, variantId));
    setAdded(true);
    openCartDrawer();
    window.setTimeout(() => setAdded(false), 1800);
  };

  async function handleQuestionSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setQuestionStatus("sending");
    setQuestionMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "");
    const email = String(formData.get("email") ?? "");
    const phone = String(formData.get("phone") ?? "");
    const question = String(formData.get("question") ?? "");

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        phone,
        comment: `Dotaz k produktu: ${product.name}\nVybraná varianta: ${selectedColorLabel}\n\n${question}`
      })
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setQuestionStatus("error");
      setQuestionMessage(data?.error ?? "Odeslání se nepodařilo. Zkuste to prosím znovu.");
      return;
    }

    form.reset();
    setQuestionStatus("success");
    setQuestionMessage("Dotaz byl odeslán. Brzy se vám ozveme.");
  }

  return (
    <div className="self-start pt-8 lg:pt-10">
      <div className="mb-7 text-sm text-stone-500">
        <Link href="/products" className="transition hover:text-stone-900">
          Obchod
        </Link>
        <span className="mx-1.5">/</span>
        <span>{product.name}</span>
      </div>

      <div className="space-y-4">
        <h1 className="font-serif text-4xl font-normal leading-tight tracking-tight text-[#2d241f] sm:text-5xl">
          {product.name}
        </h1>
        <div className="font-serif text-4xl font-normal text-[#2d241f]">
          {formatPrice(displayPrice, product.currency)}
        </div>
      </div>

      {hasSelectableVariants ? (
        <div className="mt-7">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">
            Barva <span className="normal-case tracking-normal text-emerald-700">- jiná barva skladem</span>
          </p>
          <div className="flex flex-wrap gap-3">
            {variantOptions.map((item) => {
              const isSelected = variant === item.label && variantId === item.id;

              return (
                <button
                  key={`${item.id ?? item.label}`}
                  type="button"
                  onClick={() => {
                    setVariant(item.label);
                    setVariantId(item.id);
                    onVariantImageChange?.(item.image || product.image);
                  }}
                  disabled={item.stock <= 0}
                  className={[
                    "h-10 w-10 rounded-full border transition disabled:cursor-not-allowed disabled:opacity-40",
                    isSelected ? "border-stone-900 p-1" : "border-transparent hover:border-stone-300"
                  ].join(" ")}
                  aria-label={item.label}
                  title={item.label}
                >
                  <span className="block h-full w-full rounded-full" style={{ backgroundColor: item.swatch }} />
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={handleAddToCart}
        disabled={selectedStock <= 0}
        className="mt-8 w-full bg-[#2d241f] px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-stone-300"
      >
        {added ? "Přidáno do košíku" : "Přidat do košíku"}
      </button>

      <p className="mt-4 text-sm text-stone-500">Čas výroby: 2-3 týdny</p>

      <div className="mt-6 border-y border-stone-200">
        <AccordionItem title="Rozmer" isOpen={openItem === "size"} onClick={() => setOpenItem(openItem === "size" ? null : "size")}>
          <div className="whitespace-pre-line">{specsText || "Rozměr doplníme podle vybrané varianty."}</div>
        </AccordionItem>
        <AccordionItem title="Údržba" isOpen={openItem === "care"} onClick={() => setOpenItem(openItem === "care" ? null : "care")}>
          <p>{careText}</p>
          <p className="mt-5">
            Podrobný návod najdete tu:{" "}
            <Link href="/info/starostlivost" className="underline underline-offset-4">
              /info/starostlivost
            </Link>
          </p>
        </AccordionItem>
        <AccordionItem
          title="Máte otázku k tomuto kúsku?"
          isOpen={openItem === "question"}
          onClick={() => setOpenItem(openItem === "question" ? null : "question")}
          eyebrow
        >
          <p className="mb-5">Napište nám - rádi poradíme s velikostí, materiálem, dostupností či úpravou na míru.</p>
          <form onSubmit={handleQuestionSubmit} className="space-y-4">
            <PanelInput label="Meno *" name="name" required />
            <PanelInput label="Email *" name="email" type="email" required />
            <PanelInput label="Telefón" name="phone" />
            <PanelTextarea label="Vaša otázka *" name="question" required />
            <button
              type="submit"
              disabled={questionStatus === "sending"}
              className="bg-[#2d241f] px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-stone-400"
            >
              {questionStatus === "sending" ? "Odesílám" : "Poslať otázku"}
            </button>
            {questionMessage ? (
              <p className={["text-sm", questionStatus === "error" ? "text-red-600" : "text-stone-600"].join(" ")}>
                {questionMessage}
              </p>
            ) : null}
          </form>
        </AccordionItem>
      </div>

      <div className="mt-8 space-y-4">
        <h2 className="text-base font-medium text-stone-950">O produkte</h2>
        <p className="text-sm leading-7 text-stone-600">{detail.subtitle}</p>
        <p className="text-sm leading-7 text-stone-600">{product.description}</p>
      </div>
    </div>
  );
}

function AccordionItem({
  title,
  isOpen,
  onClick,
  children,
  eyebrow = false
}: {
  title: string;
  isOpen: boolean;
  onClick: () => void;
  children: React.ReactNode;
  eyebrow?: boolean;
}) {
  return (
    <div className="border-b border-stone-200 last:border-b-0">
      <button type="button" onClick={onClick} className="flex w-full items-center justify-between gap-4 py-4 text-left">
        <span
          className={
            eyebrow
              ? "text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500"
              : "font-serif text-xl font-normal text-[#2d241f]"
          }
        >
          {title}
        </span>
        {isOpen ? <X size={18} strokeWidth={1.7} /> : <Plus size={20} strokeWidth={1.7} />}
      </button>
      {isOpen ? <div className="pb-7 text-sm leading-7 text-stone-600">{children}</div> : null}
    </div>
  );
}

function PanelInput({ label, name, type = "text", required = false }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        className="mt-2 h-12 w-full border border-stone-200 bg-white px-4 text-sm text-stone-900 outline-none transition focus:border-stone-950"
      />
    </label>
  );
}

function PanelTextarea({ label, name, required = false }: { label: string; name: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">{label}</span>
      <textarea
        name={name}
        required={required}
        className="mt-2 min-h-36 w-full border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-950"
      />
    </label>
  );
}
