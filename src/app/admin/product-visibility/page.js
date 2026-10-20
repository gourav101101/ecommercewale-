'use client';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminConfirm } from '@/context/AdminConfirmContext';

export default function ProductVisibilityPage() {
  const confirm = useAdminConfirm();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const router = useRouter();
  const load = useCallback(async () => {
    setError('');
    try {
      const response = await fetch('/api/admin/product-visibility', { cache: 'no-store' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setData(result);
    } catch (error) { setError(error.message); }
  }, []);
  useEffect(() => { queueMicrotask(load); }, [load]);
  async function toggle(product) {
    if (saving !== null) return;
    if (!await confirm({ title: `${product.active ? 'Deactivate' : 'Activate'} product?`, message: `${product.active ? 'Hide' : 'Restore'} ${product.name} on the website?${!product.active && !product.categoryActive ? ' Its category is inactive, so it will stay hidden until the category is activated.' : ''}`, confirmLabel: product.active ? 'Deactivate product' : 'Activate product', destructive: product.active })) return;
    setSaving(product.id); setError(''); setMessage('');
    try {
      const response = await fetch('/api/admin/product-visibility', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId: product.id, active: !product.active }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setData(previous => ({ ...previous, products: previous.products.map(item => item.id === result.productId ? { ...item, active: result.active } : item) }));
      setMessage(`${product.name} is now ${result.active ? 'active' : 'inactive'}.${result.active && !product.categoryActive ? ' Its category is inactive, so it remains hidden.' : ''}`);
      router.refresh();
    } catch (error) { setError(error.message); }
    finally { setSaving(null); }
  }
  const rows = data?.products.filter(product => (category === 'all' || product.category === category) && product.name.toLowerCase().includes(search.toLowerCase().trim())) || [];
  return <div>
    <p className="adminNotice">Activate or deactivate individual supplier and custom products. Inactive products stay saved but are hidden from the storefront. An inactive category hides its products even when their individual status is active. Stock availability is managed separately.</p>
    {error && <p role="alert">{error} <button onClick={load}>Retry</button></p>}
    {message && <p role="status">{message}</p>}
    {!data && !error && <p>Loading products…</p>}
    {data && <>
      {!data.editingEnabled && <p>Connect MongoDB to save changes.</p>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
        <label>Search products <input type="search" value={search} onChange={event => setSearch(event.target.value)} /></label>
        <label>Category <select value={category} onChange={event => setCategory(event.target.value)}><option value="all">All categories</option>{data.categories.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      </div>
      <div className="adminPanel"><div className="tableWrapper"><table className="adminTable"><thead><tr><th>Product</th><th>Category</th><th>Product status</th><th>Website visibility</th><th>Action</th></tr></thead><tbody>
        {rows.map(product => <tr key={product.id}><td>{product.name}</td><td>{data.categories.find(item => item.id === product.category)?.name || product.category}</td><td>{product.active ? 'Active' : 'Inactive'}</td><td>{!product.categoryActive ? 'Hidden — category inactive' : product.active ? 'Visible' : 'Hidden'}</td><td><button className="btn btn-secondary btn-sm" disabled={!data.editingEnabled || saving !== null} onClick={() => toggle(product)} aria-label={`${product.active ? 'Deactivate' : 'Activate'} ${product.name}`}>{saving === product.id ? 'Saving…' : product.active ? 'Deactivate' : 'Activate'}</button></td></tr>)}
        {!rows.length && <tr><td colSpan={5}>No matching products.</td></tr>}
      </tbody></table></div></div>
    </>}
  </div>;
}
