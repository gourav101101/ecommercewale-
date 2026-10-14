import Link from 'next/link';

export default function CatalogueNotice() {
  return <div role="status" className="container" style={{padding:'16px 20px',marginTop:20,marginBottom:20,background:'#fff5e5',color:'#65441b',border:'1px solid #ead4af',borderRadius:10,fontSize:14,lineHeight:1.6}}>
    Live prices and availability are temporarily unavailable. You can browse reference products and sizes; please <Link href="/contact" style={{textDecoration:'underline'}}>contact us</Link> for a current quote.
  </div>;
}
