# Delivery Partner Integration

## Selected Provider: Borzo

Borzo (formerly Borzo Delivery) is the production delivery partner selected for
La Couronne's direct ordering flow. Borzo offers:

- Same-day delivery service in Bangalore
- Two-wheeler and four-wheeler delivery options
- Real-time tracking and updates
- API integration for automated dispatch

Official reference: https://www.borzo.in/

## Implemented Flow

1. The customer orders directly on La Couronne's website.
2. A delivery customer enters their address and shares a delivery pin.
3. `POST /api/delivery/quote` checks Borzo serviceability/fare once credentials
   are configured.
4. `POST /api/shop/order` recalculates item totals on the server, re-quotes
   delivery, and creates the Razorpay payment order.
5. Drop details are signed server-side before payment.
6. After Razorpay payment verification, `POST /api/shop/verify` validates the
   signed request and dispatches the Borzo courier.
7. Until Borzo API access is configured, payment confirmation is preserved and
   the cafe can manually arrange a delivery.

## Environment Setup

Add these values to `.env.local` after obtaining Borzo API access:

```env
BORZO_API_KEY=your_borzo_api_key
BORZO_CLIENT_ID=your_borzo_client_id
BORZO_CALLBACK_URL=https://lacouronneindia.com/api/borzo/webhook
BORZO_PICKUP_LATITUDE=12.9881
BORZO_PICKUP_LONGITUDE=77.5944
BORZO_PICKUP_UNION=Bangalore
BORZO_DROP_UNION=Bangalore
```

## API Endpoints Used

- **Quote**: `POST https://apistore.borzo.in/quotation` - Get delivery fare
- **Order**: `POST https://apistore.borzo.in/order` - Create delivery order

## Launch Checklist

- [ ] Sign up for Borzo Business/Tie-up at borzo.in
- [ ] Obtain API credentials (API key and Client ID)
- [ ] Configure pickup location coordinates in Borzo dashboard
- [ ] Set up webhook endpoint for delivery status updates
- [ ] Test with a sample delivery order
- [ ] Verify tracking URLs work correctly