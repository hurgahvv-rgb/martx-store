"use client";

import Image from "next/image";
import { Camera, Star } from "lucide-react";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";

import { ProductReview } from "@/lib/types";

type ReviewSectionProps = {
  initialReviews: ProductReview[];
};

export function ReviewSection({ initialReviews }: ReviewSectionProps) {
  const [reviews, setReviews] = useState(initialReviews);
  const [isOpen, setIsOpen] = useState(false);
  const [author, setAuthor] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [rating, setRating] = useState(5);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const reviewCount = reviews.length;
  const average = useMemo(() => {
    if (reviews.length === 0) {
      return "0.0";
    }

    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  }, [reviews]);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      setImagePreview(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImagePreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!author.trim() || !title.trim() || !body.trim()) {
      return;
    }

    const newReview: ProductReview = {
      author: author.trim(),
      title: title.trim(),
      body: body.trim(),
      rating,
      image: imagePreview ?? undefined
    };

    setReviews((current) => [newReview, ...current]);
    setAuthor("");
    setTitle("");
    setBody("");
    setRating(5);
    setImagePreview(null);
    setIsOpen(false);
  };

  return (
    <section className="border-t border-stone-200 bg-[#f3efe8]">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-500">Reviews</p>
            <h2 className="mt-3 text-3xl font-medium text-stone-950 sm:text-4xl">
              Худалдан авагчдын сэтгэгдэл
            </h2>
            <p className="mt-3 text-sm text-stone-600">
              Дундаж үнэлгээ {average} / 5 · {reviewCount} сэтгэгдэл
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            className="rounded-2xl border border-stone-300 bg-white px-6 py-3 text-sm font-medium text-stone-900 transition hover:border-stone-900"
          >
            Сэтгэгдэл бичих
          </button>
        </div>

        {isOpen && (
          <form
            onSubmit={handleSubmit}
            className="mb-8 space-y-5 bg-[#faf8f4] p-6 shadow-[0_20px_50px_-36px_rgba(28,25,23,0.2)]"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-stone-700">
                <span>Нэр</span>
                <input
                  value={author}
                  onChange={(event) => setAuthor(event.target.value)}
                  className="w-full border border-stone-300 bg-white px-4 py-3 outline-none transition focus:border-stone-900"
                  placeholder="Таны нэр"
                />
              </label>

              <label className="space-y-2 text-sm text-stone-700">
                <span>Гарчиг</span>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="w-full border border-stone-300 bg-white px-4 py-3 outline-none transition focus:border-stone-900"
                  placeholder="Сэтгэгдлийн гарчиг"
                />
              </label>
            </div>

            <div className="space-y-2 text-sm text-stone-700">
              <span>Үнэлгээ</span>
              <div className="flex items-center gap-2">
                {Array.from({ length: 5 }).map((_, index) => {
                  const starValue = index + 1;
                  const active = starValue <= rating;

                  return (
                    <button
                      key={starValue}
                      type="button"
                      onClick={() => setRating(starValue)}
                      className="text-stone-900"
                    >
                      <Star
                        size={18}
                        className={active ? "fill-stone-900 text-stone-900" : "text-stone-300"}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="block space-y-2 text-sm text-stone-700">
              <span>Сэтгэгдэл</span>
              <textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                className="min-h-32 w-full border border-stone-300 bg-white px-4 py-3 outline-none transition focus:border-stone-900"
                placeholder="Бүтээгдэхүүний талаар сэтгэгдлээ бичнэ үү"
              />
            </label>

            <div className="space-y-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-700 transition hover:border-stone-900">
                <Camera size={16} />
                <span>Зураг нэмэх</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>

              {imagePreview && (
                <div className="relative h-28 w-28 overflow-hidden border border-stone-200 bg-white">
                  <Image src={imagePreview} alt="Review upload preview" fill className="object-cover" />
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="rounded-full bg-stone-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
              >
                Сэтгэгдэл хадгалах
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full border border-stone-300 px-6 py-3 text-sm font-semibold text-stone-700"
              >
                Болих
              </button>
            </div>
          </form>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <article
                key={`${review.author}-${review.title}-${review.body}`}
                className="bg-[#faf8f4] p-6 shadow-[0_20px_50px_-36px_rgba(28,25,23,0.2)]"
              >
                <div className="flex items-center gap-1 text-stone-900">
                  {Array.from({ length: review.rating }).map((_, index) => (
                    <Star key={index} size={15} className="fill-stone-900 text-stone-900" />
                  ))}
                </div>
                <h3 className="mt-4 text-lg font-medium text-stone-950">{review.title}</h3>
                <p className="mt-3 text-sm leading-7 text-stone-600">{review.body}</p>
                {review.image && (
                  <div className="relative mt-5 aspect-[4/3] overflow-hidden bg-stone-100">
                    <Image src={review.image} alt={review.title} fill className="object-cover" />
                  </div>
                )}
                <p className="mt-5 text-sm font-medium text-stone-900">{review.author}</p>
              </article>
            ))
          ) : (
            <article className="bg-[#faf8f4] p-6 text-sm leading-7 text-stone-600 shadow-[0_20px_50px_-36px_rgba(28,25,23,0.2)] lg:col-span-3">
              Одоогоор сэтгэгдэл байхгүй байна. Эхний сэтгэгдлийг үлдээгээрэй.
            </article>
          )}
        </div>
      </div>
    </section>
  );
}
