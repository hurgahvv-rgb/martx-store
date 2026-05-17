"use client";

import { Trash2 } from "lucide-react";
import { ChangeEvent, useEffect, useRef, useState } from "react";

type Preview = {
  id: string;
  name: string;
  url: string;
  file: File;
};

export function ImageUploadField({
  name,
  multiple = false,
  label = "Зураг сонгох"
}: {
  name: string;
  multiple?: boolean;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previews, setPreviews] = useState<Preview[]>([]);

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [previews]);

  const syncFiles = (nextPreviews: Preview[]) => {
    if (!inputRef.current) {
      return;
    }

    const transfer = new DataTransfer();
    nextPreviews.forEach((preview) => transfer.items.add(preview.file));
    inputRef.current.files = transfer.files;
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).filter((file) => file.type.startsWith("image/"));
    const nextPreviews = files.map((file) => ({
      id: `${file.name}-${file.lastModified}-${file.size}`,
      name: file.name,
      url: URL.createObjectURL(file),
      file
    }));

    setPreviews(nextPreviews);
  };

  const removePreview = (id: string) => {
    setPreviews((current) => {
      const next = current.filter((preview) => preview.id !== id);
      const removed = current.find((preview) => preview.id === id);

      if (removed) {
        URL.revokeObjectURL(removed.url);
      }

      syncFiles(next);
      return next;
    });
  };

  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-600">
      <span className="block font-medium">{label}</span>
      <input
        ref={inputRef}
        name={name}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleChange}
        className="mt-2 block w-full text-sm"
      />

      {previews.length > 0 ? (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {previews.map((preview) => (
            <div key={preview.id} className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-2">
              <div className="relative aspect-square overflow-hidden rounded-md bg-slate-100">
                <img src={preview.url} alt={preview.name} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePreview(preview.id)}
                  className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-red-600 shadow-sm transition hover:bg-red-50"
                  aria-label="Сонгосон зураг устгах"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <p className="mt-2 truncate text-xs text-slate-500">{preview.name}</p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
