# Local admin database setup

Admin authentication and the supplier snapshot review can run without MongoDB.
Recorded orders, customers, inquiries, custom products, dashboard totals and saved supplier overrides require a database.

Configure `MONGODB_URI` in the ignored `.env.local` file using your actual MongoDB connection string, then restart the development server. Do not commit or share the connection string publicly.

When it is missing, the dashboard shows a setup notice instead of querying MongoDB. Database-backed APIs return an explicit 503 setup response, and admin record lists show that message instead of treating an error object as an array. No fictional orders, totals or customers are used as fallback data, and no writes are represented as saved.

A configured but unreachable database is still an operational error, not an empty database. Check connectivity and database credentials if the setup notice is gone but requests fail.

## Import the captured supplier catalogue

`node scripts/import-supplier-snapshot.mjs` inserts the captured Ecosoft export as the `ecosoft` document in `suppliersnapshots`. It reads back the saved data and reports product/variant counts and exact snapshot equality. If a snapshot already exists, it is preserved rather than overwritten. This does not change custom products, orders, customers, contacts or supplier variant overrides.

Raw review-status labels, unresolved pack codes and source-price warnings remain intact. Saving a snapshot is not commercial approval. Images remain local website assets referenced by the catalogue mapping. Admin variant overrides are saved separately when the owner confirms and saves them; importing does not manufacture overrides.

No tests, build, browser review, deployment or database writes were performed for this change.
