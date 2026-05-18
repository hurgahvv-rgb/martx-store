import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { SaveNotice } from "@/components/save-notice";
import { requireAdminSession } from "@/lib/admin-auth";
import { defaultPaymentMethods, getStoreSettings } from "@/lib/store-settings";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function getText(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function getNumber(formData: FormData, key: string) {
  const value = Number(formData.get(key) ?? 0);
  return Number.isFinite(value) && value >= 0 ? Math.round(value) : 0;
}

function shortText(value: string) {
  return value.length > 96 ? `${value.slice(0, 96)}...` : value;
}

async function saveSettings(formData: FormData) {
  "use server";

  await requireAdminSession();

  await prisma.storeSetting.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      shippingText: getText(formData, "shippingText"),
      returnsText: getText(formData, "returnsText"),
      warrantyText: getText(formData, "warrantyText"),
      helpText: getText(formData, "helpText")
    },
    update: {
      shippingText: getText(formData, "shippingText"),
      returnsText: getText(formData, "returnsText"),
      warrantyText: getText(formData, "warrantyText"),
      helpText: getText(formData, "helpText")
    }
  });

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin/settings");
  redirect("/admin/settings?saved=product-detail");
}

async function savePaymentSettings(formData: FormData) {
  "use server";

  await requireAdminSession();

  const paymentMethods = defaultPaymentMethods.map((method) => ({
    id: method.id,
    label: getText(formData, `method_${method.id}_label`) || method.label,
    description: getText(formData, `method_${method.id}_description`) || method.description,
    isActive: formData.get(`method_${method.id}_active`) === "on"
  }));
  const paymentAccounts = [0, 1, 2]
    .map((index) => ({
      id: `account_${index + 1}`,
      bank: getText(formData, `account_${index}_bank`),
      owner: getText(formData, `account_${index}_owner`),
      number: getText(formData, `account_${index}_number`),
      isActive: formData.get(`account_${index}_active`) === "on"
    }))
    .filter((account) => account.bank || account.owner || account.number);
  const primaryAccount = paymentAccounts.find((account) => account.isActive) ?? paymentAccounts[0];

  await prisma.$executeRaw`
    INSERT INTO "StoreSetting" (
      id,
      "paymentBank",
      "paymentAccountOwner",
      "paymentAccountNumber",
      "paymentPhone",
      "paymentInstructions",
      "paymentMethodsJson",
      "paymentAccountsJson",
      "paymentReferenceFormat",
      "paymentWarningText",
      "shippingUlaanbaatarFee",
      "shippingProvinceFee",
      "freeShippingThreshold",
      "updatedAt"
    )
    VALUES (
      'default',
      ${primaryAccount?.bank ?? getText(formData, "paymentBank")},
      ${primaryAccount?.owner ?? getText(formData, "paymentAccountOwner")},
      ${primaryAccount?.number ?? getText(formData, "paymentAccountNumber")},
      ${getText(formData, "paymentPhone")},
      ${getText(formData, "paymentInstructions")},
      ${JSON.stringify(paymentMethods)},
      ${JSON.stringify(paymentAccounts)},
      ${getText(formData, "paymentReferenceFormat") || "{orderCode}"},
      ${getText(formData, "paymentWarningText")},
      ${getNumber(formData, "shippingUlaanbaatarFee")},
      ${getNumber(formData, "shippingProvinceFee")},
      ${getNumber(formData, "freeShippingThreshold")},
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      "paymentBank" = EXCLUDED."paymentBank",
      "paymentAccountOwner" = EXCLUDED."paymentAccountOwner",
      "paymentAccountNumber" = EXCLUDED."paymentAccountNumber",
      "paymentPhone" = EXCLUDED."paymentPhone",
      "paymentInstructions" = EXCLUDED."paymentInstructions",
      "paymentMethodsJson" = EXCLUDED."paymentMethodsJson",
      "paymentAccountsJson" = EXCLUDED."paymentAccountsJson",
      "paymentReferenceFormat" = EXCLUDED."paymentReferenceFormat",
      "paymentWarningText" = EXCLUDED."paymentWarningText",
      "shippingUlaanbaatarFee" = EXCLUDED."shippingUlaanbaatarFee",
      "shippingProvinceFee" = EXCLUDED."shippingProvinceFee",
      "freeShippingThreshold" = EXCLUDED."freeShippingThreshold",
      "updatedAt" = NOW()
  `;

  revalidatePath("/checkout");
  revalidatePath("/thank-you");
  revalidatePath("/admin/settings");
  redirect("/admin/settings?saved=payment");
}

async function saveHomepageSettings(formData: FormData) {
  "use server";

  await requireAdminSession();

  await prisma.$executeRaw`
    INSERT INTO "StoreSetting" (
      id,
      "heroProductId",
      "updatedAt"
    )
    VALUES (
      'default',
      ${getText(formData, "heroProductId") || null},
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      "heroProductId" = EXCLUDED."heroProductId",
      "updatedAt" = NOW()
  `;

  revalidatePath("/");
  revalidatePath("/admin/settings");
  redirect("/admin/settings?saved=homepage");
}

export default async function AdminSettingsPage({
  searchParams
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireAdminSession();
  const params = await searchParams;
  const settings = await getStoreSettings();
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: [{ isFeatured: "desc" }, { updatedAt: "desc" }],
    select: {
      id: true,
      name: true,
      category: true,
      image: true
    }
  });
  const selectedHeroProduct = products.find((product) => product.id === settings.heroProductId);
  const accountSlots = [0, 1, 2].map(
    (index) =>
      settings.paymentAccounts[index] ?? {
        id: `account_${index + 1}`,
        bank: "",
        owner: "",
        number: "",
        isActive: false
      }
  );
  return (
    <section className="px-5 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Settings</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">Тохиргоо</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Бүх барааны detail page дээр тогтмол харагддаг хүргэлт, буцаалт, баталгаа, тусламжийн текстийг эндээс засна.
          </p>
        </div>

        {params.saved ? <SaveNotice message={getSaveMessage(params.saved)} /> : null}

        <div className="space-y-4">
          <details className="group overflow-hidden rounded-xl bg-white shadow-sm">
            <summary className="list-none cursor-pointer p-5 transition hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Homepage</p>
                  <h2 className="mt-2 text-xl font-bold text-slate-950">Нүүр banner дээр гаргах бараа</h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                    Нүүрний том banner автоматаар солигдохгүй, энд сонгосон бараагаар тогтмол харагдана.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                    {selectedHeroProduct ? "Сонгосон" : "Автомат"}
                  </span>
                  <span className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 group-open:hidden">Edit</span>
                  <span className="hidden rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 group-open:inline-flex">Хураах</span>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <Preview label="Одоогийн banner бараа" value={selectedHeroProduct?.name ?? "Автоматаар онцлох бараанаас авна"} />
                <Preview label="Ангилал" value={selectedHeroProduct?.category ?? "Автомат"} />
              </div>
            </summary>

            <form action={saveHomepageSettings} className="border-t border-slate-100 p-6">
              <div className="grid gap-5 lg:grid-cols-[280px_1fr] lg:items-start">
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                  {selectedHeroProduct ? (
                    <img src={selectedHeroProduct.image} alt={selectedHeroProduct.name} className="h-56 w-full object-cover" />
                  ) : (
                    <div className="flex h-56 items-center justify-center px-5 text-center text-sm text-slate-500">
                      Одоогоор автоматаар онцлох бараанаас banner авна.
                    </div>
                  )}
                </div>

                <div>
                  <Field label="Banner дээр гаргах бараа">
                    <select
                      name="heroProductId"
                      defaultValue={settings.heroProductId}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                    >
                      <option value="">Автоматаар сонгох</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} ({product.category})
                        </option>
                      ))}
                    </select>
                  </Field>
                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    Сонгосон барааны үндсэн зураг, нэр, үнэ, detail link нүүрний banner дээр гарна.
                  </p>
                  <div className="mt-6 flex justify-end">
                    <button className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20">
                      Banner сонголт хадгалах
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </details>

          <details className="group overflow-hidden rounded-xl bg-white shadow-sm">
            <summary className="list-none cursor-pointer p-5 transition hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Product detail</p>
                  <h2 className="mt-2 text-xl font-bold text-slate-950">Барааны дэлгэрэнгүй дээрх тусламжийн текстүүд</h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                    Product page дээрх хүргэлт, буцаалт, баталгаа, тусламжийн accordion дотор харагдах тогтмол текстүүд.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">4 тохиргоо</span>
                  <span className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 group-open:hidden">Edit</span>
                  <span className="hidden rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 group-open:inline-flex">Хураах</span>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <Preview label="Хүргэлт" value={settings.shippingText} />
                <Preview label="Буцаалт" value={settings.returnsText} />
                <Preview label="Баталгаа" value={settings.warrantyText} />
                <Preview label="Тусламж" value={settings.helpText} />
              </div>
            </summary>

            <form action={saveSettings} className="border-t border-slate-100 p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Хүргэлт">
                  <textarea
                    name="shippingText"
                    defaultValue={settings.shippingText}
                    className="min-h-28 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  />
                </Field>
                <Field label="Буцаалт">
                  <textarea
                    name="returnsText"
                    defaultValue={settings.returnsText}
                    className="min-h-28 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  />
                </Field>
                <Field label="Баталгаа">
                  <textarea
                    name="warrantyText"
                    defaultValue={settings.warrantyText}
                    className="min-h-28 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  />
                </Field>
                <Field label="Тусламж">
                  <textarea
                    name="helpText"
                    defaultValue={settings.helpText}
                    className="min-h-28 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  />
                </Field>
              </div>

              <div className="mt-6 flex justify-end">
                <button className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20">
                  Энэ хэсгийг хадгалах
                </button>
              </div>
            </form>
          </details>

          <details className="group overflow-hidden rounded-xl bg-white shadow-sm">
            <summary className="list-none cursor-pointer p-5 transition hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Payment</p>
                  <h2 className="mt-2 text-xl font-bold text-slate-950">Төлбөрийн систем</h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                    Checkout, thank-you page болон захиалгын email дээр харагдах банкны данс, гүйлгээний утга, төлбөрийн заавар.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">5 тохиргоо</span>
                  <span className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 group-open:hidden">Edit</span>
                  <span className="hidden rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 group-open:inline-flex">Хураах</span>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <Preview label="Банк" value={settings.paymentBank} />
                <Preview label="Данс эзэмшигч" value={settings.paymentAccountOwner} />
                <Preview label="Дансны дугаар" value={settings.paymentAccountNumber} />
                <Preview label="Холбогдох утас" value={settings.paymentPhone} />
                <Preview label="УБ хүргэлт" value={`${settings.shippingUlaanbaatarFee}₮`} />
                <Preview label="Орон нутаг хүргэлт" value={`${settings.shippingProvinceFee}₮`} />
              </div>
            </summary>

            <form action={savePaymentSettings} className="border-t border-slate-100 p-6">
              <div className="space-y-8">
                <section>
                  <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-400">Төлбөрийн аргууд</h3>
                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    {settings.paymentMethods.map((method) => (
                      <article key={method.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <label className="flex items-center gap-3 text-sm font-bold text-slate-900">
                          <input
                            name={`method_${method.id}_active`}
                            type="checkbox"
                            defaultChecked={method.isActive}
                            className="h-4 w-4 accent-blue-600"
                          />
                          Идэвхтэй
                        </label>
                        <div className="mt-4 grid gap-3">
                          <input
                            name={`method_${method.id}_label`}
                            defaultValue={method.label}
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-blue-500"
                          />
                          <textarea
                            name={`method_${method.id}_description`}
                            defaultValue={method.description}
                            className="min-h-20 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                          />
                        </div>
                      </article>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-400">Банкны дансууд</h3>
                  <div className="mt-4 grid gap-4 xl:grid-cols-3">
                    {accountSlots.map((account, index) => (
                      <article key={account.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <label className="flex items-center gap-3 text-sm font-bold text-slate-900">
                          <input
                            name={`account_${index}_active`}
                            type="checkbox"
                            defaultChecked={account.isActive}
                            className="h-4 w-4 accent-blue-600"
                          />
                          Checkout дээр харуулах
                        </label>
                        <div className="mt-4 grid gap-3">
                          <input
                            name={`account_${index}_bank`}
                            defaultValue={account.bank}
                            placeholder="Банк"
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                          />
                          <input
                            name={`account_${index}_owner`}
                            defaultValue={account.owner}
                            placeholder="Данс эзэмшигч"
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                          />
                          <input
                            name={`account_${index}_number`}
                            defaultValue={account.number}
                            placeholder="Дансны дугаар"
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                          />
                        </div>
                      </article>
                    ))}
                  </div>
                </section>

                <section className="grid gap-4 md:grid-cols-2">
                  <Field label="Холбогдох утас">
                    <input
                      name="paymentPhone"
                      defaultValue={settings.paymentPhone}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                    />
                  </Field>
                  <Field label="Гүйлгээний утгын format">
                    <input
                      name="paymentReferenceFormat"
                      defaultValue={settings.paymentReferenceFormat}
                      placeholder="{phone}"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                    />
                  </Field>
                  <Field label="Төлбөрийн заавар">
                    <textarea
                      name="paymentInstructions"
                      defaultValue={settings.paymentInstructions}
                      className="min-h-28 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                    />
                  </Field>
                  <Field label="Анхааруулах текст">
                    <textarea
                      name="paymentWarningText"
                      defaultValue={settings.paymentWarningText}
                      className="min-h-28 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                    />
                  </Field>
                </section>

                <section>
                  <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-400">Хүргэлтийн төлбөр</h3>
                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    <Field label="УБ хүргэлт">
                      <input
                        name="shippingUlaanbaatarFee"
                        type="number"
                        defaultValue={settings.shippingUlaanbaatarFee}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                      />
                    </Field>
                    <Field label="Орон нутаг хүргэлт">
                      <input
                        name="shippingProvinceFee"
                        type="number"
                        defaultValue={settings.shippingProvinceFee}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                      />
                    </Field>
                    <Field label="Үнэгүй хүргэлтийн доод дүн">
                      <input
                        name="freeShippingThreshold"
                        type="number"
                        defaultValue={settings.freeShippingThreshold}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                      />
                    </Field>
                  </div>
                </section>
              </div>

              <div className="mt-6 flex justify-end">
                <button className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20">
                  Төлбөрийн тохиргоог хадгалах
                </button>
              </div>
            </form>
          </details>
        </div>
      </div>
    </section>
  );
}

function Preview({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{shortText(value)}</p>
    </article>
  );
}

function getSaveMessage(saved: string) {
  const labels: Record<string, string> = {
    homepage: "Нүүр banner дээр гаргах бараа амжилттай хадгалагдлаа.",
    "product-detail": "Product detail тохиргоо амжилттай хадгалагдлаа.",
    payment: "Төлбөрийн тохиргоо амжилттай хадгалагдлаа."
  };

  return labels[saved] ?? "Тохиргоо амжилттай хадгалагдлаа.";
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label>
      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{label}</span>
      {children}
    </label>
  );
}
