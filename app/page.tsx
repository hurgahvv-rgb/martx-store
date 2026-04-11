import Link from "next/link";
import Image from "next/image";

import { ProductCard } from "@/components/product-card";
import { featuredProducts, formatPrice, products } from "@/lib/data";

const categories = ["Цүнх", "Хувцас", "Гэр ахуй", "Шинэ коллекц"];
const bannerProduct = products[0];

export default function HomePage() {
  return (
    <div className="bg-[#fbfaf7]">
      <section className="border-b border-stone-200">
        <div className="relative overflow-hidden bg-stone-950">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${bannerProduct.image})` }}
          />
          <div className="absolute inset-0 bg-black/55" />

          <div className="relative flex min-h-[540px] items-center justify-center px-6 py-16 text-center text-white sm:px-10 lg:min-h-[640px]">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-white/70">
                MartX онцлох бүтээгдэхүүн
              </p>
              <h1 className="mt-6 text-4xl font-medium leading-tight sm:text-6xl">
                {bannerProduct.name} - өдөр бүр барихад дэгжин minimal сонголт.
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-sm font-medium uppercase tracking-[0.2em] text-white/75 sm:text-base">
                Цэвэр хэлбэр, premium материал, өдөр тутмын хэрэглээнд тохирсон ухаалаг загвар.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href={`/products/${bannerProduct.slug}`}
                  className="bg-white px-8 py-4 text-sm font-semibold text-stone-950 transition hover:bg-stone-100"
                >
                  Дэлгэрэнгүй үзэх
                </Link>
                <Link
                  href="/products"
                  className="border border-white/30 px-8 py-4 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
                >
                  Бүх бараа
                </Link>
              </div>
              <p className="mt-8 text-lg font-medium text-white">
                {formatPrice(bannerProduct.price, bannerProduct.currency)}
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 pb-16 pt-8 text-center sm:px-6 lg:px-8">
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            {categories.map((item) => (
              <span
                key={item}
                className="rounded-full border border-stone-200 bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-stone-600"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-500">
              Best Sellers
            </p>
            <h2 className="mt-3 text-3xl font-medium text-stone-950 sm:text-4xl">Онцлох бараанууд</h2>
          </div>
          <Link href="/products" className="text-sm font-medium text-stone-500 transition hover:text-stone-900">
            Бүгдийг харах
          </Link>
        </div>

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="border-y border-stone-200 bg-[#f3f0ea]">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-500">
              Designed For Daily Use
            </p>
            <h2 className="mt-4 max-w-md text-3xl font-medium leading-tight text-stone-950 sm:text-4xl">
              Цэвэр харагдахуй, удаан хэрэглэгдэх чанарыг зэрэгцүүлсэн цуглуулга.
            </h2>
          </div>
          <div className="space-y-5 text-base leading-8 text-stone-600">
            <p>
              MartX-ийн бүтээгдэхүүн бүр өдөр бүр хэрэглэхэд эвтэйхэн, зураг дээр ч гоё харагдах,
              минимал хэв маягийг барьсан байхаар сонгогдсон.
            </p>
            <p>
              Бид эхний ээлжинд хамгийн их сонирхол татах бараануудыг урд хэсэгт тод гаргаж, доош
              гүйлгэх тусам итгэл төрүүлэх мэдээллүүдийг цэвэрхэн дарааллаар нь харуулж байна.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-500">
              Featured Picks
            </p>
            <h2 className="mt-3 text-3xl font-medium text-stone-950 sm:text-4xl">Сонгомол бүтээгдэхүүн</h2>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {featuredProducts.map((product) => (
            <div key={product.id} className="overflow-hidden rounded-[2.2rem] bg-white">
              <div className="grid gap-0 md:grid-cols-[1fr_0.9fr]">
                <div className="relative min-h-[320px] bg-[#efebe5]">
                  <Image src={product.image} alt={product.name} fill className="object-cover" />
                </div>
                <div className="flex flex-col justify-center p-8 sm:p-10">
                  <p className="text-xs uppercase tracking-[0.28em] text-stone-500">{product.category}</p>
                  <h3 className="mt-4 text-3xl font-medium text-stone-950">{product.name}</h3>
                  <p className="mt-4 text-base leading-8 text-stone-600">{product.description}</p>
                  <p className="mt-6 text-lg font-semibold text-stone-950">
                    {formatPrice(product.price, product.currency)}
                  </p>
                  <Link
                    href={`/products/${product.slug}`}
                    className="mt-8 inline-flex w-fit rounded-full border border-stone-300 px-6 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-900 hover:text-stone-900"
                  >
                    Дэлгэрэнгүй үзэх
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
