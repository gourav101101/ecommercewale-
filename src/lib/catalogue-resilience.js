// Keep a database outage from taking reference product browsing offline.
// Do not use this for admin writes, inventory checks or order confirmation.
export function databaseFailureCategory(error) {
  const message=String(error?.message||'');
  if(error?.code===18 || /authentication failed|bad auth/i.test(message))return 'authentication';
  if(/querySrv|ENOTFOUND|EAI_AGAIN/.test(message) || error?.code==='ETIMEOUT')return 'dns';
  if(/MONGODB_URI is required/.test(message))return 'not-configured';
  if(/MongoParseError/.test(error?.name||''))return 'connection-string';
  if(/ServerSelection|Network|Timeout/.test(error?.name||'') || /timed out|ECONNREFUSED/i.test(message))return 'connectivity';
  return 'catalogue-read';
}

export function referenceOnlyProduct(product) {
  return {...product,catalogueUnavailable:true,inStock:false,
    ...(product.variants?{variants:product.variants.map(variant=>({...variant,available:false}))}:{}),
  };
}

export async function withCatalogueFallback(read,fallback,{operation='catalogue',timeoutMs=6500,onFailure}={}) {
  let timer;
  try {
    return await Promise.race([
      Promise.resolve().then(read),
      new Promise((_,reject)=>{timer=setTimeout(()=>{const error=new Error('Catalogue read timed out');error.name='CatalogueTimeout';reject(error);},timeoutMs);}),
    ]);
  } catch(error) {
    // Do not log raw driver errors: they may contain credentials, hosts or customer data.
    const diagnostic={event:'storefront_catalogue_unavailable',operation,category:databaseFailureCategory(error)};
    if(onFailure)onFailure(diagnostic);else console.error(JSON.stringify(diagnostic));
    return fallback(error);
  } finally {clearTimeout(timer);}
}
