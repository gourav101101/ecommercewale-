# Shop/product server-render failure

On 14 October 2026 the live `/shop` and `/api/products` both returned HTTP 500. Shop response digest: `1107292096`. React #441 is the production wrapper for a Server Component render error; the browser stack does not identify the underlying driver error. Preload warnings do not explain these server failures.

Read-only inspection of the locally configured database succeeded with network access: 14 custom products, 44 source supplier products, zero supplier overrides, and 41 active products after assortment filtering. This does not prove Vercel uses the same environment values or has the same network access. Hosting logs are needed to distinguish production credentials, DNS, Atlas network access, or another runtime error.

The owner subsequently supplied the production log: `MongoServerError: bad auth : authentication failed`, code `8000`, codeName `AtlasError`, digest `1107292096`. This confirms production authentication failure, not a React/preload defect. The working local connection string must be configured correctly in Vercel's Production `MONGODB_URI`, followed by redeployment. Do not paste the URI in chat or commit `.env.local`.

## Code changes

- Public shop and product reads have a bounded reference-catalogue fallback outside the successful-read cache. Failure responses do not replace cached live data for five minutes.
- Reference products display an outage notice, disable order-list additions, and omit legacy product offer structured data. They never stand in for confirmed inventory or store overrides.
- Unknown database-only product slugs retain the failure rather than producing false 404s.
- Admin APIs, writes, and commercial confirmation do not use the fallback.
- Sanitized server events identify the read operation and failure category without connection strings or driver error messages.
- Authenticated `/api/admin/database-health` reports connection status and next steps without exposing credentials. It is available after deployment; unauthenticated requests receive 401.

## Production follow-up

Deploy the reviewed changes through the existing GitHub/Vercel workflow. Existing uncommitted project changes must be reviewed before inclusion in a deployment. In Vercel, check that `MONGODB_URI` is set for **Production**, matches the intended cluster/database user, and has correctly encoded special password characters. An environment update requires a redeployment. Check Atlas cluster status, database-user access and Network Access for the hosting environment; use the appropriate restricted network configuration for the deployment.

Check hosting logs for a failed `/shop` request or the new `storefront_catalogue_unavailable` event. Once the database connection is corrected, verify authenticated database health, `/shop`, each category, and a product page. The fallback is an availability fix, not a substitute for correcting the production connection.

`node --test tests/catalogue-resilience.test.mjs` checks failure isolation, time limits, recovery and non-orderable references. `node scripts/review-storefront-outage.mjs` runs the production build against a deliberately unreachable local database and verifies actual route responses without accessing store data.
