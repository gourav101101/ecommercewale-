'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, Mail, Lock, ArrowLeft, LogIn, Eye, EyeOff } from 'lucide-react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { useToast } from '@/context/ToastContext';
import styles from './page.module.css';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAdminAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/admin');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const success = login(email, password);
    
    if (success) {
      showToast('Welcome back, Admin!', 'success');
      router.push('/admin');
    } else {
      showToast('Invalid credentials. Please try again.', 'error');
      setIsSubmitting(false);
    }
  };

  if (isLoading || isAuthenticated) {
    return null; // Don't flash login screen if already authenticated
  }

  return (
    <div className={styles.loginContainer}>
      <div className={styles.bgElements}>
        <div className={styles.blob1}></div>
        <div className={styles.blob2}></div>
      </div>

      <div className={styles.loginBox}>
        <div className={styles.loginHeader}>
          <div className={styles.logoIcon}>
            <Package size={28} />
          </div>
          <h1>Admin Portal</h1>
          <p>Sign in to manage your store</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email Address</label>
            <div className={styles.inputWrapper}>
              <Mail size={18} className={styles.inputIcon} />
              <input
                type="email"
                id="email"
                className={styles.input}
                placeholder="admin@ecommercewale.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <div className={styles.inputWrapper}>
              <Lock size={18} className={styles.inputIcon} />
              <input
                type={isPasswordVisible ? 'text' : 'password'}
                id="password"
                className={styles.input}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setIsPasswordVisible((visible) => !visible)}
                aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                aria-pressed={isPasswordVisible}
              >
                {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {/* For demo purposes, hint the password */}
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.5rem', textAlign: 'right' }}>
              Hint: admin@ecommercewale.in / admin123
            </div>
          </div>

          <button
            type="submit"
            className={`btn btn-primary ${styles.submitBtn}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Verifying...' : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                Sign In <LogIn size={18} />
              </span>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <Link href="/" className={styles.backLink}>
            <ArrowLeft size={16} /> Back to Website
          </Link>
        </div>
      </div>
    </div>
  );
}
