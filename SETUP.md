# B-Uniques Boutique — Backend Setup Guide
## Complete step-by-step to go live and start making sales

---

## WHAT YOU HAVE NOW

```
buniques_final/
├── index.html                          ← Your storefront (cart + checkout)
├── success.html                        ← Order confirmed page
├── admin.html                          ← Your sales dashboard
├── netlify.toml                        ← Netlify config
├── package.json                        ← Dependencies (Stripe, node-fetch)
├── SETUP.md                            ← This file
└── netlify/functions/
    ├── create-checkout.js              ← Creates Stripe payment session
    ├── stripe-webhook.js               ← Receives payment → sends to Printful
    ├── subscribe.js                    ← Saves newsletter signups
    └── get-orders.js                   ← Powers your admin dashboard
```

---

## STEP 1 — Deploy to Netlify (5 minutes)

1. Go to **app.netlify.com** → your site
2. **Drag and drop** the `buniques_final` ZIP onto the deploy panel
3. Netlify auto-detects the functions folder and deploys everything

---

## STEP 2 — Create your Stripe account (10 minutes)

1. Go to **stripe.com** → Create account (free)
2. Complete identity verification
3. Go to **Developers → API keys**
4. Copy your **Publishable key** (starts with `pk_live_...`) and **Secret key** (`sk_live_...`)
   - Use `pk_test_` / `sk_test_` keys first to test without real money

---

## STEP 3 — Set environment variables in Netlify (5 minutes)

In your Netlify dashboard → **Site settings → Environment variables**, add:

| Variable | Value | Where to get it |
|----------|-------|-----------------|
| `STRIPE_SECRET_KEY` | `sk_live_...` | Stripe → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Created in Step 4 below |
| `PRINTFUL_API_KEY` | Your key | Printful → Settings → API |
| `SITE_URL` | `https://b-uniquesboutique.com` | Your domain |
| `ADMIN_SECRET_TOKEN` | Make up a strong password | e.g. `BUniques2026!Fire` |
| `FORMSPREE_ALERT_ENDPOINT` | `https://formspree.io/f/YOUR_ID` | Optional — for error alerts |
| `FORMSPREE_ORDER_ENDPOINT` | `https://formspree.io/f/YOUR_ID` | Optional — for order confirmations |
| `FORMSPREE_SUBSCRIBE_ENDPOINT` | `https://formspree.io/f/YOUR_ID` | Optional — for newsletter signups |

After adding variables → **Trigger redeploy** (Deploys tab → Trigger deploy)

---

## STEP 4 — Set up Stripe webhook (5 minutes)

The webhook tells your site when a payment succeeds so it can auto-order from Printful.

1. In Stripe dashboard → **Developers → Webhooks → Add endpoint**
2. Endpoint URL: `https://b-uniquesboutique.com/.netlify/functions/stripe-webhook`
3. Events to listen for: select **`checkout.session.completed`**
4. Click **Add endpoint**
5. Copy the **Signing secret** (`whsec_...`)
6. Paste it as `STRIPE_WEBHOOK_SECRET` in Netlify env vars
7. Redeploy

---

## STEP 5 — Get your Printful API key (2 minutes)

1. Go to **printful.com** → Log in
2. Go to **Settings → API**
3. Click **Create token** → name it "B-Uniques Website"
4. Copy the token
5. Paste it as `PRINTFUL_API_KEY` in Netlify env vars

---

## STEP 6 — Connect Printful variant IDs (30 minutes — do this after first few sales)

When Stripe receives a payment, `stripe-webhook.js` needs to tell Printful exactly
which product variant to print (size, color, etc.).

To get your Printful sync variant IDs:

1. Go to: `https://api.printful.com/store/products`
   (with your API key as Bearer token in the Authorization header)
2. Or go to printful.com → your store → each product → the URL contains the product ID
3. Update `stripe-webhook.js` — replace the `printfulItems` mapping with real `sync_variant_id` values

**OR** — simpler approach for now:
- Leave the webhook as-is. When an order comes in, you'll get an alert email.
- You can manually place the Printful order while you're setting up the full integration.
- This is fine for your first 10-20 orders.

---

## STEP 7 — Set up Formspree (optional but recommended, 5 minutes)

Formspree sends you an email whenever someone submits the custom order form,
signs up for the newsletter, or when a Printful order fails.

1. Go to **formspree.io** → Sign up free
2. Create 3 forms:
   - "Custom Design Orders" → copy endpoint URL → put in `FORMSPREE_ALERT_ENDPOINT`
   - "Order Confirmations" → copy endpoint → `FORMSPREE_ORDER_ENDPOINT`
   - "Newsletter Signups" → copy endpoint → `FORMSPREE_SUBSCRIBE_ENDPOINT`
3. Redeploy Netlify

---

## STEP 8 — Access your admin dashboard

1. Go to: `https://b-uniquesboutique.com/admin.html`
2. Enter your `ADMIN_SECRET_TOKEN` (the password you made up in Step 3)
3. You'll see:
   - Total revenue & orders
   - Today's sales
   - Average order value
   - Top products
   - Full order history with customer details

---

## STEP 9 — Test a purchase end-to-end

1. Add a product to your cart on the site
2. Click Checkout
3. Use Stripe test card: **4242 4242 4242 4242** · exp: any future date · CVC: any 3 digits
4. Complete the purchase
5. Check your Netlify function logs (Netlify → Functions → stripe-webhook) to confirm the order was submitted to Printful
6. Check your admin dashboard — order should appear

---

## PRICING NOTES

Update the prices in the `PRODUCTS` object in `index.html` to match your actual
Printful prices + desired markup. Prices are currently set to approximately match
your Printful catalog.

**Suggested markup:** Printful cost × 2–2.5 = your retail price
Example: Hoodie costs $35 → sell for $65–$75

---

## OPTIONAL — Add Mailchimp for email marketing

1. Create a free Mailchimp account
2. Create an audience
3. Go to Account → Extras → API keys → Create key
4. Go to your audience → Audience ID (in settings)
5. Add to Netlify env vars:
   - `MAILCHIMP_API_KEY` = your key
   - `MAILCHIMP_LIST_ID` = your audience ID
6. Redeploy — all newsletter signups now go to Mailchimp automatically

---

## SUPPORT

- Stripe docs: stripe.com/docs
- Printful API: developers.printful.com
- Netlify Functions: docs.netlify.com/functions
- Your custom design form still goes to Formspree (no change needed)

🔥 Never Let The Flame Die
