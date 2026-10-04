import { notFound } from "next/navigation";

import { PolicyPage } from "@/components/policy-page";
import { getInfoPage, infoPages } from "@/lib/info-pages";

export function generateStaticParams() {
  return infoPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getInfoPage(slug);

  return {
    title: page ? `${page.title} | NaRa` : "Info | NaRa"
  };
}

export default async function InfoDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getInfoPage(slug);

  if (!page) {
    notFound();
  }

  return <PolicyPage page={page} />;
}
