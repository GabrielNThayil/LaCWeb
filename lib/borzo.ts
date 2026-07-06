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
  return digits.length === 10 ? `91${digits}` : digits.replace(/^91/, "");
}

function normalizeAddress(address: string, landmark?: string) {
  const fullAddress = landmark
    ? `${address}, Near ${landmark}`
    : address;
  return fullAddress.slice(0, 200);
}

function sanitizeString(value: string, maxLen: number) {
  if (typeof value !== "string") return "";
  // Strip control chars, trim, limit length
  return value.replace(/[\x00-\x1F\x7F]/g, "").trim().slice(0, maxLen);
}

function validateCoordinates(lat: number, lng: number): boolean {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180
  );
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

  // Validate coordinates before making API call
  if (!validateCoordinates(request.customer.coordinates.latitude, request.customer.coordinates.longitude)) {
    throw new Error("Invalid delivery coordinates.");
  }

  // Sanitize all customer inputs
  const safeName = sanitizeString(request.customer.name, 80);
  const safePhone = normalizePhone(request.customer.phone);
  const safeAddress = normalizeAddress(
    sanitizeString(request.customer.address, 150),
    sanitizeString(request.customer.landmark ?? "", 50)
  );

  if (!safeName || !safePhone || !safeAddress) {
    throw new Error("Missing or invalid delivery details.");
  }

  const response = await fetch("https://apistore.borzo.in/quotation", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Client-Id": process.env.BORZO_CLIENT_ID ?? "la_couronne_cafe",
      "X-Api-Key": apiKey,
    },
    body: JSON.stringify({
      pick_union_name: sanitizeString(process.env.BORZO_PICKUP_UNION ?? "Bangalore", 50),
      pick_name: PICKUP.name,
      pick_phone: PICKUP.phone,
      pick_address: PICKUP.address,
      pick_latitude: PICKUP.latitude,
      pick_longitude: PICKUP.longitude,
      drop_union_name: sanitizeString(process.env.BORZO_DROP_UNION ?? "Bangalore", 50),
      drop_name: safeName,
      drop_phone: safePhone,
      drop_address: safeAddress,
      drop_latitude: request.customer.coordinates.latitude,
      drop_longitude: request.customer.coordinates.longitude,
      vehicle_type: 2,
      order_type: "immediate",
    }),
    cache: "no-store"
  });

  const result: BorzoQuote = await response.json();

  if (!response.ok) {
    throw new Error("Borzo could not calculate a rate for this location.");
  }

  const fee = result.fare ?? result.min_fare ?? 0;
  if (fee <= 0) {
    throw new Error("Borzo quoted an invalid fare amount.");
  }

  return { provider: "Borzo", fee: Math.round(fee), automated: true };
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

  if (!validateCoordinates(request.customer.coordinates.latitude, request.customer.coordinates.longitude)) {
    throw new Error("Invalid delivery coordinates.");
  }

  const safeName = sanitizeString(request.customer.name, 80);
  const safePhone = normalizePhone(request.customer.phone);
  const safeAddress = normalizeAddress(
    sanitizeString(request.customer.address, 150),
    sanitizeString(request.customer.landmark ?? "", 50)
  );
  const safeInstructions = sanitizeString(request.instructions ?? "", 200);
  const safeRef = sanitizeString(request.reference, 50);

  const response = await fetch("https://apistore.borzo.in/order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Client-Id": process.env.BORZO_CLIENT_ID ?? "la_couronne_cafe",
      "X-Api-Key": apiKey,
    },
    body: JSON.stringify({
      pick_union_name: sanitizeString(process.env.BORZO_PICKUP_UNION ?? "Bangalore", 50),
      pick_name: PICKUP.name,
      pick_phone: PICKUP.phone,
      pick_address: PICKUP.address,
      pick_latitude: PICKUP.latitude,
      pick_longitude: PICKUP.longitude,
      drop_union_name: sanitizeString(process.env.BORZO_DROP_UNION ?? "Bangalore", 50),
      drop_name: safeName,
      drop_phone: safePhone,
      drop_address: safeAddress,
      drop_latitude: request.customer.coordinates.latitude,
      drop_longitude: request.customer.coordinates.longitude,
      vehicle_type: 2,
      order_type: "immediate",
      reference_number: safeRef,
      comment: safeInstructions || "Food delivery from La Couronne Cafe",
      webhook_url: process.env.BORZO_CALLBACK_URL,
    }),
    cache: "no-store"
  });

  const result: BorzoOrder = await response.json();

  if (!response.ok) {
    throw new Error("Borzo could not accept this delivery order.");
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
      : null,
  };
}