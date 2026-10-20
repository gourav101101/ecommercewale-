'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminConfirm } from '@/context/AdminConfirmContext';

export default function CategoriesPage() {
  const confirm = useAdminConfirm();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(null);
  const router = useRouter();
  useEffect(() => {
    fetch('/api/admin/categories', { cache: 'no-store' }).then(async response => {
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setData(result);
    }).catch(error => setError(error.message));
  }, []);
  async function toggle(category) {
    if (saving !== null) return;
    if (!await confirm({ title: `${category.active ? 'Deactivate' : 'Activate'} category?`, message: `${category.active ? 'Hide' : 'Restore'} ${category.name} and its products on the website?`, confirmLabel: category.active ? 'Deactivate category' : 'Activate category', destructive: category.active })) return;
    setSaving(category.id); setError('');
    try {
      const response = await fetch('/api/admin/categories', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ categoryId: category.id, active: !category.active }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setData(previous => ({ ...previous, categories: previous.categories.map(item => item.id === result.categoryId ? { ...item, active: result.active } : item) }));
      router.refresh();
    } catch (error) { setError(error.message); }
    finally { setSaving(null); }
  }
  return <div>
    <p className="adminNotice">Inactive categories and their products are hidden from the website. Products remain saved and can be restored by activating the category.</p>
    {error && <p role="alert">{error}</p>}
    {!data && !error && <p>Loading categories…</p>}
    {data && <><p>{!data.editingEnabled && 'Connect MongoDB to save category changes.'}</p><div className="adminPanel"><div className="tableWrapper"><table className="adminTable"><thead><tr><th>Category</th><th>Products</th><th>Status</th><th>Action</th></tr></thead><tbody>
      {data.categories.map(category => <tr key={category.id}><td>{category.name}</td><td>{category.productCount}</td><td>{category.active ? 'Active' : 'Inactive'}</td><td><button className="btn btn-secondary btn-sm" disabled={!data.editingEnabled || saving !== null} onClick={() => toggle(category)} aria-label={`${category.active ? 'Deactivate' : 'Activate'} ${category.name}`}>{saving === category.id ? 'Saving…' : category.active ? 'Deactivate' : 'Activate'}</button></td></tr>)}
    </tbody></table></div></div></>}
  </div>;
}
