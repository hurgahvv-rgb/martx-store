import { NextResponse } from "next/server";

import { getStoreSettings } from "@/lib/store-settings";

export async function GET() {
  const settings = await getStoreSettings();

  return NextResponse.json({
    paymentBank: settings.paymentBank,
    paymentAccountOwner: settings.paymentAccountOwner,
    paymentAccountNumber: settings.paymentAccountNumber,
    paymentPhone: settings.paymentPhone,
    paymentInstructions: settings.paymentInstructions,
    paymentMethods: settings.paymentMethods,
    paymentAccounts: settings.paymentAccounts,
    paymentReferenceFormat: settings.paymentReferenceFormat,
    paymentWarningText: settings.paymentWarningText,
    shippingUlaanbaatarFee: settings.shippingUlaanbaatarFee,
    shippingProvinceFee: settings.shippingProvinceFee,
    freeShippingThreshold: settings.freeShippingThreshold
  });
}
