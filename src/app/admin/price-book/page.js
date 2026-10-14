'use client';
import { useEffect,useState,useRef } from 'react';
import Link from 'next/link';
import { calculatePrice,initialPriceSettings } from '@/lib/price-book';
import styles from './page.module.css';

const money=value=>value==null?'Not set':new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:2}).format(value);
export default function PriceBook() {
  const [book,setBook]=useState(null),[error,setError]=useState(''),[query,setQuery]=useState(''),[group,setGroup]=useState(''),[selected,setSelected]=useState(null);
  const [onlyPending,setOnlyPending]=useState(false);
  useEffect(()=>{
    const controller=new AbortController();
    fetch('/api/admin/price-book',{signal:controller.signal}).then(async res=>{if(!res.ok)throw new Error('Cannot load price book. Sign in again or retry.');setBook(await res.json());}).catch(error=>{if(error.name!=='AbortError')setError(error.message);});
    return ()=>controller.abort();
  },[]);
  if(error)return <div className="adminNotice" role="alert">{error} <button onClick={()=>location.reload()}>Retry</button></div>;
  if(!book)return <p role="status">Loading Ecosoft purchase costs…</p>;
  const records=new Map(book.records.map(record=>[record.itemId,record]));
  const complete=book.records.filter(record=>calculatePrice(book.items.find(item=>item.id===record.itemId),record.settings).ready).length;
  const items=book.items.filter(item=>(!group || item.groupId===group) && `${item.name} ${item.size} ${item.code} ${item.option}`.toLowerCase().includes(query.toLowerCase().replaceAll(' × ','x').trim()) && (!onlyPending || !records.has(item.id) || !calculatePrice(item,records.get(item.id).settings).ready));
  return <div className={styles.page}>
    <section className={styles.hero}><div><span>ECOSOFT · PRIVATE PURCHASE PRICE BOOK</span><h2>Know your cost. Price every pack.</h2><p>Supplier PDF rates are per bag, excluding GST and delivery. Keep purchase costs, freight and your selling prices together.</p></div>{book.editingEnabled?<a className="btn btn-outline" href="/api/admin/price-book?format=csv">Export costs CSV</a>:<button className="btn btn-outline" disabled>Export unavailable</button>}</section>
    <div className={styles.stats}><div><strong>{book.groups.length}</strong>Product families</div><div><strong>{book.items.length}</strong>Size / POD / colour variants</div><div><strong>{complete}</strong>Costings complete</div><div><strong>{book.items.length-complete}</strong>Costings to review</div></div>
    {!book.editingEnabled&&<div className="adminNotice" role="alert">Database unavailable. You can inspect PDF costs and try calculations, but saving, applying and exporting saved records are disabled.</div>}
    <div className={styles.note}><strong>Purchase terms confirmed: GST and delivery are extra.</strong><p>GST rates, HSN, stock, price validity and bag specifications are not supplied. Quoted quantity columns are not a confirmed MOQ. The 25% target margin is an editable planning starting point. Costings stay private until you explicitly apply a saved pack estimate to a matched website variant.</p><p>Source: {book.source.file} · Recorded {book.source.recordedOn} · PDF page numbers include the cover. <Link href="/admin/suppliers">Open connected website variants →</Link></p></div>
    <div className={styles.toolbar}><label>Find a product<input aria-label="Search price book" placeholder="Product, size or supplier code" value={query} onChange={e=>setQuery(e.target.value)}/></label><label>Product family<select value={group} onChange={e=>setGroup(e.target.value)}><option value="">All 12 families</option>{book.groups.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select></label><label className={styles.check}><input type="checkbox" checked={onlyPending} onChange={e=>setOnlyPending(e.target.checked)}/> Needs costing</label></div>
    <p>{items.length} variants shown. POD and Non-POD codes are scoped to their product family.</p>
    <div className={styles.tableWrap}><table><thead><tr><th>Product / size</th><th>Supplier code</th><th>Purchase cost / bag</th><th>Your costing</th><th>Action</th></tr></thead><tbody>{items.map(item=>{
      const record=records.get(item.id),quote=record?calculatePrice(item,record.settings):null;
      return <tr key={item.id}><td><strong>{item.name}</strong><span>{item.size.replace('x',' × ')} inches {item.option&&`· ${item.option}`}</span><small>PDF p. {item.page}{item.flags.some(flag=>flag.includes('NP'))?' · Code / size discrepancy':''}</small></td><td>{item.code||'Not provided'}</td><td>{item.tiers.map(t=><span key={t.quantity??'single'}>{t.quantity?`${t.quantity.toLocaleString('en-IN')} bags`:'Quantity unspecified'}: <b>{money(t.unitCost)}</b></span>)}</td><td>{quote?<><strong>{money(quote.sellingPerBag)} / bag</strong><span>{quote.ready?'Costing complete':'Review needed'}</span></>:<span>Not costed</span>}</td><td><button className="btn btn-outline btn-sm" onClick={()=>setSelected(item)}>Cost & price</button></td></tr>;
    })}</tbody></table>{!items.length&&<p className={styles.empty}>No matches. Change the search or filters.</p>}</div>
    {selected&&<CostEditor key={selected.id} item={selected} record={records.get(selected.id)} enabled={book.editingEnabled} onClose={()=>setSelected(null)} onSaved={record=>setBook(previous=>({...previous,records:[...previous.records.filter(r=>r.itemId!==record.itemId),record]}))}/>}
  </div>;
}
function CostEditor({item,record,enabled,onClose,onSaved}) {
  const dialog=useRef(null);
  const [form,setForm]=useState(()=>record?.settings??initialPriceSettings(item));
  const [revision,setRevision]=useState(record?.revision??0),[dirty,setDirty]=useState(!record),[busy,setBusy]=useState(false),[status,setStatus]=useState('');
  const [targets,setTargets]=useState([]),[targetError,setTargetError]=useState('');
  useEffect(()=>{
    const previousFocus=document.activeElement,overflow=document.body.style.overflow;
    document.body.style.overflow='hidden';
    dialog.current?.querySelector('button')?.focus();
    const trap=event=>{
      if(event.key!=='Tab')return;
      const controls=[...dialog.current.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href]')];
      const first=controls[0],last=controls.at(-1);
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
    };
    document.addEventListener('keydown',trap);
    return ()=>{document.body.style.overflow=overflow;document.removeEventListener('keydown',trap);previousFocus?.focus();};
  },[]);
  useEffect(()=>{
    const controller=new AbortController();
    fetch('/api/admin/supplier-catalogue',{signal:controller.signal}).then(async response=>{if(!response.ok)throw new Error('Website variants unavailable.');const data=await response.json();setTargets(data.products.filter(p=>!p.storefrontExcluded&&p.variants.some(v=>v.isCourierBag)));}).catch(e=>{if(e.name!=='AbortError')setTargetError(e.message);});
    return ()=>controller.abort();
  },[]);
  const change=(key,value)=>{setForm(prev=>({...prev,[key]:value,...(['quantity','costOverride'].includes(key)?{supplierConfirmed:false}:{}),...(key==='matchConfirmed'?{}:{matchConfirmed:false})}));setDirty(true);setStatus('Unsaved changes');};
  let quote=null,calculationError='';
  try {quote=calculatePrice(item,form);}catch(error){calculationError=error.message;}
  const number=(key,label,{max=10000000,step='0.01',min=0,help}={})=><label>{label}<input name={key} type="number" min={min} max={max} step={step} value={form[key]??''} onChange={e=>change(key,e.target.value===''?null:Number(e.target.value))}/>{help&&<small>{help}</small>}</label>;
  async function save(event){
    event.preventDefault();if(busy)return;setBusy(true);setStatus('');
    try {const response=await fetch('/api/admin/price-book',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({itemId:item.id,revision,settings:form})});const result=await response.json();if(!response.ok)throw new Error(result.error);setForm(result.record.settings);setRevision(result.record.revision);onSaved(result.record);setDirty(false);setStatus('Costing saved. Website price has not changed.');}catch(error){setStatus(error.message);}finally{setBusy(false);}
  }
  async function apply(){
    if(busy || dirty)return;setBusy(true);setStatus('');
    try {const response=await fetch('/api/admin/price-book',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({itemId:item.id,revision})});const result=await response.json();if(!response.ok)throw new Error(result.error);setStatus(result.message);}catch(error){setStatus(error.message);}finally{setBusy(false);}
  }
  const product=targets.find(p=>String(p.id)===form.productId);
  return <div className={styles.overlay}><section ref={dialog} className={styles.drawer} role="dialog" aria-modal="true" aria-labelledby="cost-title" onKeyDown={e=>{if(e.key==='Escape'&&!busy&&(!dirty||window.confirm('Discard unsaved costing changes?')))onClose();}}>
    <header><div><h2 id="cost-title">{item.name}</h2><p>{item.size.replace('x',' × ')} inches · {item.option||item.code||'Standard'} · PDF p. {item.page}</p></div><button className="btn btn-outline" disabled={busy} onClick={()=>{if(!dirty || window.confirm('Discard unsaved costing changes?'))onClose();}}>Close</button></header>
    <div className={styles.drawerBody}>
      {item.flags.length>0&&<div className={styles.note}><strong>Supplier checks</strong><ul>{item.flags.map(flag=><li key={flag}>{flag}</li>)}</ul></div>}
      <form onSubmit={save}><fieldset disabled={busy} className={styles.fields}>
        <legend>1. Purchase batch & selling pack</legend>
        <label>Quoted supplier tier<select value={form.tierQuantity??''} onChange={e=>{const value=e.target.value===''?null:Number(e.target.value);setForm(prev=>({...prev,tierQuantity:value,quantity:value??prev.quantity,packQuantity:Math.min(prev.packQuantity,value??prev.quantity),supplierConfirmed:false,matchConfirmed:false}));setDirty(true);}}>{item.tiers.map(t=><option key={t.quantity??'none'} value={t.quantity??''}>{t.quantity?`${t.quantity} bags`:'Quantity unspecified'} — {money(t.unitCost)} / bag</option>)}</select></label>
        {form.tierQuantity===null?number('quantity','Purchase batch (bags)',{min:1,max:9999999,step:'1'}):<div><small>Purchase batch</small><strong className={styles.block}>{form.quantity} bags</strong></div>}
        {number('packQuantity','Bags in your selling pack',{min:1,max:999999,step:'1'})}
        {number('costOverride','Revised supplier cost / bag (optional)',{min:0.01,max:100000,help:'Blank preserves the PDF rate. Record the reason in notes.'})}
        <label className={styles.wide}>Costing / supplier notes<textarea maxLength={1000} value={form.notes} onChange={e=>change('notes',e.target.value)} placeholder="Quote date, supplier confirmation, revised costs or delivery destination"/></label>
        <label className={`${styles.check} ${styles.wide}`}><input type="checkbox" checked={form.supplierConfirmed} onChange={e=>change('supplierConfirmed',e.target.checked)}/> I checked this size, POD / colour, order quantity and current supplier rate.</label>
      </fieldset>
      <fieldset disabled={busy} className={styles.fields}><legend>2. Costs & margin</legend>
        {number('inboundFreight','Inbound freight for entire purchase batch (₹)',{help:'Enter the cost borne by the business, including any unrecoverable charges.'})}
        {number('handlingPerBag','Handling / packing cost per bag (₹)',{max:100000})}
        {number('outboundPerPack','Outbound delivery allowance per selling pack (₹)',{help:'Built into the suggested pack price. Confirm the destination.'})}
        {number('feePercent','Fee allowance (% of ex-GST sales)',{max:99,help:'Budget allowance, not a payment gateway tax calculation.'})}
        {number('targetMargin','Target margin on ex-GST sales (%)',{max:99})}
        {number('sellingPerBag','Your selling price / bag, ex-GST (optional)',{min:0.01,max:100000,help:'Blank uses the calculated suggestion.'})}
        <small className={styles.wide}>Unknown costs stay blank. Enter 0 only for confirmed zero costs. Margin = profit ÷ selling price; 25% margin is not a 25% markup.</small>
      </fieldset>
      <fieldset disabled={busy} className={styles.fields}><legend>3. GST details</legend>
        {number('gstRate','Confirmed GST rate (%)',{max:100})}
        <label>Confirmed HSN<input inputMode="numeric" maxLength={8} value={form.gstHsn} onChange={e=>change('gstHsn',e.target.value)}/></label>
        <label className={styles.wide}>Purchase GST in your costing<select value={form.purchaseGst} onChange={e=>change('purchaseGst',e.target.value)}><option value="pending">Not confirmed</option><option value="recoverable">Exclude from margin cost — recoverable</option><option value="cost">Include as a business cost — not recoverable</option></select></label>
        <small className={styles.wide}>Use your confirmed tax details. This calculator uses the same goods GST rate for buying and selling. Freight and handling inputs are final cost allowances; GST on those services is not calculated here.</small>
      </fieldset>
      <section className={styles.result} aria-live="polite"><h3>{quote?.ready?'Costing ready':'Planning estimate'}</h3>{calculationError?<p role="alert">{calculationError}</p>:<>
        <div className={styles.resultGrid}><div>Supplier / bag<strong>{money(quote.unitCost)}</strong></div><div>Cost / bag, with allowances<strong>{money(quote.costPerBag)}</strong></div><div>Suggested selling / bag<strong>{money(quote.suggestedPerBag)}</strong></div><div>Margin after allowances<strong>{quote.margin.toFixed(2)}%</strong></div><div>Selected pack, ex-GST<strong>{money(quote.packSubtotal)}</strong></div><div>Pack including goods GST<strong>{money(quote.packTotal)}</strong></div></div>
        <p>Purchase goods: {money(quote.purchaseSubtotal)} + {money(quote.purchaseGoodsGst)} goods GST. Freight is separate. Batch yields {quote.completePacks} complete packs and {quote.remainingBags} spare bags.</p>
        {quote.missing.length>0&&<p className={styles.warning}>Still needed: {quote.missing.join(', ')}. Missing allowances are temporarily treated as zero in this preview; applying is blocked.</p>}
        {quote.profitPerBag<0&&<p role="alert" className={styles.warning}>Selling below cost. Raise the selling price before applying.</p>}
        {quote.margin<form.targetMargin&&quote.profitPerBag>=0&&<p className={styles.warning}>Your chosen price is below the target margin.</p>}
      </>}</section>
      <fieldset disabled={busy} className={styles.fields}><legend>4. Match a website variant (optional)</legend>
        <p className={styles.wide}>Choose the exact family, dimensions, POD option and colour. This updates one existing pack estimate; it does not create duplicate products or change stock. Website order estimates still require final GST and delivery confirmation.</p>
        {targetError&&<p role="alert">{targetError}</p>}
        <label>Website product<select value={form.productId} onChange={e=>{setForm(prev=>({...prev,productId:e.target.value,variantId:'',matchConfirmed:false}));setDirty(true);}}><option value="">Choose product</option>{targets.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}</select></label>
        <label>Exact website variant<select value={form.variantId} onChange={e=>change('variantId',e.target.value)}><option value="">Choose variant</option>{product?.variants.map(v=><option key={v.id} value={v.id}>{v.title}</option>)}</select></label>
        <label className={`${styles.check} ${styles.wide}`}><input type="checkbox" checked={form.matchConfirmed} disabled={!form.variantId} onChange={e=>change('matchConfirmed',e.target.checked)}/> I verified the exact product match and {form.packQuantity} bags per selling pack.</label>
      </fieldset>
      <footer><button type="submit" className="btn btn-primary" disabled={busy||!enabled||!quote}>{busy?'Working…':'Save private costing'}</button><button type="button" className="btn btn-outline" disabled={busy||!enabled||dirty||!quote?.ready||!form.matchConfirmed||!form.variantId} onClick={apply}>Apply {quote?money(quote.packSubtotal):''} pack estimate to website</button><span role="status">{status}</span></footer>
      </form>
    </div>
  </section></div>;
}
