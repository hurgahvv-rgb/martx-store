import { NextResponse } from "next/server";

import { getStoreSettings } from "@/lib/store-settings";

export async function GET() {
  const settings = await getStoreSettings();

  return NextResponse.json({
    storeName: settings.storeName,
    storeSubtitle: settings.storeSubtitle,
    storeLogo: settings.storeLogo,
    contactPhone: settings.contactPhone,
    contactEmail: settings.contactEmail,
    facebookUrl: settings.facebookUrl,
    instagramUrl: settings.instagramUrl,
    youtubeUrl: settings.youtubeUrl,
    footerText: settings.footerText,
    announcementText: settings.announcementText,
    headerMenu: settings.headerMenu,
    footerMenu: settings.footerMenu
  });
}
