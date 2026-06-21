const PICKUP = {
  name: "La Couronne Cafe",
  address:
    "Ward No 78, Kareem Towers, 19/8, Cunningham Rd, Vasanth Nagar, Bengaluru, Karnataka 560001",
  phone: "918431750295",
  latitude: Number(process.env.BORZO_PICKUP_LATITUDE || 12.9881),
  longitude: Number(process.env.BORZO_PICKUP_LONGITUDE || 77.5944)
};

type Coordinates = {
  latitude: number;
  longitude: number;
};

type DeliveryCustomer = {
  name: string;
  phone: string;
  address: string;
  landmark?: string;
  coordinates: Coordinates;
};

type DeliveryRequest = {
  customer: DeliveryCustomer;
  instructions?: string;
  reference: string;
};

type BorzoQuote = {
  fare?: number;
  min_fare?: number;
  max_fare?: number;
};

type BorzoOrder = {
  order_id?: string;
  status?: string;
  tracking_id?: string;
  order_dispatch_status?: string;
};

type BorzoNormalizedResponse = {
  fare?: number;
  orderId?: string;
  status?: string;
  trackingUrl?: string | null;
};

export function isBorzoConfigured() {
  return Boolean(
    process.env.BORZO_API_KEY &&
      process.env.BORZO_CALLBACK_URL
  );
}

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  // Borzo expects phone in format 91XXXXXXXXXX
  return digits.length === 10 ? `91${digits}` : digits;
}

function normalizeAddress(address: string, landmark?: string) {
  const fullAddress = landmark
    ? `${address}, Near ${landmark}`
    : address;
  return fullAddress.slice(0, 200);
}

export async function quoteBorzoDelivery(request: DeliveryRequest): Promise<{
  provider: string;
  fee: number;
  automated: boolean;
}> {
  const apiKey = process.env.BORZO_API_KEY;
  if (!apiKey) {
    throw new Error("Borzo API key is not configured.");
  }

  // Borzo offers two-wheeler delivery in India
  // Using their standard fare calculation endpoint
  const response = await fetch("https://apistore.borzo.in/quotation", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Client-Id": process.env.BORZO_CLIENT_ID || "la_couronne_cafe",
    },
    body: JSON.stringify({
      pick_union_name: process.env.BORZO_PICKUP_UNION || "Bangalore",
      pick_name: PICKUP.name,
      pick_phone: PICKUP.phone,
      pick_address: PICKUP.address,
      pick_latitude: PICKUP.latitude,
      pick_longitude: PICKUP.longitude,
      drop_union_name: process.env.BORZO_DROP_UNION || "Bangalore",
      drop_name: request.customer.name.slice(0, 80),
      drop_phone: normalizePhone(request.customer.phone),
      drop_address: normalizeAddress(request.customer.address, request.customer.landmark),
      drop_latitude: request.customer.coordinates.latitude,
      drop_longitude: request.customer.coordinates.longitude,
      vehicle_type: 2, // 2-wheeler
      order_type: "immediate", // or "scheduled" for later
    }),
    cache: "no-store"
  });

  const result: BorzoQuote = await response.json();

  if (!response.ok) {
    throw new Error(result ? "Borzo could not calculate a rate for this location." : "Borzo API error.");
  }

  // Borzo returns fare directly in the quote response
  const fee = result.fare || result.min_fare || 0;
  if (fee <= 0) {
    throw new Error("Borzo quoted an invalid fare amount.");
  }

  return {
    provider: "Borzo",
    fee: Math.round(fee),
    automated: true
  };
}

export async function dispatchBorzoDelivery(request: DeliveryRequest): Promise<{
  provider: string;
  deliveryId: string;
  status: string;
  trackingUrl: string | null;
}> {
  const apiKey = process.env.BORZO_API_KEY;
  if (!apiKey) {
    throw new Error("Borzo API key is not configured.");
  }

  const response = await fetch("https://apistore.borzo.in/order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Client-Id": process.env.BORZO_CLIENT_ID || "la_couronne_cafe",
    },
    body: JSON.stringify({
      pick_union_name: process.env.BORZO_PICKUP_UNION || "Bangalore",
      pick_name: PICKUP.name,
      pick_phone: PICKUP.phone,
      pick_address: PICKUP.address,
      pick_latitude: PICKUP.latitude,
      pick_longitude: PICKUP.longitude,
      drop_union_name: process.env.BORZO_DROP_UNION || "Bangalore",
      drop_name: request.customer.name.slice(0, 80),
      drop_phone: normalizePhone(request.customer.phone),
      drop_address: normalizeAddress(request.customer.address, request.customer.landmark),
      drop_latitude: request.customer.coordinates.latitude,
      drop_longitude: request.customer.coordinates.longitude,
      vehicle_type: 2, // 2-wheeler
      order_type: "immediate",
      // Sender reference for tracking
      reference_number: request.reference,
      // Instructions for delivery partner
      comment: request.instructions?.slice(0, 220) || "Food delivery from La Couronne Cafe",
      // Callback URL for order status updates
      webhook_url: process.env.BORZO_CALLBACK_URL,
    }),
    cache: "no-store"
  });

  const result: BorzoOrder = await response.json();

  if (!response.ok) {
    throw new Error(result ? "Borzo could not accept this delivery order." : "Borzo API error.");
  }

  if (!result.order_id) {
    throw new Error("Borzo response did not include an order ID.");
  }

  return {
    provider: "Borzo",
    deliveryId: result.order_id,
    status: result.order_dispatch_status || "accepted",
    trackingUrl: result.tracking_id
      ? `https://borzo.in/track/${result.tracking_id}`
      : null
  };
}