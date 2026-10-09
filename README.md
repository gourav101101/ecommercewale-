# EcommerceWale

A Next.js packaging storefront on GitHub and Vercel, with itemised WhatsApp order enquiries.

## Development

```sh
npm ci
npm run dev
```

Open http://localhost:3000. Without `MONGODB_URI`, storefront previews use the bundled product catalogue. Database-backed features require a real MongoDB connection.

## Verification

```sh
npm test
npm run lint
npm run build
npm start
```

On Windows with Edge installed, `node scripts/review-storefront.mjs` runs a hidden browser review and saves screenshots and a report to the ignored `test-artifacts/` directory.

## Production

Preserve `MONGODB_URI` in Vercel. Configure server-only `ADMIN_EMAIL`, `ADMIN_PASSWORD` (at least 12 characters), and `ADMIN_SESSION_SECRET` (at least 32 random characters) before enabling admin access. Configure a durable login rate-limit/WAF rule on the deployment.

Read [the redesign and deployment notes](docs/REDESIGN.md) for the WhatsApp workflow, setup requirements, validation limits, and remaining business checks.

See [the whole-store redesign notes](docs/WHOLE-STORE-REDESIGN.md) for the rebuilt shop, product configuration, cart, quote journey, wishlist and support pages, plus browser verification coverage.

The storefront now uses all 44 supplier products and 688 exact variants as reference quote estimates. `/admin/suppliers` manages per-variant price and availability overrides without overwriting source data or existing products. See [connected supplier catalogue notes](docs/CONNECTED-SUPPLIER-CATALOGUE.md) for pricing semantics, storage and verification limits, and [earlier image/source notes](docs/SUPPLIER-ADMIN-UPDATE.md) for provenance. Run `node scripts/review-admin.mjs` after a production build for an isolated Windows/Edge admin check with no database connection.

Customers must send the prepared message in WhatsApp. The site does not take online payments or automatically create confirmed orders from enquiries. Our team confirms stock, final pricing, GST, delivery and payment instructions.

Pushes to the Vercel-connected production branch trigger a deployment. Review and test changes before publishing.
# Original catalogue visuals and automatic refresh

See [original visuals, refresh workflow and verification](docs/ORIGINAL-VISUALS-AND-REFRESH.md) for the 32 generated assets, admin refresh control, Vercel cron configuration and disposable-database integration checks.
