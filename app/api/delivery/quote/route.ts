import { NextResponse } from "next/server";
import { isPorterConfigured, quotePorterDelivery } from "../../../../lib/porter";

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
      { error: "Share a delivery location pin to check Porter availability." },
      { status: 400 }
    );
  }

  if (!isPorterConfigured()) {
    return NextResponse.json({
      configured: false,
      provider: "Porter",
      message:
        "Porter integration is prepared. Delivery will be coordinated by the cafe until enterprise API access is configured."
    });
  }

  try {
    const quote = await quotePorterDelivery({
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
