'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Filter, Edit, Trash2 } from 'lucide-react';
import Modal from '@/components/ui/Modal/Modal';
import { useToast } from '@/context/ToastContext';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { showToast } = useToast();

  const emptyForm = {
    name: '', category: 'courier-bags', basePrice: '', bulkPrice: '',
    image: '', galleryUrls: '', featuresStr: '', specsStr: '',
    type: '', description: '', marketplaceCompatibleStr: '',
    sizesStr: '', bestSeller: false, inStock: true,
  };

  const [formData, setFormData] = useState(emptyForm);

  const parseSizes = (str) => {
    if (!str) return [{ label: 'Standard', value: 'standard', dimensions: 'Standard Size' }];
    return str.split('\n').filter(Boolean).map(line => {
      const parts = line.split('|').map(s => s.trim());
      return {
        label: parts[0] || 'Standard',
        value: parts[1] || parts[0]?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'standard',
        dimensions: parts[2] || parts[0] || 'Standard Size',
      };
    });
  };

  const parseSpecs = (str) => {
    if (!str) return { Material: 'Standard' };
    const specs = {};
    str.split('\n').forEach(line => {
      const idx = line.indexOf(':');
      if (idx > -1) specs[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    });
    return Object.keys(specs).length > 0 ? specs : { Material: 'Standard' };
  };

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch {
      showToast('Failed to fetch products from database', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const buildProduct = (base = {}) => ({
    ...base,
    name: formData.name,
    shortName: formData.name.substring(0, 20),
    type: formData.type || 'Standard',
    description: formData.description,
    category: formData.category,
    basePrice: parseFloat(formData.basePrice),
    bulkPrice: parseFloat(formData.bulkPrice),
    image: formData.image || 'https://images.unsplash.com/photo-1605600659942-1e9d29fc60eb?auto=format&fit=crop&q=80&w=600',
    inStock: formData.inStock,
    bestSeller: formData.bestSeller,
    marketplaceCompatible: formData.marketplaceCompatibleStr
      ? formData.marketplaceCompatibleStr.split(',').map(s => s.trim()).filter(Boolean)
      : [],
    gallery: formData.galleryUrls
      ? formData.galleryUrls.split('\n').map(s => s.trim()).filter(Boolean)
      : [formData.image || 'https://images.unsplash.com/photo-1605600659942-1e9d29fc60eb?auto=format&fit=crop&q=80&w=600'],
    pricing: [
      { minQty: 1, maxQty: 499, pricePerUnit: parseFloat(formData.basePrice), label: '1-499 units' },
      { minQty: 500, maxQty: null, pricePerUnit: parseFloat(formData.bulkPrice), label: '500+ units' },
    ],
    sizes: parseSizes(formData.sizesStr),
    specs: parseSpecs(formData.specsStr),
    features: formData.featuresStr
      ? formData.featuresStr.split('\n').map(s => s.trim()).filter(Boolean)
      : ['High quality packaging material', 'Secure seal', 'Durable design'],
  });

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const newProduct = buildProduct({ id: `new-${Date.now()}`, slug: `new-${Date.now()}`, rating: 5.0, reviewCount: 0 });
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });
      if (!res.ok) throw new Error();
      await fetchProducts();
      setIsAddModalOpen(false);
      setFormData(emptyForm);
      showToast('Product added successfully!', 'success');
    } catch {
      showToast('Error saving product to DB', 'error');
    }
  };

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      type: product.type || '',
      description: product.description || '',
      basePrice: product.basePrice,
      bulkPrice: product.bulkPrice,
      image: product.image,
      galleryUrls: product.gallery ? product.gallery.join('\n') : '',
      featuresStr: product.features ? product.features.join('\n') : '',
      specsStr: product.specs ? Object.entries(product.specs).map(([k, v]) => `${k}: ${v}`).join('\n') : '',
      marketplaceCompatibleStr: product.marketplaceCompatible ? product.marketplaceCompatible.join(', ') : '',
      sizesStr: product.sizes ? product.sizes.map(s => `${s.label} | ${s.value} | ${s.dimensions}`).join('\n') : '',
      bestSeller: !!product.bestSeller,
      inStock: product.inStock !== false,
    });
    setIsEditModalOpen(true);
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;
    const updatedProduct = buildProduct(selectedProduct);
    try {
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct),
      });
      if (!res.ok) throw new Error();
      await fetchProducts();
      setIsEditModalOpen(false);
      setSelectedProduct(null);
      showToast('Product updated successfully!', 'success');
    } catch {
      showToast('Error updating product', 'error');
    }
  };

  const openDeleteModal = (product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;
    try {
      const res = await fetch(`/api/products?id=${selectedProduct.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      await fetchProducts();
      setIsDeleteModalOpen(false);
      setSelectedProduct(null);
      showToast('Product deleted successfully!', 'success');
    } catch {
      showToast('Error deleting product', 'error');
    }
  };

  // Shared form fields JSX (used in both Add & Edit modals)
  const renderFormFields = (idPrefix = '') => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="input-group">
        <label htmlFor={`${idPrefix}name`}>Product Name</label>
        <input type="text" id={`${idPrefix}name`} name="name" className="input" required
          value={formData.name} onChange={handleInputChange} />
      </div>

      <div className="input-group">
        <label htmlFor={`${idPrefix}category`}>Category</label>
        <select id={`${idPrefix}category`} name="category" className="input"
          value={formData.category} onChange={handleInputChange}>
          <option value="courier-bags">Courier Bags</option>
          <option value="boxes-tapes">Boxes &amp; Tapes</option>
          <option value="labels-stickers">Labels &amp; Stickers</option>
          <option value="shredded-paper">Shredded Paper</option>
        </select>
      </div>

      <div className="grid-2">
        <div className="input-group">
          <label htmlFor={`${idPrefix}type`}>Product Type Tag</label>
          <input type="text" id={`${idPrefix}type`} name="type" className="input"
            placeholder="e.g. Transparent, Corrugated"
            value={formData.type} onChange={handleInputChange} />
        </div>
        <div className="input-group">
          <label htmlFor={`${idPrefix}mp`}>Marketplaces (comma-separated)</label>
          <input type="text" id={`${idPrefix}mp`} name="marketplaceCompatibleStr" className="input"
            placeholder="amazon, flipkart, myntra"
            value={formData.marketplaceCompatibleStr} onChange={handleInputChange} />
        </div>
      </div>

      <div className="input-group">
        <label htmlFor={`${idPrefix}desc`}>Description</label>
        <textarea id={`${idPrefix}desc`} name="description" className="input" rows="3"
          placeholder="Product description..."
          value={formData.description} onChange={handleInputChange} />
      </div>

      <div className="grid-2">
        <div className="input-group">
          <label htmlFor={`${idPrefix}basePrice`}>Base Price (₹)</label>
          <input type="number" id={`${idPrefix}basePrice`} name="basePrice" className="input"
            min="0" step="0.01" required
            value={formData.basePrice} onChange={handleInputChange} />
        </div>
        <div className="input-group">
          <label htmlFor={`${idPrefix}bulkPrice`}>Bulk Price (₹)</label>
          <input type="number" id={`${idPrefix}bulkPrice`} name="bulkPrice" className="input"
            min="0" step="0.01" required
            value={formData.bulkPrice} onChange={handleInputChange} />
        </div>
      </div>

      <div className="input-group">
        <label htmlFor={`${idPrefix}image`}>Main Image URL</label>
        <input type="url" id={`${idPrefix}image`} name="image" className="input"
          placeholder="https://..."
          value={formData.image} onChange={handleInputChange} />
      </div>

      <div className="input-group">
        <label htmlFor={`${idPrefix}gallery`}>Gallery URLs (one per line)</label>
        <textarea id={`${idPrefix}gallery`} name="galleryUrls" className="input" rows="2"
          placeholder="https://img1.jpg&#10;https://img2.jpg"
          value={formData.galleryUrls} onChange={handleInputChange} />
      </div>

      <div className="input-group">
        <label htmlFor={`${idPrefix}sizes`}>Sizes (Label | Value | Dimensions — one per line)</label>
        <textarea id={`${idPrefix}sizes`} name="sizesStr" className="input" rows="3"
          placeholder="10x12 Pack | 10x12 | 10×12 inches&#10;12x15 Pack | 12x15 | 12×15 inches"
          value={formData.sizesStr} onChange={handleInputChange} />
      </div>

      <div className="input-group">
        <label htmlFor={`${idPrefix}features`}>Features (one per line)</label>
        <textarea id={`${idPrefix}features`} name="featuresStr" className="input" rows="3"
          placeholder="Tamper-proof seal&#10;Waterproof&#10;Eco-friendly"
          value={formData.featuresStr} onChange={handleInputChange} />
      </div>

      <div className="input-group">
        <label htmlFor={`${idPrefix}specs`}>Specifications (Key: Value — one per line)</label>
        <textarea id={`${idPrefix}specs`} name="specsStr" className="input" rows="3"
          placeholder="Material: LDPE&#10;Thickness: 50 microns"
          value={formData.specsStr} onChange={handleInputChange} />
      </div>

      <div style={{ display: 'flex', gap: '1.5rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
          <input type="checkbox" name="bestSeller" checked={formData.bestSeller} onChange={handleInputChange} />
          Best Seller
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
          <input type="checkbox" name="inStock" checked={formData.inStock} onChange={handleInputChange} />
          In Stock
        </label>
      </div>
    </div>
  );

  return (
    <div className="adminPanel">
      <div className="panelHeader">
        <h2>Products Management</h2>
        <button
          className="btn btn-primary btn-sm"
          style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
          onClick={() => { setFormData(emptyForm); setIsAddModalOpen(true); }}
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="adminToolbar">
        <div className="searchInputWrapper">
          <Search size={18} className="searchInputIcon" />
          <input type="text" className="searchInput" placeholder="Search products..."
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} style={{ color: 'var(--color-text-muted)' }} />
          <select className="filterSelect" value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="all">All Categories</option>
            <option value="courier-bags">Courier Bags</option>
            <option value="boxes-tapes">Boxes &amp; Tapes</option>
            <option value="labels-stickers">Labels &amp; Stickers</option>
            <option value="shredded-paper">Shredded Paper</option>
          </select>
        </div>
      </div>

      <div className="panelBody">
        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div className="emptyState"><p>Loading products...</p></div>
          ) : (
            <table className="adminTable">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Base Price</th>
                  <th>Bulk Price</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="productNameCell">
                        <div className="productThumb" style={{ backgroundImage: `url(${product.image})` }} />
                        <div>
                          <div className="productNameText">{product.shortName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{product.type}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>{product.category.replace('-', ' ')}</td>
                    <td>₹{product.basePrice.toFixed(2)}</td>
                    <td style={{ color: 'var(--color-primary)', fontWeight: 600 }}>₹{product.bulkPrice.toFixed(2)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ color: '#FFB800' }}>★</span>
                        <span>{product.rating}</span>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>({product.reviewCount})</span>
                      </div>
                    </td>
                    <td>
                      <div className={`toggleSwitch ${product.inStock ? 'active' : ''}`} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-ghost btn-icon" style={{ padding: '4px' }}
                          onClick={() => openEditModal(product)} title="Edit Product">
                          <Edit size={16} />
                        </button>
                        <button className="btn btn-ghost btn-icon"
                          style={{ padding: '4px', color: 'var(--color-error)' }}
                          onClick={() => openDeleteModal(product)} title="Delete Product">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && filteredProducts.length === 0 && (
            <div className="emptyState">
              <h3>No products found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Add Product Modal ── */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Product"
        maxWidth="600px"
        footer={
          <>
            <button type="button" className="btn btn-outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" form="add-product-form" className="btn btn-primary">
              Save Product
            </button>
          </>
        }
      >
        <form id="add-product-form" onSubmit={handleAddProduct}>
          {renderFormFields('add-')}
        </form>
      </Modal>

      {/* ── Edit Product Modal ── */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setSelectedProduct(null); }}
        title="Edit Product"
        maxWidth="600px"
        footer={
          <>
            <button type="button" className="btn btn-outline"
              onClick={() => { setIsEditModalOpen(false); setSelectedProduct(null); }}>
              Cancel
            </button>
            <button type="submit" form="edit-product-form" className="btn btn-primary">
              Update Product
            </button>
          </>
        }
      >
        <form id="edit-product-form" onSubmit={handleEditProduct}>
          {renderFormFields('edit-')}
        </form>
      </Modal>

      {/* ── Delete Confirmation Modal ── */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Product"
        maxWidth="420px"
        footer={
          <>
            <button type="button" className="btn btn-outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary"
              style={{ background: 'var(--color-error)', borderColor: 'var(--color-error)' }}
              onClick={handleDeleteProduct}>
              Delete Product
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', textAlign: 'center', padding: '0.5rem 0' }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: 'rgba(239,68,68,0.12)', color: 'var(--color-error)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Trash2 size={24} />
          </div>
          <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
            Are you sure you want to delete <strong style={{ color: 'var(--color-text)' }}>{selectedProduct?.name}</strong>?
            This action cannot be undone.
          </p>
        </div>
      </Modal>
    </div>
  );
}
