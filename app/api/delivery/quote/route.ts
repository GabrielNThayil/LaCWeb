import { NextResponse } from "next/server";
import { isBorzoConfigured, quoteBorzoDelivery } from "../../../../lib/borzo";

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.address || !body.phone || !body.name) {
    return NextResponse.json(
      { error: "Name, phone number, and delivery address are required." },
      { status: 400 }
    );
  }

  if (!body.coordinates?.latitude || !body.coordinates?.longitude) {
    return NextResponse.json(
      { error: "Share a delivery location pin to check Borzo availability." },
      { status: 400 }
    );
  }

  if (!isBorzoConfigured()) {
    return NextResponse.json({
      configured: false,
      provider: "Borzo",
      message:
        "Borzo integration is prepared. Delivery will be coordinated by the cafe until API access is configured."
    });
  }

  try {
    const quote = await quoteBorzoDelivery({
      customer: {
        name: body.name,
        phone: body.phone,
        address: body.address,
        landmark: body.landmark,
        coordinates: body.coordinates
      },
      reference: "checkout-quote"
    });
    return NextResponse.json({ configured: true, ...quote });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Delivery is unavailable for this location."
      },
      { status: 400 }
    );
  }
}