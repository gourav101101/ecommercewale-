'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  ArrowLeft,
  Menu,
  X,
  Bell,
  LogOut,
  Mail,
} from 'lucide-react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { useToast } from '@/context/ToastContext';
import Modal from '@/components/ui/Modal/Modal';
import './admin.css';

const sidebarLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/inquiries', label: 'Inquiries', icon: Mail },
];

const pageTitles = {
  '/admin': { title: 'Dashboard', subtitle: 'Welcome back! Here\'s your store overview.' },
  '/admin/products': { title: 'Products', subtitle: 'Manage your product catalog.' },
  '/admin/orders': { title: 'Orders', subtitle: 'Track and manage customer orders.' },
  '/admin/customers': { title: 'Customers', subtitle: 'View and manage your customer base.' },
  '/admin/inquiries': { title: 'Inquiries', subtitle: 'Read messages from the contact form.' },
};

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const { isAuthenticated, isLoading, logout } = useAdminAuth();
  const { showToast } = useToast();
  
  const pageInfo = pageTitles[pathname] || { title: 'Admin', subtitle: '' };
  const isLoginPage = pathname === '/admin/login';

  // Protect routes
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isLoginPage) {
      router.push('/admin/login');
    }
  }, [isLoading, isAuthenticated, isLoginPage, router]);

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', 'success');
    router.push('/admin/login');
  };

  // If loading or unauthenticated on a protected route, show nothing while redirecting
  if (isLoading || (!isAuthenticated && !isLoginPage)) {
    return <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}></div>;
  }

  // If it's the login page, render without the admin wrapper
  if (isLoginPage) {
    return children;
  }

  return (
    <div className="adminLayout">
      {/* Sidebar */}
      <aside className={`adminSidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebarHeader">
          <div className="sidebarLogoIcon">
            <Package size={22} />
          </div>
          <div>
            <div className="sidebarBrand">EcommerceWale</div>
            <span className="sidebarBrandSub">Admin Panel</span>
          </div>
        </div>

        <nav className="sidebarNav">
          <div className="sidebarSection">
            <div className="sidebarSectionTitle">Main Menu</div>
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`sidebarLink ${isActive ? 'sidebarLinkActive' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon size={18} />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="sidebarFooter">
          <Link href="/" className="sidebarBackLink">
            <ArrowLeft size={16} />
            Back to Website
          </Link>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="mobileOverlay visible"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="adminMain">
        <header className="adminTopBar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              className="mobileMenuBtn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="topBarLeft">
              <h1>{pageInfo.title}</h1>
              <p>{pageInfo.subtitle}</p>
            </div>
          </div>

          <div className="topBarRight">
            <button
              className="mobileMenuBtn"
              style={{ display: 'flex', position: 'relative' }}
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'var(--color-primary)',
              }} />
            </button>
            
            <button 
              onClick={() => setIsLogoutModalOpen(true)}
              className="btn btn-outline" 
              style={{ padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </header>

        <div className="adminContent">
          {children}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal 
        isOpen={isLogoutModalOpen} 
        onClose={() => setIsLogoutModalOpen(false)} 
        title="Confirm Logout"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', textAlign: 'center' }}>
            <div style={{ 
              width: '48px', height: '48px', borderRadius: '50%', 
              backgroundColor: 'var(--color-bg-alt)', color: 'var(--color-text)',
              display: 'flex', alignItems: 'center', justifyContent: 'center' 
            }}>
              <LogOut size={24} />
            </div>
            <p style={{ margin: 0 }}>
              Are you sure you want to log out of the admin panel?
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              type="button" 
              className="btn btn-outline" 
              style={{ flex: 1 }}
              onClick={() => setIsLogoutModalOpen(false)}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-primary" 
              style={{ flex: 1, backgroundColor: 'var(--color-error)', borderColor: 'var(--color-error)' }}
              onClick={() => {
                setIsLogoutModalOpen(false);
                handleLogout();
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
