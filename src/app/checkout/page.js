'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { Check, CreditCard, Truck, FileText, ChevronRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import styles from './page.module.css';

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, totalAmount, subtotal, shippingCost, gstAmount, clearCart, isLoaded } = useCart();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    needsGst: false,
    gstin: '',
    companyName: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const processingTimer = useRef(null);

  useEffect(() => {
    if (isLoaded && cartItems.length === 0 && step !== 4) {
      router.replace('/cart');
    }
  }, [cartItems.length, isLoaded, router, step]);

  useEffect(() => () => {
    if (processingTimer.current) clearTimeout(processingTimer.current);
  }, []);

  if (!isLoaded || (cartItems.length === 0 && step !== 4)) return null;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    setStep(prev => prev + 1);
    window.scrollTo(0, 0);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    const newOrderId = `EW${Math.floor(100000 + Math.random() * 900000)}`;
    const today = new Date().toISOString().split('T')[0];

    const orderPayload = {
      id: newOrderId,
      customer: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      items: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      total: totalAmount,
      status: 'pending',
      date: today,
      paymentMethod: paymentMethod === 'upi' ? 'UPI' : paymentMethod === 'card' ? 'Credit Card' : 'Net Banking',
      products: cartItems.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.pricePerUnit,
        selectedSize: item.selectedSize
      })),
      shippingAddress: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        phone: formData.phone
      },
      gstin: formData.needsGst ? formData.gstin : '',
      companyName: formData.needsGst ? formData.companyName : ''
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      
      if (!res.ok) throw new Error('Failed to save order');
      
      setOrderNumber(newOrderId);
      clearCart();
      setStep(4);
      window.scrollTo(0, 0);
    } catch (err) {
      console.error(err);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderStepIndicator = () => (
    <div className={styles.stepIndicator}>
      {[
        { id: 1, label: 'Shipping', icon: Truck },
        { id: 2, label: 'Billing', icon: FileText },
        { id: 3, label: 'Payment', icon: CreditCard },
      ].map((s, index) => (
        <div key={s.id} className={styles.stepWrapper}>
          <div className={`${styles.step} ${step >= s.id ? styles.stepActive : ''} ${step > s.id ? styles.stepCompleted : ''}`}>
            <div className={styles.stepIcon}>
              {step > s.id ? <Check size={16} /> : <s.icon size={16} />}
            </div>
            <span className={styles.stepLabel}>{s.label}</span>
          </div>
          {index < 2 && <div className={`${styles.stepConnector} ${step > s.id ? styles.connectorActive : ''}`} />}
        </div>
      ))}
    </div>
  );

  const renderOrderSummary = () => (
    <div className={styles.orderSummary}>
      <h3>Order Summary</h3>
      <div className={styles.summaryItems}>
        {cartItems.map((item) => (
          <div key={`${item.id}-${item.selectedSize}`} className={styles.summaryItem}>
            <div className={styles.itemImage} style={{ backgroundImage: `url(${item.image})` }}>
              <span className={styles.itemQtyBadge}>{item.quantity}</span>
            </div>
            <div className={styles.itemInfo}>
              <div className={styles.itemName}>{item.name}</div>
              <div className={styles.itemSize}>{item.sizeLabel}</div>
            </div>
            <div className={styles.itemPrice}>
              ₹{(item.pricePerUnit * item.quantity).toFixed(2)}
            </div>
          </div>
        ))}
      </div>
      
      <div className={styles.summaryTotals}>
        <div className={styles.totalRow}>
          <span>Subtotal</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        <div className={styles.totalRow}>
          <span>Shipping</span>
          <span>{shippingCost === 0 ? 'Free' : `₹${shippingCost.toFixed(2)}`}</span>
        </div>
        <div className={styles.totalRow}>
          <span>GST (18%)</span>
          <span>₹{gstAmount.toFixed(2)}</span>
        </div>
        <div className={`${styles.totalRow} ${styles.finalTotal}`}>
          <span>Total</span>
          <span>₹{totalAmount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.checkoutPage}>
      <div className="container">
        {step < 4 ? (
          <div className={styles.checkoutLayout}>
            <div className={styles.mainContent}>
              <h1 className={styles.pageTitle}>Checkout</h1>
              {renderStepIndicator()}

              <div className={styles.formContainer}>
                {step === 1 && (
                  <form onSubmit={handleNextStep} className="animate-fadeIn">
                    <h2>Shipping Details</h2>
                    <div className={styles.formGrid}>
                      <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                        <label htmlFor="email">Email Address</label>
                        <input type="email" id="email" name="email" className="input" required value={formData.email} onChange={handleInputChange} />
                      </div>
                      <div className="input-group">
                        <label htmlFor="firstName">First Name</label>
                        <input type="text" id="firstName" name="firstName" className="input" required value={formData.firstName} onChange={handleInputChange} />
                      </div>
                      <div className="input-group">
                        <label htmlFor="lastName">Last Name</label>
                        <input type="text" id="lastName" name="lastName" className="input" required value={formData.lastName} onChange={handleInputChange} />
                      </div>
                      <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                        <label htmlFor="address">Street Address</label>
                        <input type="text" id="address" name="address" className="input" required value={formData.address} onChange={handleInputChange} />
                      </div>
                      <div className="input-group">
                        <label htmlFor="pincode">Pincode</label>
                        <input type="text" id="pincode" name="pincode" className="input" required value={formData.pincode} onChange={handleInputChange} maxLength="6" />
                      </div>
                      <div className="input-group">
                        <label htmlFor="city">City</label>
                        <input type="text" id="city" name="city" className="input" required value={formData.city} onChange={handleInputChange} />
                      </div>
                      <div className="input-group">
                        <label htmlFor="state">State</label>
                        <input type="text" id="state" name="state" className="input" required value={formData.state} onChange={handleInputChange} />
                      </div>
                      <div className="input-group">
                        <label htmlFor="phone">Phone Number</label>
                        <input type="tel" id="phone" name="phone" className="input" required value={formData.phone} onChange={handleInputChange} />
                      </div>
                    </div>
                    <div className={styles.formActions}>
                      <button type="submit" className="btn btn-primary btn-lg">
                        Continue to Billing <ChevronRight size={20} />
                      </button>
                    </div>
                  </form>
                )}

                {step === 2 && (
                  <form onSubmit={handleNextStep} className="animate-fadeIn">
                    <h2>Billing Information</h2>
                    
                    <label className={styles.checkboxLabel}>
                      <input type="checkbox" name="needsGst" checked={formData.needsGst} onChange={handleInputChange} />
                      <span className={styles.checkboxText}>I need a GST Invoice for my business</span>
                    </label>

                    {formData.needsGst && (
                      <div className={`${styles.formGrid} ${styles.gstSection} animate-fadeInDown`}>
                        <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                          <label htmlFor="companyName">Company Name</label>
                          <input type="text" id="companyName" name="companyName" className="input" required={formData.needsGst} value={formData.companyName} onChange={handleInputChange} />
                        </div>
                        <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                          <label htmlFor="gstin">GSTIN Number</label>
                          <input type="text" id="gstin" name="gstin" className="input" required={formData.needsGst} value={formData.gstin} onChange={handleInputChange} placeholder="e.g. 27AADCB2230M1Z2" />
                        </div>
                      </div>
                    )}
                    
                    <div className={styles.infoBox}>
                      <p><strong>Shipping Address:</strong></p>
                      <p>{formData.firstName} {formData.lastName}</p>
                      <p>{formData.address}</p>
                      <p>{formData.city}, {formData.state} {formData.pincode}</p>
                    </div>

                    <div className={styles.formActions}>
                      <button type="button" className="btn btn-outline" onClick={() => setStep(1)}>Back</button>
                      <button type="submit" className="btn btn-primary btn-lg">
                        Continue to Payment <ChevronRight size={20} />
                      </button>
                    </div>
                  </form>
                )}

                {step === 3 && (
                  <form onSubmit={handlePlaceOrder} className="animate-fadeIn">
                    <h2>Payment Method</h2>
                    <p className={styles.mockupNotice}>This is a mockup. No real payment will be processed.</p>
                    
                    <div className={styles.paymentOptions}>
                      <label className={`${styles.paymentOption} ${paymentMethod === 'upi' ? styles.paymentOptionActive : ''}`}>
                        <div className={styles.paymentRadio}>
                          <input type="radio" name="payment" value="upi" checked={paymentMethod === 'upi'} onChange={(e) => setPaymentMethod(e.target.value)} />
                        </div>
                        <div className={styles.paymentDetails}>
                          <h4>UPI / QR</h4>
                          <p>Google Pay, PhonePe, Paytm, etc.</p>
                        </div>
                      </label>
                      
                      <label className={`${styles.paymentOption} ${paymentMethod === 'card' ? styles.paymentOptionActive : ''}`}>
                        <div className={styles.paymentRadio}>
                          <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={(e) => setPaymentMethod(e.target.value)} />
                        </div>
                        <div className={styles.paymentDetails}>
                          <h4>Credit / Debit Card</h4>
                          <p>Visa, MasterCard, RuPay</p>
                        </div>
                      </label>
                      
                      <label className={`${styles.paymentOption} ${paymentMethod === 'netbanking' ? styles.paymentOptionActive : ''}`}>
                        <div className={styles.paymentRadio}>
                          <input type="radio" name="payment" value="netbanking" checked={paymentMethod === 'netbanking'} onChange={(e) => setPaymentMethod(e.target.value)} />
                        </div>
                        <div className={styles.paymentDetails}>
                          <h4>Net Banking</h4>
                          <p>All major Indian banks</p>
                        </div>
                      </label>
                    </div>

                    <div className={styles.formActions}>
                      <button type="button" className="btn btn-outline" onClick={() => setStep(2)}>Back</button>
                      <button type="submit" className="btn btn-primary btn-lg" disabled={isProcessing}>
                        {isProcessing ? 'Processing...' : `Pay ₹${totalAmount.toFixed(2)}`}
                      </button>
                    </div>
                    <div className={styles.secureCheckout}>
                      <ShieldCheck size={16} className={styles.secureIcon} />
                      <span>256-bit Secure SSL Encryption</span>
                    </div>
                  </form>
                )}
              </div>
            </div>
            
            <div className={styles.sidebar}>
              {renderOrderSummary()}
            </div>
          </div>
        ) : (
          <div className={`${styles.successState} animate-scaleIn`}>
            <div className={styles.successIcon}>
              <CheckCircle2 size={64} />
            </div>
            <h1>Order Confirmed!</h1>
            <p>Thank you for your order, {formData.firstName}. We&apos;ve received it and will start processing it shortly.</p>
            
            <div className={styles.orderDetails}>
              <div className={styles.detailRow}>
                <span>Order Number:</span>
                <strong>#{orderNumber}</strong>
              </div>
              <div className={styles.detailRow}>
                <span>Email:</span>
                <strong>{formData.email}</strong>
              </div>
              {formData.needsGst && (
                <div className={styles.detailRow}>
                  <span>GSTIN:</span>
                  <strong>{formData.gstin}</strong>
                </div>
              )}
            </div>
            
            <Link href="/shop" className="btn btn-primary btn-lg">
              Continue Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
