"use client";

import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { ImageUploadField } from "@/components/image-upload-field";

type VariantRow = {
  color: string;
  size: string;
  price: string;
  stock: string;
  sku: string;
  image: string;
};

const emptyRow: VariantRow = {
  color: "",
  size: "",
  price: "",
  stock: "",
  sku: "",
  image: ""
};

const commonColors = [
  { label: "Хар", className: "border-slate-950 bg-slate-950 text-white" },
  { label: "Цагаан", className: "border-slate-300 bg-white text-slate-900" },
  { label: "Саарал", className: "border-slate-400 bg-slate-300 text-slate-950" },
  { label: "Улаан", className: "border-red-600 bg-red-600 text-white" },
  { label: "Цэнхэр", className: "border-blue-600 bg-blue-600 text-white" },
  { label: "Ногоон", className: "border-emerald-600 bg-emerald-600 text-white" },
  { label: "Шар", className: "border-yellow-300 bg-yellow-300 text-yellow-950" },
  { label: "Бор", className: "border-amber-900 bg-amber-800 text-white" },
  { label: "Ягаан", className: "border-pink-400 bg-pink-300 text-pink-950" },
  { label: "Шаргал", className: "border-stone-300 bg-stone-200 text-stone-950" }
];
const commonSizes = ["XS", "S", "M", "L", "XL", "XXL", "36", "37", "38", "39", "40", "41", "42", "43"];

function parseInitialValue(value?: string) {
  const rows =
    value
      ?.split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [color = "", size = "", price = "", stock = "", sku = "", image = ""] = line
          .split("|")
          .map((item) => item.trim());

        return { color, size, price, stock, sku, image };
      }) ?? [];

  return rows.length > 0 ? rows : [{ ...emptyRow }];
}

function serializeRows(rows: VariantRow[]) {
  return rows
    .map((row) => [row.color, row.size, row.price, row.stock, row.sku, row.image].join(" | "))
    .join("\n");
}

export function VariantEditor({ name, initialValue }: { name: string; initialValue?: string }) {
  const [rows, setRows] = useState<VariantRow[]>(() => parseInitialValue(initialValue));
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [customColors, setCustomColors] = useState("");
  const [customSizes, setCustomSizes] = useState("");
  const [defaultPrice, setDefaultPrice] = useState("");
  const [defaultStock, setDefaultStock] = useState("");
  const [skuPrefix, setSkuPrefix] = useState("MARTX");
  const serialized = useMemo(() => serializeRows(rows), [rows]);

  const buildSku = (color: string, size: string, index: number) => {
    const suffix = [color, size]
      .filter(Boolean)
      .join("-")
      .replace(/\s+/g, "-")
      .replace(/[^\p{L}\p{N}-]/gu, "")
      .toUpperCase();

    return [skuPrefix || "MARTX", suffix || String(index + 1).padStart(3, "0")].join("-");
  };

  const updateRow = (index: number, key: keyof VariantRow, value: string) => {
    setRows((current) =>
      current.map((row, rowIndex) => {
        if (rowIndex !== index) {
          return row;
        }

        const next = { ...row, [key]: value };

        if ((key === "color" || key === "size") && !row.sku) {
          next.sku = buildSku(next.color, next.size, index);
        }

        return next;
      })
    );
  };

  const addRow = () => {
    setRows((current) => [...current, { ...emptyRow }]);
  };

  const removeRow = (index: number) => {
    setRows((current) => (current.length === 1 ? [{ ...emptyRow }] : current.filter((_, rowIndex) => rowIndex !== index)));
  };

  const toggleValue = (value: string, selected: string[], setSelected: (values: string[]) => void) => {
    setSelected(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]);
  };

  const parseCustomValues = (value: string) => {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const generateVariants = () => {
    const colorValues = Array.from(new Set([...selectedColors, ...parseCustomValues(customColors)]));
    const sizeValues = Array.from(new Set([...selectedSizes, ...parseCustomValues(customSizes)]));
    const finalColors = colorValues.length > 0 ? colorValues : [""];
    const finalSizes = sizeValues.length > 0 ? sizeValues : [""];

    const generated = finalColors.flatMap((color) =>
      finalSizes.map((size, index) => ({
        color,
        size,
        price: defaultPrice,
        stock: defaultStock,
        sku: buildSku(color, size, index),
        image: ""
      }))
    );

    setRows(generated.length > 0 ? generated : [{ ...emptyRow }]);
  };

  return (
    <div className="xl:col-span-4">
      <input type="hidden" name={name} value={serialized} />

      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-700">Өнгө, хэмжээний сонголт</p>
          <p className="mt-1 text-xs text-slate-400">
            Нэг бараа олон өнгө эсвэл хэмжээтэй бол энд сонголтуудыг үүсгэнэ. Жишээ: Хар / M, Хар / L, Цагаан / M.
          </p>
        </div>
        <button
          type="button"
          onClick={addRow}
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700"
        >
          <Plus size={16} />
          Variant нэмэх
        </button>
      </div>

      <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
        <div className="mb-3">
          <p className="text-sm font-bold text-blue-950">Автоматаар олон сонголт үүсгэх</p>
          <p className="mt-1 text-xs leading-5 text-blue-800">
            Өнгө, хэмжээг таслалаар бичээд товч дарна. Хэрэггүй бол хоосон орхиод доорх мөрүүдийг гараар бөглөж болно.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_1fr_120px_120px_130px_auto]">
          <div className="md:col-span-2">
            <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.12em] text-blue-800">Өнгө сонгох</span>
            <div className="flex flex-wrap gap-2">
              {commonColors.map((color) => (
                <button
                  key={color.label}
                  type="button"
                  onClick={() => toggleValue(color.label, selectedColors, setSelectedColors)}
                  className={[
                    "rounded-full border px-3 py-1.5 text-xs font-bold shadow-sm transition",
                    color.className,
                    selectedColors.includes(color.label) ? "ring-2 ring-blue-500 ring-offset-2" : "opacity-85 hover:opacity-100"
                  ].join(" ")}
                >
                  {color.label}
                </button>
              ))}
            </div>
            <input
              value={customColors}
              onChange={(event) => setCustomColors(event.target.value)}
              placeholder="Өөр өнгө нэмэх: Алтлаг, Мөнгөлөг"
              className="mt-3 w-full rounded-lg border border-blue-100 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.12em] text-blue-800">Хэмжээ сонгох</span>
            <div className="flex flex-wrap gap-2">
              {commonSizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleValue(size, selectedSizes, setSelectedSizes)}
                  className={[
                    "rounded-full border px-3 py-1.5 text-xs font-semibold",
                    selectedSizes.includes(size) ? "border-blue-600 bg-blue-600 text-white" : "border-blue-100 bg-white text-blue-900"
                  ].join(" ")}
                >
                  {size}
                </button>
              ))}
            </div>
            <input
              value={customSizes}
              onChange={(event) => setCustomSizes(event.target.value)}
              placeholder="Өөр хэмжээ нэмэх: 44, 45 эсвэл Free"
              className="mt-3 w-full rounded-lg border border-blue-100 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>
          <div className="hidden xl:block" />
          <div className="hidden xl:block" />
          <LabeledInput label="Нэг бүрийн үнэ">
            <input
              value={defaultPrice}
              onChange={(event) => setDefaultPrice(event.target.value)}
              placeholder="99000"
              type="number"
              className="w-full rounded-lg border border-blue-100 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </LabeledInput>
          <LabeledInput label="Нэг бүрийн үлдэгдэл">
            <input
              value={defaultStock}
              onChange={(event) => setDefaultStock(event.target.value)}
              placeholder="10"
              type="number"
              className="w-full rounded-lg border border-blue-100 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </LabeledInput>
          <LabeledInput label="SKU автоматаар">
            <input
              value={skuPrefix}
              onChange={(event) => setSkuPrefix(event.target.value)}
              placeholder="MARTX"
              className="w-full rounded-lg border border-blue-100 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </LabeledInput>
          <button
            type="button"
            onClick={generateVariants}
            className="self-end rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white"
          >
            Сонголт үүсгэх
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {rows.map((row, index) => (
          <div key={index} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_1fr_120px_110px_1fr_1.2fr_auto]">
              <input
                value={row.color}
                onChange={(event) => updateRow(index, "color", event.target.value)}
                placeholder="Өнгө"
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
              <input
                value={row.size}
                onChange={(event) => updateRow(index, "size", event.target.value)}
                placeholder="Хэмжээ"
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
              <input
                value={row.price}
                onChange={(event) => updateRow(index, "price", event.target.value)}
                placeholder="Үнэ"
                type="number"
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
              <input
                value={row.stock}
                onChange={(event) => updateRow(index, "stock", event.target.value)}
                placeholder="Үлдэгдэл"
                type="number"
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
              <input
                value={row.sku}
                onChange={(event) => updateRow(index, "sku", event.target.value)}
                placeholder="SKU"
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
              <ImageUploadField name={`variantImageFile_${index}`} label={row.image ? "Зураг солих" : "Зураг сонгох"} />
              <button
                type="button"
                onClick={() => removeRow(index)}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-red-100 bg-white px-3 text-red-600"
                aria-label="Variant устгах"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LabeledInput({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label>
      <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.12em] text-blue-800">{label}</span>
      {children}
    </label>
  );
}
