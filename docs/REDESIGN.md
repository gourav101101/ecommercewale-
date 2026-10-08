# EcommerceWale storefront upgrade

This redesign keeps the existing Next.js app, GitHub repository, Vercel deployment, product catalogue and business WhatsApp number (+91 98277 87080).

## Direction and references

Apple's shop (https://www.apple.com/shop/buy-iphone) and Bellroy's catalogue (https://bellroy.com/products/category/all) informed the emphasis on product choices, clear navigation, restrained presentation and useful product imagery. They are references, not claims of an objective ranking or templates copied into this project.

The storefront uses warm neutrals, orange accents, responsive product imagery, quieter controls, and consistent typography. Existing sample imagery is retained; several different SKUs share the same image and should eventually receive accurate individual photography.

## Ordering

Customers build an order list, review quantities, and complete a short enquiry form. WhatsApp receives an itemised enquiry with selected sizes, quantities, catalogue estimates, customer name, mobile, pincode and optional notes. The customer must press Send in WhatsApp. Opening WhatsApp does not create a confirmed order, collect payment, or automatically record an order in MongoDB. The cart remains available after the handoff. A manual link and copy option recover from blocked popups.

Catalogue prices are estimates before GST and delivery. The team confirms stock, applicable GST, delivery costs, payment instructions and the final quote in WhatsApp. The old mock payment methods, fake order confirmation and nonpersistent coupon are removed.

## Server configuration before deployment

Keep the existing `MONGODB_URI` in Vercel. Configured database failures now fail explicitly rather than silently starting an ephemeral database. When no URI is supplied, the bundled catalogue supports local previews; database-dependent features such as reviews and contact submission still require MongoDB.

Set these server-only environment variables to enable the admin portal:

- `ADMIN_EMAIL`: the owner's admin email.
- `ADMIN_PASSWORD`: a unique password of at least 12 characters.
- `ADMIN_SESSION_SECRET`: a cryptographically random secret of at least 32 characters.

Admin authentication uses a signed, expiring, HTTP-only, SameSite cookie and server checks. Product writes, order/customer/dashboard access and contact-list access require that session. Missing credentials disable admin access. Set a durable login rate-limit/WAF rule in Vercel before enabling public production admin login; application memory is not a durable serverless rate limiter. The destructive public seed endpoint is disabled. Do not use the former demo credentials.

## Performance and accessibility

- Cached lean catalogue queries include the pricing data required by order controls.
- Home uses the same cached catalogue instead of an uncached database query.
- Next Image responsive sizes and lazy loading replace CSS background images on catalogue cards; hero/product main images have priority.
- System typography removes a blocking remote CSS font request.
- Content remains visible without scroll-observer execution; reduced-motion preferences are respected.
- Skip link, visible focus, native modal navigation, semantic card links, form labels and named quantity buttons improve keyboard use.
- Security response headers and error/not-found states cover failure paths.

## Remaining business work

Verify catalogue prices, sizes, availability, product-specific imagery, existing reviews, marketplace compatibility, business contact details and legacy policy claims. The redesigned home and About page avoid unverified manufacturing, certification and customer-count claims.

Next.js and its lint configuration are upgraded to 16.4.0. The production-only npm audit reports zero known vulnerabilities after compatible dependency fixes. The full audit still reports five high-severity entries in one development lint dependency chain (`braces` → `micromatch` → `fast-glob` → Next lint plugin/config); npm proposes an incompatible major downgrade rather than a compatible patch. Do not use `npm audit fix --force` blindly.

Measure field Core Web Vitals and real mobile network performance after deployment. A successful local build or browser test does not establish a Lighthouse score or a worldwide ranking. Production MongoDB behaviour requires testing with the actual Vercel configuration.

## Local checks

Run `npm ci`, `npm test`, `npm run lint`, and `npm run build`. Start the production preview with `npm start`. On Windows with Edge installed, `node scripts/review-storefront.mjs` checks the storefront through a hidden browser against `http://127.0.0.1:3000` (override with `REVIEW_URL`). It writes ignored screenshots and a report into `test-artifacts/`, and closes the browser it launched.
