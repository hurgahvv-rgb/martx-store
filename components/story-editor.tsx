"use client";

import Image from "next/image";
import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { ImageUploadField } from "@/components/image-upload-field";

type StoryRow = {
  title: string;
  description: string;
  image: string;
};

const emptyStory: StoryRow = {
  title: "",
  description: "",
  image: ""
};

function parseInitialValue(value?: string) {
  const rows =
    value
      ?.split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [title = "", description = "", image = ""] = line.split("|").map((item) => item.trim());
        return { title, description, image };
      }) ?? [];

  return rows.length > 0 ? rows : [{ ...emptyStory }];
}

function serializeRows(rows: StoryRow[]) {
  return rows
    .map((row) => [row.title, row.description, row.image].join(" | "))
    .join("\n");
}

export function StoryEditor({ name, initialValue }: { name: string; initialValue?: string }) {
  const [rows, setRows] = useState<StoryRow[]>(() => parseInitialValue(initialValue));
  const serialized = useMemo(() => serializeRows(rows), [rows]);

  const updateRow = (index: number, key: keyof StoryRow, value: string) => {
    setRows((current) =>
      current.map((row, rowIndex) => (rowIndex === index ? { ...row, [key]: value } : row))
    );
  };

  const addRow = () => setRows((current) => [...current, { ...emptyStory }]);
  const removeRow = (index: number) => {
    setRows((current) => (current.length === 1 ? [{ ...emptyStory }] : current.filter((_, rowIndex) => rowIndex !== index)));
  };

  const removeImage = (index: number) => {
    setRows((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, image: "" } : row)));
  };

  return (
    <section className="xl:col-span-4 overflow-hidden rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-50 via-white to-emerald-50 p-5 shadow-sm">
      <input type="hidden" name={name} value={serialized} />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-800">Доод Product Story хэсэг</p>
          <p className="mt-1 text-sm text-slate-500">Product page-ийн доор гардаг зурагтай тайлбарууд. Олон story нэмж болно.</p>
        </div>
        <button
          type="button"
          onClick={addRow}
          className="inline-flex w-fit items-center gap-2 rounded-xl bg-cyan-700 px-4 py-2 text-sm font-bold text-white"
        >
          <Plus size={16} />
          Story нэмэх
        </button>
      </div>

      <div className="space-y-4">
        {rows.map((row, index) => (
          <div key={index} className="rounded-xl border border-cyan-100 bg-white/85 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-slate-800">Story {index + 1}</p>
              <button
                type="button"
                onClick={() => removeRow(index)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-600"
                aria-label="Story устгах"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <label>
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Story гарчиг</span>
                <input
                  value={row.title}
                  onChange={(event) => updateRow(index, "title", event.target.value)}
                  placeholder="Form & Function"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-600"
                />
              </label>
              <ImageUploadField name={`storyImageFile_${index}`} label="Story зураг upload" />
              <label className="md:col-span-2">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Story тайлбар</span>
                <textarea
                  value={row.description}
                  onChange={(event) => updateRow(index, "description", event.target.value)}
                  placeholder="Энэ хэсэг product page дээр зурагны хажууд гарна."
                  className="min-h-24 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-600"
                />
              </label>
              {row.image ? (
                <div className="md:col-span-2">
                  <input type="hidden" name={`storyExistingImage_${index}`} value={row.image} />
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Одоогийн story зураг</p>
                  <div className="relative h-36 w-52 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                    <Image src={row.image} alt={row.title || "Product story"} fill className="object-cover" sizes="208px" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-red-600 shadow-sm transition hover:bg-red-50"
                      aria-label="Story зураг устгах"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
