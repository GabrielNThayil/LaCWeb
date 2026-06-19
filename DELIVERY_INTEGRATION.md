# Delivery Partner Integration

## Selected Provider: Porter

Porter is the production delivery partner selected for La Couronne's direct
ordering flow. Porter's official API integrations page confirms:

- Bangalore service coverage.
- Two-wheeler orders through API integration.
- Dynamic fare/serviceability through a Get Quote API.
- Order creation, tracking links, Track Order API, and webhook updates.
- Optional proof-of-delivery code for the customer.
- Pickup and drop geo-coordinates are required.

Official reference: https://porter.in/api-integrations

## Implemented Flow

1. The customer orders directly on La Couronne's website.
2. A delivery customer enters their address and actively shares a delivery pin.
3. `POST /api/delivery/quote` checks Porter serviceability/fare once credentials
   and Porter-issued endpoint details are configured.
4. `POST /api/shop/order` recalculates item totals on the server, re-quotes
   delivery, and creates the Razorpay payment order.
5. Drop details are signed server-side before payment.
6. After Razorpay payment verification, `POST /api/shop/verify` validates the
   signed request and sends the Porter courier booking.
7. Until Porter enterprise API access is configured, payment confirmation is
   preserved and the cafe can manually arrange a Porter delivery.

## Why Endpoints Are Configuration Values

Porter publishes the capabilities and onboarding route publicly, while the
specific API credential documentation is issued to integrated clients. The
implementation therefore does not guess live endpoint contracts. Configure
the exact URLs and token supplied by Porter after onboarding.

## Environment Setup

Add these values to `.env.local` after Porter supplies API access:

```env
PORTER_API_TOKEN=your_porter_api_token
PORTER_QUOTE_URL=porter_supplied_get_quote_endpoint
PORTER_CREATE_ORDER_URL=porter_supplied_create_order_endpoint
PORTER_PICKUP_LATITUDE=your_verified_cafe_latitude
PORTER_PICKUP_LONGITUDE=your_verified_cafe_longitude
```

## Launch Checklist

- Submit Porter's API integration onboarding form and obtain credentials.
- Use the Porter-issued endpoint schemas to align any final field naming.
- Verify the cafe's precise pickup coordinates in the Porter account.
- Add webhook persistence/admin order views when operational dispatch begins.
- Enable proof of delivery in the Porter dashboard if desired.
