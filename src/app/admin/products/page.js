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

  const [formData, setFormData] = useState({
    name: '',
    category: 'courier-bags',
    basePrice: '',
    bulkPrice: '',
    image: '',
    galleryUrls: '',
    featuresStr: '',
    specsStr: '',
    type: '',
    description: '',
    marketplaceCompatibleStr: '',
    sizesStr: '',
    bestSeller: false,
    inStock: true,
  });

  const parseSizes = (str) => {
    if (!str) return [{ label: 'Standard', value: 'standard', dimensions: 'Standard Size' }];
    return str.split('\\n').filter(Boolean).map(line => {
      const parts = line.split('|').map(s => s.trim());
      return {
        label: parts[0] || 'Standard',
        value: parts[1] || parts[0]?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'standard',
        dimensions: parts[2] || parts[0] || 'Standard Size'
      };
    });
  };

  const parseSpecs = (str) => {
    if (!str) return { Material: 'Standard' };
    const specs = {};
    str.split('\n').forEach(line => {
      const parts = line.split(':');
      if (parts.length >= 2) {
        specs[parts[0].trim()] = parts.slice(1).join(':').trim();
      }
    });
    return Object.keys(specs).length > 0 ? specs : { Material: 'Standard' };
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
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
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    
    const newProduct = {
      id: `new-${Date.now()}`,
      slug: `new-${Date.now()}`,
      name: formData.name,
      shortName: formData.name.substring(0, 20),
      type: formData.type || 'Standard',
      description: formData.description,
      category: formData.category,
      basePrice: parseFloat(formData.basePrice),
      bulkPrice: parseFloat(formData.bulkPrice),
      image: formData.image || 'https://images.unsplash.com/photo-1605600659942-1e9d29fc60eb?auto=format&fit=crop&q=80&w=600',
      rating: 5.0,
      reviewCount: 0,
      inStock: formData.inStock,
      bestSeller: formData.bestSeller,
      marketplaceCompatible: formData.marketplaceCompatibleStr ? formData.marketplaceCompatibleStr.split(',').map(s => s.trim()).filter(Boolean) : [],
      gallery: formData.galleryUrls ? formData.galleryUrls.split('\\n').map(s => s.trim()).filter(Boolean) : [formData.image || 'https://images.unsplash.com/photo-1605600659942-1e9d29fc60eb?auto=format&fit=crop&q=80&w=600'],
      pricing: [
        { minQty: 1, maxQty: 499, pricePerUnit: parseFloat(formData.basePrice), label: '1-499 units' },
        { minQty: 500, maxQty: null, pricePerUnit: parseFloat(formData.bulkPrice), label: '500+ units' }
      ],
      sizes: parseSizes(formData.sizesStr),
      specs: parseSpecs(formData.specsStr),
      features: formData.featuresStr ? formData.featuresStr.split('\\n').map(s => s.trim()).filter(Boolean) : ['High quality packaging material', 'Secure seal', 'Durable design']
    };

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });

      if (res.ok) {
        await fetchProducts(); // refresh list
        setIsAddModalOpen(false);
        showToast('Product added successfully!', 'success');
        
        setFormData({
          name: '',
          category: 'courier-bags',
          basePrice: '',
          bulkPrice: '',
          image: '',
          galleryUrls: '',
          featuresStr: '',
          specsStr: '',
          type: '',
          description: '',
          marketplaceCompatibleStr: '',
          sizesStr: '',
          bestSeller: false,
          inStock: true,
        });
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
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
      galleryUrls: product.gallery ? product.gallery.join('\\n') : '',
      featuresStr: product.features ? product.features.join('\\n') : '',
      specsStr: product.specs ? Object.entries(product.specs).map(([k, v]) => `${k}: ${v}`).join('\\n') : '',
      marketplaceCompatibleStr: product.marketplaceCompatible ? product.marketplaceCompatible.join(', ') : '',
      sizesStr: product.sizes ? product.sizes.map(s => `${s.label} | ${s.value} | ${s.dimensions}`).join('\\n') : '',
      bestSeller: !!product.bestSeller,
      inStock: product.inStock !== false, // default true if missing
    });
    setIsEditModalOpen(true);
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const updatedProduct = {
      ...selectedProduct,
      name: formData.name,
      shortName: formData.name.substring(0, 20),
      category: formData.category,
      type: formData.type || 'Standard',
      description: formData.description,
      basePrice: parseFloat(formData.basePrice),
      bulkPrice: parseFloat(formData.bulkPrice),
      image: formData.image,
      inStock: formData.inStock,
      bestSeller: formData.bestSeller,
      marketplaceCompatible: formData.marketplaceCompatibleStr ? formData.marketplaceCompatibleStr.split(',').map(s => s.trim()).filter(Boolean) : [],
      gallery: formData.galleryUrls ? formData.galleryUrls.split('\\n').map(s => s.trim()).filter(Boolean) : [formData.image],
      pricing: [
        { minQty: 1, maxQty: 499, pricePerUnit: parseFloat(formData.basePrice), label: '1-499 units' },
        { minQty: 500, maxQty: null, pricePerUnit: parseFloat(formData.bulkPrice), label: '500+ units' }
      ],
      sizes: parseSizes(formData.sizesStr),
      specs: parseSpecs(formData.specsStr),
      features: formData.featuresStr ? formData.featuresStr.split('\\n').map(s => s.trim()).filter(Boolean) : [],
    };

    try {
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct),
      });

      if (res.ok) {
        await fetchProducts();
        setIsEditModalOpen(false);
        setSelectedProduct(null);
        showToast('Product updated successfully!', 'success');
      } else {
        throw new Error('Failed to update');
      }
    } catch (error) {
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
      const res = await fetch(`/api/products?id=${selectedProduct.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await fetchProducts();
        setIsDeleteModalOpen(false);
        setSelectedProduct(null);
        showToast('Product deleted successfully!', 'success');
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      showToast('Error deleting product', 'error');
    }
  };

  return (
    <div className="adminPanel">
      <div className="panelHeader">
        <h2>Products Management</h2>
        <button 
          className="btn btn-primary btn-sm" 
          style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus size={16} /> Add Product
        </button>
      </div>
      
      <div className="adminToolbar">
        <div className="searchInputWrapper">
          <Search size={18} className="searchInputIcon" />
          <input
            type="text"
            className="searchInput"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} style={{ color: 'var(--color-text-muted)' }} />
          <select 
            className="filterSelect"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="courier-bags">Courier Bags</option>
            <option value="boxes-tapes">Boxes & Tapes</option>
            <option value="labels-stickers">Labels & Stickers</option>
            <option value="shredded-paper">Shredded Paper</option>
          </select>
        </div>
      </div>

      <div className="panelBody">
        <div style={{ overflowX: 'auto' }}>
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
                      <div 
                        className="productThumb" 
                        style={{ backgroundImage: `url(${product.image})` }}
                      />
                      <div>
                        <div className="productNameText">{product.shortName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          {product.type}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ textTransform: 'capitalize' }}>
                    {product.category.replace('-', ' ')}
                  </td>
                  <td>₹{product.basePrice.toFixed(2)}</td>
                  <td style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                    ₹{product.bulkPrice.toFixed(2)}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ color: '#FFB800' }}>★</span>
                      <span>{product.rating}</span>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                        ({product.reviewCount})
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className={`toggleSwitch ${product.inStock ? 'active' : ''}`} />
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="btn btn-ghost btn-icon" 
                        style={{ padding: '4px' }}
                        onClick={() => openEditModal(product)}
                        title="Edit Product"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="btn btn-ghost btn-icon" 
                        style={{ padding: '4px', color: 'var(--color-error)' }}
                        onClick={() => openDeleteModal(product)}
                        title="Delete Product"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <div className="emptyState">
              <h3>No products found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>

      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        title="Add New Product"
      >
        <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="input-group">
            <label htmlFor="name">Product Name</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              className="input" 
              required 
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="category">Category</label>
            <select 
              id="category" 
              name="category" 
              className="input"
              value={formData.category}
              onChange={handleInputChange}
            >
              <option value="courier-bags">Courier Bags</option>
              <option value="boxes-tapes">Boxes & Tapes</option>
              <option value="labels-stickers">Labels & Stickers</option>
              <option value="shredded-paper">Shredded Paper</option>
            </select>
          </div>
          
          <div className="grid-2">
            <div className="input-group">
              <label htmlFor="type">Product Type Tag</label>
              <input 
                type="text" 
                id="type" 
                name="type" 
                className="input" 
                placeholder="e.g., Plastic, Corrugated"
                value={formData.type}
                onChange={handleInputChange}
              />
            </div>
            <div className="input-group">
              <label htmlFor="marketplaceCompatibleStr">Marketplaces (Comma-separated)</label>
              <input 
                type="text" 
                id="marketplaceCompatibleStr" 
                name="marketplaceCompatibleStr" 
                className="input" 
                placeholder="amazon, flipkart, myntra"
                value={formData.marketplaceCompatibleStr}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="description">Full Description</label>
            <textarea 
              id="description" 
              name="description" 
              className="input" 
              rows="3"
              placeholder="Product description for search and details page..."
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="grid-2">
            <div className="input-group">
              <label htmlFor="basePrice">Base Price (₹)</label>
              <input 
                type="number" 
                id="basePrice" 
                name="basePrice" 
                className="input" 
                min="0"
                step="0.01"
                required 
                value={formData.basePrice}
                onChange={handleInputChange}
              />
            </div>
            <div className="input-group">
              <label htmlFor="bulkPrice">Bulk Price (₹)</label>
              <input 
                type="number" 
                id="bulkPrice" 
                name="bulkPrice" 
                className="input" 
                min="0"
                step="0.01"
                required 
                value={formData.bulkPrice}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <div className="input-group">
            <label htmlFor="image">Main Image URL (Thumbnail)</label>
            <input 
              type="url" 
              id="image" 
              name="image" 
              className="input" 
              placeholder="https://..."
              value={formData.image}
              onChange={handleInputChange}
            />
          </div>

          <div className="input-group">
            <label htmlFor="galleryUrls">Gallery Image URLs (One per line)</label>
            <textarea 
              id="galleryUrls" 
              name="galleryUrls" 
              className="input" 
              rows="3"
              placeholder="https://image1.jpg\nhttps://image2.jpg"
              value={formData.galleryUrls}
              onChange={handleInputChange}
            />
          </div>

          <div className="input-group">
            <label htmlFor="sizesStr">Sizes (Label | Value | Dimensions per line)</label>
            <textarea 
              id="sizesStr" 
              name="sizesStr" 
              className="input" 
              rows="3"
              placeholder="10x12 Pack | 10x12 | 10x12 inches\n12x15 Pack | 12x15 | 12x15 inches"
              value={formData.sizesStr}
              onChange={handleInputChange}
            />
          </div>

          <div className="input-group">
            <label htmlFor="featuresStr">Features (One per line)</label>
            <textarea 
              id="featuresStr" 
              name="featuresStr" 
              className="input" 
              rows="3"
              placeholder="Durable\nWaterproof\nEco-friendly"
              value={formData.featuresStr}
              onChange={handleInputChange}
            />
          </div>

          <div className="input-group">
            <label htmlFor="specsStr">Specifications (Key: Value per line)</label>
            <textarea 
              id="specsStr" 
              name="specsStr" 
              className="input" 
              rows="3"
              placeholder="Material: Corrugated Box\nDimensions: 10x10x10"
              value={formData.specsStr}
              onChange={handleInputChange}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button 
              type="button" 
              className="btn btn-outline" 
              style={{ flex: 1 }}
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ flex: 1 }}
            >
              Save Product
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Product Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedProduct(null);
        }} 
        title="Edit Product"
      >
        <form onSubmit={handleEditProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="input-group">
            <label htmlFor="edit-name">Product Name</label>
            <input 
              type="text" 
              id="edit-name" 
              name="name" 
              className="input" 
              required 
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="edit-category">Category</label>
            <select 
              id="edit-category" 
              name="category" 
              className="input"
              value={formData.category}
              onChange={handleInputChange}
            >
              <option value="courier-bags">Courier Bags</option>
              <option value="boxes-tapes">Boxes & Tapes</option>
              <option value="labels-stickers">Labels & Stickers</option>
              <option value="shredded-paper">Shredded Paper</option>
            </select>
          </div>
          
          <div className="grid-2">
            <div className="input-group">
              <label htmlFor="edit-type">Product Type Tag</label>
              <input 
                type="text" 
                id="edit-type" 
                name="type" 
                className="input" 
                placeholder="e.g., Plastic, Corrugated"
                value={formData.type}
                onChange={handleInputChange}
              />
            </div>
            <div className="input-group">
              <label htmlFor="edit-marketplaceCompatibleStr">Marketplaces (Comma-separated)</label>
              <input 
                type="text" 
                id="edit-marketplaceCompatibleStr" 
                name="marketplaceCompatibleStr" 
                className="input" 
                placeholder="amazon, flipkart, myntra"
                value={formData.marketplaceCompatibleStr}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="edit-description">Full Description</label>
            <textarea 
              id="edit-description" 
              name="description" 
              className="input" 
              rows="3"
              placeholder="Product description for search and details page..."
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="grid-2">
            <div className="input-group">
              <label htmlFor="edit-basePrice">Base Price (₹)</label>
              <input 
                type="number" 
                id="edit-basePrice" 
                name="basePrice" 
                className="input" 
                min="0"
                step="0.01"
                required 
                value={formData.basePrice}
                onChange={handleInputChange}
              />
            </div>
            <div className="input-group">
              <label htmlFor="edit-bulkPrice">Bulk Price (₹)</label>
              <input 
                type="number" 
                id="edit-bulkPrice" 
                name="bulkPrice" 
                className="input" 
                min="0"
                step="0.01"
                required 
                value={formData.bulkPrice}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <div className="input-group">
            <label htmlFor="edit-image">Main Image URL (Thumbnail)</label>
            <input 
              type="url" 
              id="edit-image" 
              name="image" 
              className="input" 
              placeholder="https://..."
              value={formData.image}
              onChange={handleInputChange}
            />
          </div>

          <div className="input-group">
            <label htmlFor="edit-galleryUrls">Gallery Image URLs (One per line)</label>
            <textarea 
              id="edit-galleryUrls" 
              name="galleryUrls" 
              className="input" 
              rows="3"
              value={formData.galleryUrls}
              onChange={handleInputChange}
            />
          </div>

          <div className="input-group">
            <label htmlFor="edit-sizesStr">Sizes (Label | Value | Dimensions per line)</label>
            <textarea 
              id="edit-sizesStr" 
              name="sizesStr" 
              className="input" 
              rows="3"
              value={formData.sizesStr}
              onChange={handleInputChange}
            />
          </div>

          <div className="input-group">
            <label htmlFor="edit-featuresStr">Features (One per line)</label>
            <textarea 
              id="edit-featuresStr" 
              name="featuresStr" 
              className="input" 
              rows="3"
              value={formData.featuresStr}
              onChange={handleInputChange}
            />
          </div>

          <div className="input-group">
            <label htmlFor="edit-specsStr">Specifications (Key: Value per line)</label>
            <textarea 
              id="edit-specsStr" 
              name="specsStr" 
              className="input" 
              rows="3"
              value={formData.specsStr}
              onChange={handleInputChange}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '2rem', margin: '0.5rem 0' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                name="bestSeller" 
                checked={formData.bestSeller}
                onChange={handleInputChange}
              />
              Mark as Best Seller
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                name="inStock" 
                checked={formData.inStock}
                onChange={handleInputChange}
              />
              In Stock
            </label>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button 
              type="button" 
              className="btn btn-outline" 
              style={{ flex: 1 }}
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedProduct(null);
              }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ flex: 1 }}
            >
              Update Product
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        title="Delete Product"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', textAlign: 'center' }}>
            <div style={{ 
              width: '48px', height: '48px', borderRadius: '50%', 
              backgroundColor: 'var(--color-error-light)', color: 'var(--color-error)',
              display: 'flex', alignItems: 'center', justifyContent: 'center' 
            }}>
              <Trash2 size={24} />
            </div>
            <p style={{ margin: 0 }}>
              Are you sure you want to delete <strong>{selectedProduct?.name}</strong>? 
              This action cannot be undone.
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              type="button" 
              className="btn btn-outline" 
              style={{ flex: 1 }}
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-primary" 
              style={{ flex: 1, backgroundColor: 'var(--color-error)', borderColor: 'var(--color-error)' }}
              onClick={handleDeleteProduct}
            >
              Delete Product
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
