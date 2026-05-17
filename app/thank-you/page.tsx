import Link from "next/link";
import { CheckCircle2, MessageCircle } from "lucide-react";

import { formatPrice } from "@/lib/data";
import { getStoreSettings } from "@/lib/store-settings";

type ThankYouPageProps = {
  searchParams: Promise<{
    order?: string;
    total?: string;
    phone?: string;
  }>;
};

export default async function ThankYouPage({ searchParams }: ThankYouPageProps) {
  const params = await searchParams;
  const orderCode = params.order ?? "MX-000000";
  const total = Number(params.total ?? 0);
  const phone = params.phone ?? "";
  const settings = await getStoreSettings();
  const paymentReference =
    phone ||
    settings.paymentReferenceFormat
      .replaceAll("{orderCode}", orderCode)
      .replaceAll("{phone}", "")
      .replaceAll("{total}", String(total));
  const activeAccounts = settings.paymentAccounts.filter((account) => account.isActive);

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
          Төлбөрөө доорх данс руу шилжүүлэхдээ гүйлгээний утга дээр утасны дугаараа бичээрэй.
          Бид банкны гүйлгээнээс утсаар нь захиалгыг таньж баталгаажуулна.
        </p>

        <div className="mx-auto mt-8 grid max-w-2xl gap-3 text-left">
          <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 px-5 py-5">
            <p className="text-xs uppercase tracking-[0.18em] text-emerald-700">Гүйлгээний утга дээр бичих</p>
            <p className="mt-2 text-3xl font-semibold text-emerald-950">{paymentReference}</p>
            <p className="mt-2 text-sm leading-6 text-emerald-800">Төлбөр шилжүүлэхдээ энэ утасны дугаарыг гүйлгээний утга дээр бичнэ.</p>
          </div>

          {[
            { label: "Төлөх дүн", value: formatPrice(total, "MNT") },
            ...activeAccounts.flatMap((account) => [
              { label: `${account.bank} эзэмшигч`, value: account.owner },
              { label: `${account.bank} данс`, value: account.number }
            ]),
            { label: "Захиалгын код", value: orderCode, note: "Лавлагаанд ашиглана" }
          ].map((item) => (
            <div
              key={item.label}
              className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
                <p className="mt-1 text-lg font-semibold text-ink">{item.value}</p>
                {"note" in item ? <p className="mt-1 text-xs text-slate-500">{item.note}</p> : null}
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-8 max-w-2xl rounded-2xl bg-amber-50 p-5 text-left text-sm leading-7 text-amber-900">
          <div className="flex gap-3">
            <MessageCircle className="mt-1 shrink-0" size={18} />
            <p>
              Гүйлгээний утга дээр <strong>{paymentReference}</strong> гэж бичсэн эсэхээ шалгаарай. {settings.paymentWarningText}
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
