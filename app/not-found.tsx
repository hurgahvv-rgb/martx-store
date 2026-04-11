import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
      <p className="text-sm uppercase tracking-[0.25em] text-slate-500">404</p>
      <h1 className="mt-4 text-4xl font-semibold text-ink">Хуудас эсвэл бараа олдсонгүй</h1>
      <p className="mt-4 text-base leading-7 text-slate-600">
        Энэ холбоос хуучирсан эсвэл тухайн бараа каталогоос хасагдсан байж магадгүй.
      </p>
      <Link
        href="/products"
        className="mt-8 inline-flex rounded-full bg-pine px-6 py-3 text-sm font-semibold text-white"
      >
        Барааны жагсаалт руу
      </Link>
    </section>
  );
}
