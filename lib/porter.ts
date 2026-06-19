const PICKUP = {
  name: "La Couronne Cafe",
  address:
    "Ward No 78, Kareem Towers, 19/8, Cunningham Rd, Vasanth Nagar, Bengaluru, Karnataka 560001",
  phone: "918431750295",
  latitude: Number(process.env.PORTER_PICKUP_LATITUDE || 12.9881),
  longitude: Number(process.env.PORTER_PICKUP_LONGITUDE || 77.5944)
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

type PorterNormalizedResponse = {
  fare?: number;
  orderId?: string;
  status?: string;
  trackingUrl?: string | null;
};

export function isPorterConfigured() {
  return Boolean(
    process.env.PORTER_API_TOKEN &&
      process.env.PORTER_QUOTE_URL &&
      process.env.PORTER_CREATE_ORDER_URL
  );
}

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length === 10 ? `91${digits}` : digits;
}

function buildDeliveryContext({ customer, instructions, reference }: DeliveryRequest) {
  return {
    reference,
    vehicle: "2W",
    pickup: {
      ...PICKUP
    },
    drop: {
      name: customer.name.slice(0, 80),
      phone: normalizePhone(customer.phone),
      address: customer.landmark
        ? `${customer.address}, Near ${customer.landmark}`
        : customer.address,
      latitude: customer.coordinates.latitude,
      longitude: customer.coordinates.longitude
    },
    package: {
      description: "Prepared cafe food and beverages",
      instructions: instructions?.slice(0, 220) || ""
    }
  };
}

async function callPorter(url: string, request: DeliveryRequest) {
  const token = process.env.PORTER_API_TOKEN;
  if (!token) {
    throw new Error("Porter API token is not configured.");
  }

  // Porter supplies the exact endpoint contract during enterprise onboarding.
  // The payload uses the coordinates and order context required by their published flow.
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(buildDeliveryContext(request)),
    cache: "no-store"
  });
  const result = (await response.json()) as PorterNormalizedResponse & {
    message?: string;
  };

  if (!response.ok) {
    throw new Error(result.message || "Porter could not service this delivery.");
  }

  return result;
}

export async function quotePorterDelivery(request: DeliveryRequest) {
  const url = process.env.PORTER_QUOTE_URL;
  if (!url) {
    throw new Error("Porter quote endpoint is not configured.");
  }
  const response = await callPorter(url, request);
  if (!Number.isFinite(response.fare)) {
    throw new Error("Porter quote response did not include a usable fare.");
  }

  return {
    provider: "Porter",
    fee: Math.round(response.fare as number),
    automated: true
  };
}

export async function dispatchPorterDelivery(request: DeliveryRequest) {
  const url = process.env.PORTER_CREATE_ORDER_URL;
  if (!url) {
    throw new Error("Porter create-order endpoint is not configured.");
  }
  const response = await callPorter(url, request);
  if (!response.orderId) {
    throw new Error("Porter dispatch response did not include an order ID.");
  }

  return {
    provider: "Porter",
    deliveryId: response.orderId,
    status: response.status || "accepted",
    trackingUrl: response.trackingUrl || null
  };
}
