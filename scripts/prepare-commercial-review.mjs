import fs from 'node:fs/promises';
import { commercialReviewRows } from '../src/lib/supplier-commercial-review.js';

const snapshot=JSON.parse(await fs.readFile('research/ecosoft-full-catalogue.json','utf8'));
const rows=commercialReviewRows(snapshot);
const quote=value=>'"'+String(value??'').replaceAll('"','""').replace(/^[=+@-]/,"'$&")+'"';
await fs.writeFile('research/ecosoft-commercial-confirmation.csv','\uFEFF'+rows.map(row=>row.map(quote).join(',')).join('\n')+'\n');
console.log(`Prepared ${rows.length-1} variant review rows. Unknown commercial terms remain blank; none are confirmed.`);
