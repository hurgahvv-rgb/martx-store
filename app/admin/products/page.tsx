import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { GalleryImageManager } from "@/components/gallery-image-manager";
import { ImageUploadField } from "@/components/image-upload-field";
import { MainImageManager } from "@/components/main-image-manager";
import { SaveNotice } from "@/components/save-notice";
import { SubmitButton } from "@/components/submit-button";
import { StoryEditor } from "@/components/story-editor";
import { VariantEditor } from "@/components/variant-editor";
import { requireAdminSession } from "@/lib/admin-auth";
import { formatPrice } from "@/lib/data";
import { normalizeImageSrc } from "@/lib/image-src";
import { getFiles, saveProductImages } from "@/lib/product-media";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const fallbackImage =
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80";

function getStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-яөүё-]+/gi, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function getText(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function getOptionalNumber(formData: FormData, key: string) {
  const value = getText(formData, key);
  return value ? Number(value) : null;
}

function getLines(formData: FormData, key: string) {
  return getText(formData, key)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function getUrls(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .map((value) => String(value).trim())
    .filter(Boolean);
}

async function getUploadedImages(formData: FormData, fileKey: string, urlKey: string) {
  const directUrls = getUrls(formData, urlKey);

  if (directUrls.length > 0) {
    return directUrls;
  }

  return saveProductImages(getFiles(formData, fileKey));
}

async function parseVariants(formData: FormData) {
  const lines = getText(formData, "variants")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const variants = [];

  for (const [index, line] of lines.entries()) {
    const [color, size, price, stock, sku, existingImage] = line.split("|").map((item) => item.trim());
    const uploadedImages = await getUploadedImages(formData, `variantImageFile_${index}`, `variantImageUrl_${index}`);
    const image = uploadedImages[0] ?? existingImage;

    if (color || size || price || stock || sku || image) {
      variants.push({
        color: color || null,
        size: size || null,
        price: price ? Number(price) : null,
        stock: stock ? Number(stock) : 0,
        sku: sku || null,
        image: image || null,
        isActive: true
      });
    }
  }

  return variants;
}

function formatVariants(
  variants: {
    color: string | null;
    size: string | null;
    price: number | null;
    stock: number;
    sku: string | null;
    image: string | null;
  }[]
) {
  return variants
    .map((variant) =>
      [variant.color ?? "", variant.size ?? "", variant.price ?? "", variant.stock, variant.sku ?? "", variant.image ?? ""].join(" | ")
    )
    .join("\n");
}

async function parseStories(formData: FormData) {
  const lines = getText(formData, "stories")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const stories = [];

  for (const [index, line] of lines.entries()) {
    const [title = "", description = "", existingImage = ""] = line.split("|").map((item) => item.trim());
    const uploadedImages = await getUploadedImages(formData, `storyImageFile_${index}`, `storyImageUrl_${index}`);
    const image = uploadedImages[0] ?? getText(formData, `storyExistingImage_${index}`) ?? existingImage;

    if (title || description || image) {
      stories.push({
        title: title || "Product Story",
        description,
        image: image || fallbackImage,
        sortOrder: index
      });
    }
  }

  return stories;
}

function formatStories(
  stories: {
    title: string;
    description: string;
    image: string;
  }[]
) {
  return stories.map((story) => [story.title, story.description, story.image].join(" | ")).join("\n");
}

function Field({
  label,
  children,
  className = ""
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={className}>
      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function getProductSaveMessage(saved: string) {
  const labels: Record<string, string> = {
    created: "Бараа амжилттай нэмэгдлээ.",
    updated: "Бараа амжилттай хадгалагдлаа.",
    deleted: "Бараа амжилттай устгагдлаа."
  };

  return labels[saved] ?? "Өөрчлөлт амжилттай хадгалагдлаа.";
}

async function createProduct(formData: FormData) {
  "use server";

  await requireAdminSession();

  const name = getText(formData, "name");

  if (!name) {
    return;
  }

  const mainUploads = await getUploadedImages(formData, "mainImageFile", "mainImageUrl");
  const galleryUploads = await getUploadedImages(formData, "galleryImageFiles", "galleryImageUrls");
  const storyUploads = await getUploadedImages(formData, "storyImageFile", "storyImageUrl");
  const image = mainUploads[0] ?? fallbackImage;
  const storyImage = storyUploads[0];
  const variants = await parseVariants(formData);
  const stories = await parseStories(formData);
  const slug = slugify(getText(formData, "slug") || name);

  await prisma.product.create({
    data: {
      name,
      slug,
      category: getText(formData, "category") || "Ерөнхий",
      description: getText(formData, "description"),
      subtitle: getText(formData, "subtitle") || null,
      bullets: getLines(formData, "bullets"),
      specs: getLines(formData, "specs"),
      shippingText: getText(formData, "shippingText") || null,
      returnsText: getText(formData, "returnsText") || null,
      warrantyText: getText(formData, "warrantyText") || null,
      helpText: getText(formData, "helpText") || null,
      storyTitle: getText(formData, "storyTitle") || null,
      storyDescription: getText(formData, "storyDescription") || null,
      storyImage: storyImage || null,
      price: Number(formData.get("price") || 0),
      compareAtPrice: getOptionalNumber(formData, "compareAtPrice"),
      currency: "MNT",
      image,
      galleryImages: galleryUploads,
      stock: Number(formData.get("stock") || 0),
      isFeatured: formData.get("isFeatured") === "on",
      isActive: true,
      variants: {
        create: variants
      },
      stories: {
        create: stories
      }
    }
  });

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath(`/products/${slug}`);
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  redirect("/admin/products?saved=created");
}

async function updateProduct(formData: FormData) {
  "use server";

  await requireAdminSession();

  const id = getText(formData, "id");

  if (!id) {
    return;
  }

  const existingProduct = await prisma.product.findUnique({
    where: { id },
    select: { slug: true }
  });

  const mainUploads = await getUploadedImages(formData, "mainImageFile", "mainImageUrl");
  const galleryUploads = await getUploadedImages(formData, "galleryImageFiles", "galleryImageUrls");
  const storyUploads = await getUploadedImages(formData, "storyImageFile", "storyImageUrl");
  const keptGalleryImages = formData
    .getAll("keepGalleryImages")
    .map((value) => String(value))
    .filter(Boolean);
  const image = mainUploads[0] ?? getText(formData, "currentImage") ?? fallbackImage;
  const storyImage = storyUploads[0] ?? getText(formData, "currentStoryImage");
  const variants = await parseVariants(formData);
  const stories = await parseStories(formData);
  const slug = slugify(getText(formData, "slug") || getText(formData, "name"));

  await prisma.$transaction([
    prisma.productVariant.deleteMany({ where: { productId: id } }),
    prisma.productStory.deleteMany({ where: { productId: id } }),
    prisma.product.update({
      where: { id },
      data: {
        name: getText(formData, "name"),
        slug,
        category: getText(formData, "category") || "Ерөнхий",
        description: getText(formData, "description"),
        subtitle: getText(formData, "subtitle") || null,
        bullets: getLines(formData, "bullets"),
        specs: getLines(formData, "specs"),
        shippingText: getText(formData, "shippingText") || null,
        returnsText: getText(formData, "returnsText") || null,
        warrantyText: getText(formData, "warrantyText") || null,
        helpText: getText(formData, "helpText") || null,
        storyTitle: getText(formData, "storyTitle") || null,
        storyDescription: getText(formData, "storyDescription") || null,
        storyImage: storyImage || null,
        price: Number(formData.get("price") || 0),
        compareAtPrice: getOptionalNumber(formData, "compareAtPrice"),
        image,
        galleryImages: [...keptGalleryImages, ...galleryUploads],
        stock: Number(formData.get("stock") || 0),
        isFeatured: formData.get("isFeatured") === "on",
        isActive: formData.get("isActive") === "on",
        variants: {
          create: variants
        },
        stories: {
          create: stories
        }
      }
    })
  ]);

  revalidatePath("/");
  revalidatePath("/products");
  if (existingProduct?.slug) {
    revalidatePath(`/products/${existingProduct.slug}`);
  }
  revalidatePath(`/products/${slug}`);
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  redirect("/admin/products?saved=updated");
}

async function deleteProduct(formData: FormData) {
  "use server";

  await requireAdminSession();

  const id = getText(formData, "id");

  if (!id) {
    return;
  }

  await prisma.product.delete({ where: { id } });

  revalidatePath("/admin");
  revalidatePath("/admin/products");
  redirect("/admin/products?saved=deleted");
}

async function getProducts() {
  try {
    const [products, orderItems] = await Promise.all([
      prisma.product.findMany({
        orderBy: { updatedAt: "desc" },
        include: {
          variants: {
            orderBy: [{ color: "asc" }, { size: "asc" }]
          },
          stories: {
            orderBy: { sortOrder: "asc" }
          }
        }
      }),
      prisma.orderItem.findMany({
        where: {
          order: {
            status: {
              not: "CANCELED"
            }
          }
        },
        select: {
          productId: true,
          productName: true,
          quantity: true
        }
      })
    ]);

    const soldByProductId = new Map<string, number>();
    const soldByProductName = new Map<string, number>();

    for (const item of orderItems) {
      if (item.productId) {
        soldByProductId.set(item.productId, (soldByProductId.get(item.productId) ?? 0) + item.quantity);
      }

      soldByProductName.set(item.productName, (soldByProductName.get(item.productName) ?? 0) + item.quantity);
    }

    return {
      connected: true,
      products: products.map((product) => ({
        ...product,
        image: normalizeImageSrc(product.image),
        galleryImages: getStringArray(product.galleryImages).map(normalizeImageSrc),
        bullets: getStringArray(product.bullets),
        specs: getStringArray(product.specs),
        storyImage: product.storyImage ? normalizeImageSrc(product.storyImage) : null,
        variants: product.variants.map((variant) => ({
          ...variant,
          image: variant.image ? normalizeImageSrc(variant.image) : null
        })),
        stories: product.stories.map((story) => ({
          ...story,
          image: normalizeImageSrc(story.image)
        })),
        soldQuantity: soldByProductId.get(product.id) ?? soldByProductName.get(product.name) ?? 0
      }))
    };
  } catch {
    return { connected: false, products: [] };
  }
}

async function getCategoryOptions() {
  try {
    const [categories, products] = await Promise.all([
      prisma.category.findMany({ select: { name: true }, orderBy: { name: "asc" } }),
      prisma.product.findMany({ select: { category: true }, orderBy: { category: "asc" } })
    ]);
    const names = new Set<string>();

    for (const category of categories) {
      if (category.name.trim()) {
        names.add(category.name.trim());
      }
    }

    for (const product of products) {
      if (product.category.trim()) {
        names.add(product.category.trim());
      }
    }

    return Array.from(names).sort((a, b) => a.localeCompare(b));
  } catch {
    return ["Ерөнхий"];
  }
}

export default async function AdminProductsPage({
  searchParams
}: {
  searchParams: Promise<{ new?: string; saved?: string }>;
}) {
  await requireAdminSession();
  const params = await searchParams;
  const isNewMode = params.new === "1";
  const [{ connected, products }, categoryOptions] = await Promise.all([getProducts(), getCategoryOptions()]);

  return (
    <section className="px-5 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <datalist id="product-category-options">
          {categoryOptions.map((category) => (
            <option key={category} value={category} />
          ))}
        </datalist>
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Products</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">Бараа удирдах</h1>
            <p className="mt-2 text-sm text-slate-500">
              Shopify шиг browser дотроос бараа, үнэ, үлдэгдэл, үндсэн зураг, нэмэлт зургуудыг оруулна.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {isNewMode ? (
              <Link href="/admin/products" className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700">
                Барааны жагсаалт
              </Link>
            ) : (
              <>
                <div className="rounded-xl bg-white px-5 py-4 text-sm font-semibold text-slate-600 shadow-sm">
                  Нийт бараа: <span className="text-slate-950">{products.length}</span>
                </div>
                <Link href="/admin/products?new=1" className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20">
                  + Шинэ бараа нэмэх
                </Link>
              </>
            )}
          </div>
        </div>

        {!connected ? (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
            Database холбогдоогүй байна. `DATABASE_URL` тохируулаад Prisma migration ажиллуулах хэрэгтэй.
          </div>
        ) : null}

        {params.saved ? <SaveNotice message={getProductSaveMessage(params.saved)} /> : null}

        {isNewMode ? (
        <form action={createProduct} className="mb-6 rounded-xl bg-white p-6 shadow-sm" encType="multipart/form-data">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-950">Шинэ бараа нэмэх</h2>
              <p className="mt-1 text-sm text-slate-500">Зураг URL бичиж болно, эсвэл шууд компьютерээсээ upload хийнэ.</p>
            </div>
            <SubmitButton pendingText="Хадгалж байна..." className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20">
              Нэмэх
            </SubmitButton>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Field label="Барааны нэр">
              <input name="name" placeholder="Жишээ: Арьсан цүнх" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500" />
            </Field>
            <Field label="Slug">
              <input name="slug" placeholder="jishee-ariisan-tsunh" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500" />
            </Field>
            <Field label="Ангилал">
              <input name="category" list="product-category-options" placeholder="Жишээ: Цүнх" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500" />
            </Field>
            <div className="md:col-span-2">
              <ImageUploadField name="mainImageFile" label="Үндсэн зураг" />
            </div>
            <div className="md:col-span-2">
              <ImageUploadField name="galleryImageFiles" label="Нэмэлт зургууд" multiple />
            </div>
            <Field label="Үндсэн тайлбар" className="xl:col-span-4">
              <textarea name="description" placeholder="Барааны ерөнхий тайлбар" className="min-h-24 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500" />
            </Field>
            <Field label="Дэлгэрэнгүй богино тайлбар" className="xl:col-span-4">
              <input name="subtitle" placeholder="Product detail дээр үнийн доор харагдана" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500" />
            </Field>
            <Field label="Онцлох bullet-ууд" className="xl:col-span-2">
              <textarea name="bullets" placeholder={"Мөр мөрөөр бичнэ\nУсны хамгаалалттай\nLaptop багтана"} className="min-h-24 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500" />
            </Field>
            <Field label="Үзүүлэлтүүд" className="xl:col-span-2">
              <textarea name="specs" placeholder={"Мөр мөрөөр бичнэ\nМатериал: арьс\nХэмжээ: 30x40cm"} className="min-h-24 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500" />
            </Field>
            <div className="grid gap-4 rounded-xl border border-amber-200 bg-amber-50 p-4 xl:col-span-4 md:grid-cols-3">
              <div className="md:col-span-3">
                <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-amber-800">Үндсэн үнэ ба үлдэгдэл</h3>
                <p className="mt-1 text-xs leading-5 text-amber-800">
                  Өнгө/хэмжээний variant ашиглахгүй бараанд хэрэглэнэ. Variant үүсгэвэл доорх variant мөрүүдийн үнэ, үлдэгдэл гол болно.
                </p>
              </div>
              <Field label="Үндсэн үнэ">
                <input name="price" type="number" placeholder="99000" className="w-full rounded-xl border border-amber-200 px-4 py-3 text-sm outline-none focus:border-amber-500" />
              </Field>
              <Field label="Хуучин үнэ">
                <input name="compareAtPrice" type="number" placeholder="129000" className="w-full rounded-xl border border-amber-200 px-4 py-3 text-sm outline-none focus:border-amber-500" />
              </Field>
              <Field label="Нийт үлдэгдэл">
                <input name="stock" type="number" placeholder="20" className="w-full rounded-xl border border-amber-200 px-4 py-3 text-sm outline-none focus:border-amber-500" />
              </Field>
            </div>
            <VariantEditor name="variants" />
            <StoryEditor name="stories" />
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
              <input name="isFeatured" type="checkbox" />
              Онцлох бараа
            </label>
          </div>
        </form>
        ) : null}

        {!isNewMode ? (
        <div className="space-y-4">
          {products.map((product) => (
            <details key={product.id} className="group overflow-hidden rounded-xl bg-white shadow-sm">
              <summary className="list-none cursor-pointer p-4 transition hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
                <div className="grid gap-4 md:grid-cols-[120px_1fr_auto] md:items-center">
                  <div className="relative h-28 overflow-hidden rounded-xl bg-slate-100">
                    {product.image ? <img src={product.image} alt={product.name} className="h-full w-full object-cover" /> : null}
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Edit хийхийн тулд зураг дээр дар</p>
                    <h2 className="mt-2 text-xl font-bold text-slate-950">{product.name}</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {product.category} · {formatPrice(product.price, "MNT")}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">Үлдэгдэл {product.stock}ш</span>
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">Зарагдсан {product.soldQuantity}ш</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 md:justify-end">
                    <span
                      className={[
                        "w-fit rounded-full px-3 py-1 text-xs font-bold",
                        product.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                      ].join(" ")}
                    >
                      {product.isActive ? "Идэвхтэй" : "Нуусан"}
                    </span>
                    <span className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 group-open:hidden">
                      Засах
                    </span>
                    <span className="hidden rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 group-open:inline-flex">
                      Хураах
                    </span>
                  </div>
                </div>
              </summary>

              <div className="border-t border-slate-100 p-5">
                <div>
                  <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-950">{product.name}</h2>
                      <p className="mt-1 text-sm text-slate-500">
                        {product.category} · {formatPrice(product.price, "MNT")}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">Үлдэгдэл {product.stock}ш</span>
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">Зарагдсан {product.soldQuantity}ш</span>
                      </div>
                    </div>
                    <span
                      className={[
                        "w-fit rounded-full px-3 py-1 text-xs font-bold",
                        product.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                      ].join(" ")}
                    >
                      {product.isActive ? "Идэвхтэй" : "Нуусан"}
                    </span>
                  </div>

                  <form action={updateProduct} className="grid gap-3 md:grid-cols-2 xl:grid-cols-4" encType="multipart/form-data">
                    <input type="hidden" name="id" value={product.id} />
                    <input type="hidden" name="currentStoryImage" value={product.storyImage ?? ""} />
                    <MainImageManager image={product.image} productName={product.name} />
                    <Field label="Барааны нэр">
                      <input name="name" defaultValue={product.name} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
                    </Field>
                    <Field label="Slug">
                      <input name="slug" defaultValue={product.slug} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
                    </Field>
                    <Field label="Ангилал">
                      <input name="category" list="product-category-options" defaultValue={product.category} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
                    </Field>
                    <div className="md:col-span-2">
                      <ImageUploadField name="mainImageFile" label="Үндсэн зураг солих" />
                    </div>
                    <div className="md:col-span-2">
                      <ImageUploadField name="galleryImageFiles" label="Нэмэлт зураг нэмэх" multiple />
                    </div>
                    <GalleryImageManager images={product.galleryImages} productName={product.name} />
                    <Field label="Үндсэн тайлбар" className="xl:col-span-4">
                      <textarea name="description" defaultValue={product.description} className="min-h-20 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
                    </Field>
                    <Field label="Дэлгэрэнгүй богино тайлбар" className="xl:col-span-4">
                      <input name="subtitle" defaultValue={product.subtitle ?? ""} placeholder="Product detail дээр үнийн доор харагдана" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
                    </Field>
                    <Field label="Онцлох bullet-ууд" className="xl:col-span-2">
                      <textarea name="bullets" defaultValue={product.bullets.join("\n")} placeholder="Мөр мөрөөр бичнэ" className="min-h-24 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
                    </Field>
                    <Field label="Үзүүлэлтүүд" className="xl:col-span-2">
                      <textarea name="specs" defaultValue={product.specs.join("\n")} placeholder="Мөр мөрөөр бичнэ" className="min-h-24 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
                    </Field>
                    <div className="grid gap-4 rounded-xl border border-amber-200 bg-amber-50 p-4 xl:col-span-4 md:grid-cols-3">
                      <div className="md:col-span-3">
                        <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-amber-800">Үндсэн үнэ ба үлдэгдэл</h3>
                        <p className="mt-1 text-xs leading-5 text-amber-800">
                          Өнгө/хэмжээний variant ашиглахгүй бараанд хэрэглэнэ. Variant үүсгэвэл доорх variant мөрүүдийн үнэ, үлдэгдэл гол болно.
                        </p>
                      </div>
                      <Field label="Үндсэн үнэ">
                        <input name="price" type="number" defaultValue={product.price} className="w-full rounded-xl border border-amber-200 px-4 py-3 text-sm" />
                      </Field>
                      <Field label="Хуучин үнэ">
                        <input name="compareAtPrice" type="number" defaultValue={product.compareAtPrice ?? ""} className="w-full rounded-xl border border-amber-200 px-4 py-3 text-sm" />
                      </Field>
                      <Field label="Нийт үлдэгдэл">
                        <input name="stock" type="number" defaultValue={product.stock} className="w-full rounded-xl border border-amber-200 px-4 py-3 text-sm" />
                      </Field>
                    </div>
                    <VariantEditor name="variants" initialValue={formatVariants(product.variants)} />
                    <StoryEditor
                      name="stories"
                      initialValue={formatStories(
                        product.stories.length
                          ? product.stories
                          : product.storyTitle || product.storyDescription || product.storyImage
                            ? [
                                {
                                  title: product.storyTitle ?? "",
                                  description: product.storyDescription ?? "",
                                  image: product.storyImage ?? ""
                                }
                              ]
                            : []
                      )}
                    />
                    <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-600 xl:col-span-4">
                      <label className="flex items-center gap-2">
                        <input name="isFeatured" type="checkbox" defaultChecked={product.isFeatured} />
                        Онцлох
                      </label>
                      <label className="flex items-center gap-2">
                        <input name="isActive" type="checkbox" defaultChecked={product.isActive} />
                        Идэвхтэй
                      </label>
                      <SubmitButton pendingText="Хадгалж байна..." className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white">
                        Хадгалах
                      </SubmitButton>
                    </div>
                  </form>

                  <form action={deleteProduct} className="mt-4 border-t border-red-100 pt-4">
                    <input type="hidden" name="id" value={product.id} />
                    <SubmitButton pendingText="Устгаж байна..." className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100">
                      Дэлгүүрээс устгах
                    </SubmitButton>
                  </form>
                </div>
              </div>
            </details>
          ))}

          {connected && products.length === 0 ? (
            <div className="rounded-xl bg-white px-5 py-14 text-center text-sm text-slate-500 shadow-sm">
              Одоогоор database-д бараа байхгүй байна.
            </div>
          ) : null}
        </div>
        ) : null}
      </div>
    </section>
  );
}
