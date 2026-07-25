'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, X } from 'lucide-react';
import { categories } from '@/data/products';
import { marketplaces } from '@/data/marketplace';
import ProductCard from '@/components/shop/ProductCard/ProductCard';
import styles from './page.module.css';

function ShopContent() {
  const searchParams = useSearchParams();
  const defaultCategory = searchParams.get('category') || 'all';

  const defaultSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState(defaultSearch);
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory);
  const [selectedMarketplace, setSelectedMarketplace] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Sync state with URL changes
  useEffect(() => {
    const cat = searchParams.get('category');
    setSelectedCategory(cat || 'all');
    
    const search = searchParams.get('search');
    setSearchQuery(search || '');
  }, [searchParams]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.type?.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Marketplace filter
    if (selectedMarketplace !== 'all') {
      result = result.filter((p) =>
        p.marketplaceCompatible?.includes(selectedMarketplace)
      );
    }

    // Sorting
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => (Number(a.bulkPrice) || 0) - (Number(b.bulkPrice) || 0));
        break;
      case 'price-high':
        result.sort((a, b) => (Number(b.bulkPrice) || 0) - (Number(a.bulkPrice) || 0));
        break;
      case 'rating':
        result.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
        break;
      case 'featured':
      default:
        // Best sellers first, then by rating
        result.sort((a, b) => {
          const aSeller = !!a.bestSeller;
          const bSeller = !!b.bestSeller;
          if (aSeller === bSeller) {
            return (Number(b.rating) || 0) - (Number(a.rating) || 0);
          }
          return aSeller ? -1 : 1;
        });
        break;
    }

    return result;
  }, [products, searchQuery, selectedCategory, selectedMarketplace, sortBy]);

  return (
    <div className={styles.shopPage}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className="container">
          <h1>Shop Packaging Supplies</h1>
          <p>Everything you need to pack, secure, and ship your orders.</p>
        </div>
      </div>

      <div className={`container ${styles.shopContainer}`}>
        {/* Mobile Filter Toggle */}
        <div className={styles.mobileFilterToggle}>
          <button 
            className="btn btn-outline" 
            onClick={() => setIsFilterOpen(true)}
          >
            <Filter size={18} /> Filters
          </button>
          <div className={styles.resultsCount}>
            {filteredProducts.length} Products
          </div>
        </div>

        {/* Sidebar */}
        <aside className={`${styles.sidebar} ${isFilterOpen ? styles.sidebarOpen : ''}`}>
          <div className={styles.sidebarHeader}>
            <h3>Filters</h3>
            <button className={styles.closeBtn} onClick={() => setIsFilterOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <div className={styles.filterGroup}>
            <div className={styles.searchBox}>
              <Search size={18} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>

          <div className={styles.filterGroup}>
            <h4>Categories</h4>
            <div className={styles.radioList}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="category"
                  value="all"
                  checked={selectedCategory === 'all'}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                />
                <span className={styles.radioText}>All Products</span>
              </label>
              {categories.map((cat) => (
                <label key={cat.id} className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="category"
                    value={cat.slug}
                    checked={selectedCategory === cat.slug}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  />
                  <span className={styles.radioText}>{cat.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.filterGroup}>
            <h4>Marketplace Compliance</h4>
            <div className={styles.radioList}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="marketplace"
                  value="all"
                  checked={selectedMarketplace === 'all'}
                  onChange={(e) => setSelectedMarketplace(e.target.value)}
                />
                <span className={styles.radioText}>All Marketplaces</span>
              </label>
              {marketplaces.map((mp) => (
                <label key={mp.id} className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="marketplace"
                    value={mp.id}
                    checked={selectedMarketplace === mp.id}
                    onChange={(e) => setSelectedMarketplace(e.target.value)}
                  />
                  <span className={styles.radioText}>{mp.name}</span>
                </label>
              ))}
            </div>
          </div>

          <button 
            className="btn btn-outline"
            style={{ width: '100%', marginTop: 'var(--space-4)' }}
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedMarketplace('all');
              setSortBy('featured');
            }}
          >
            Clear Filters
          </button>
        </aside>

        {/* Main Content */}
        <div className={styles.mainContent}>
          {/* Top Bar */}
          <div className={styles.topBar}>
            <div className={styles.desktopResultsCount}>
              Showing <strong>{filteredProducts.length}</strong> products
            </div>
            
            <div className={styles.sortBox}>
              <label htmlFor="sort">Sort by:</label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={styles.sortSelect}
              >
                <option value="featured">Featured / Best Sellers</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {filteredProducts.length > 0 ? (
            <div className={styles.productGrid}>
              {filteredProducts.map((product) => (
                <div key={product.id} className="animate-fadeInUp">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <PackageIcon />
              <h3>No products found</h3>
              <p>We couldn&apos;t find any products matching your current filters.</p>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedMarketplace('all');
                }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile Overlay */}
      {isFilterOpen && (
        <div 
          className={styles.mobileOverlay} 
          onClick={() => setIsFilterOpen(false)}
        />
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Loading shop...</div>}>
      <ShopContent />
    </Suspense>
  );
}

function PackageIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
      <line x1="12" y1="22.08" x2="12" y2="12"></line>
    </svg>
  );
}
