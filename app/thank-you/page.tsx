import Link from "next/link";
import { CheckCircle2, Copy, MessageCircle } from "lucide-react";

import { formatPrice } from "@/lib/data";

const bankAccount = {
  bank: "Хаан банк",
  owner: "Сайнбаяр Даваа",
  number: "5015262578",
  phone: "+976 7777-0000"
};

type ThankYouPageProps = {
  searchParams: Promise<{
    order?: string;
    total?: string;
  }>;
};

export default async function ThankYouPage({ searchParams }: ThankYouPageProps) {
  const params = await searchParams;
  const orderCode = params.order ?? "MX-000000";
  const total = Number(params.total ?? 0);

  return (
    <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-[2.5rem] bg-white p-8 text-center shadow-card sm:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-pine">
          <CheckCircle2 size={34} />
        </div>

        <p className="section-title mt-6 text-sm text-slate-500">Захиалга хүлээн авлаа</p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight text-ink sm:text-5xl">
          Баярлалаа, таны захиалга бүртгэгдлээ
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600">
          Төлбөрөө доорх данс руу шилжүүлээд, гүйлгээний screenshot болон захиалгын кодоо бидэнд илгээнэ үү.
          Төлбөр баталгаажсаны дараа хүргэлтэд гаргана.
        </p>

        <div className="mx-auto mt-8 grid max-w-2xl gap-3 text-left">
          {[
            { label: "Захиалгын код", value: orderCode },
            { label: "Төлөх дүн", value: formatPrice(total, "MNT") },
            { label: "Банк", value: bankAccount.bank },
            { label: "Данс эзэмшигч", value: bankAccount.owner },
            { label: "Дансны дугаар", value: bankAccount.number }
          ].map((item) => (
            <div
              key={item.label}
              className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
                <p className="mt-1 text-lg font-semibold text-ink">{item.value}</p>
              </div>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500">
                <Copy size={15} />
                Хуулах боломжтой
              </span>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-8 max-w-2xl rounded-2xl bg-amber-50 p-5 text-left text-sm leading-7 text-amber-900">
          <div className="flex gap-3">
            <MessageCircle className="mt-1 shrink-0" size={18} />
            <p>
              Screenshot илгээх дугаар: <strong>{bankAccount.phone}</strong>. Гүйлгээний утга дээр{" "}
              <strong>{orderCode}</strong> кодоо бичсэн эсэхээ шалгаарай.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/products"
            className="rounded-full bg-stone-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
          >
            Бараа үргэлжлүүлэн үзэх
          </Link>
          <Link
            href="/"
            className="rounded-full border border-stone-300 px-6 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-900"
          >
            Нүүр рүү буцах
          </Link>
        </div>
      </div>
    </section>
  );
}
