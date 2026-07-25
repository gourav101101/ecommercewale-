// Admin Dashboard Mock Data
export const dashboardStats = [
  { id: 'revenue', label: 'Total Revenue', value: '₹12,45,890', change: '+12.5%', trend: 'up', icon: 'IndianRupee' },
  { id: 'orders', label: 'Total Orders', value: '2,847', change: '+8.2%', trend: 'up', icon: 'ShoppingBag' },
  { id: 'products', label: 'Active Products', value: '12', change: '0%', trend: 'neutral', icon: 'Package' },
  { id: 'customers', label: 'Customers', value: '1,523', change: '+15.3%', trend: 'up', icon: 'Users' },
];

export const recentOrders = [
  { id: 'EW100234', customer: 'Rajesh Kumar', email: 'rajesh@trendykart.in', items: 3, total: 4520.00, status: 'delivered', date: '2026-07-24', paymentMethod: 'UPI' },
  { id: 'EW100233', customer: 'Priya Sharma', email: 'priya@beautybox.in', items: 5, total: 8750.00, status: 'shipped', date: '2026-07-24', paymentMethod: 'Card' },
  { id: 'EW100232', customer: 'Mohammed Irfan', email: 'irfan@stylestreet.in', items: 2, total: 2100.00, status: 'processing', date: '2026-07-23', paymentMethod: 'UPI' },
  { id: 'EW100231', customer: 'Sneha Patel', email: 'sneha@fashionvibe.in', items: 8, total: 15200.00, status: 'delivered', date: '2026-07-23', paymentMethod: 'Net Banking' },
  { id: 'EW100230', customer: 'Amit Verma', email: 'amit@gadgetzone.in', items: 4, total: 6800.00, status: 'processing', date: '2026-07-23', paymentMethod: 'UPI' },
  { id: 'EW100229', customer: 'Deepa Nair', email: 'deepa@organicglow.in', items: 1, total: 950.00, status: 'pending', date: '2026-07-22', paymentMethod: 'Card' },
  { id: 'EW100228', customer: 'Vikram Singh', email: 'vikram@vikramstore.in', items: 6, total: 11400.00, status: 'shipped', date: '2026-07-22', paymentMethod: 'UPI' },
  { id: 'EW100227', customer: 'Anita Desai', email: 'anita@craftcorner.in', items: 3, total: 3200.00, status: 'delivered', date: '2026-07-21', paymentMethod: 'Card' },
  { id: 'EW100226', customer: 'Suresh Reddy', email: 'suresh@techmart.in', items: 10, total: 22500.00, status: 'cancelled', date: '2026-07-21', paymentMethod: 'Net Banking' },
  { id: 'EW100225', customer: 'Kavita Joshi', email: 'kavita@joshifashions.in', items: 2, total: 1800.00, status: 'delivered', date: '2026-07-20', paymentMethod: 'UPI' },
  { id: 'EW100224', customer: 'Rohit Mehta', email: 'rohit@mehtaenterprises.in', items: 15, total: 34500.00, status: 'shipped', date: '2026-07-20', paymentMethod: 'Net Banking' },
  { id: 'EW100223', customer: 'Fatima Khan', email: 'fatima@zarafashions.in', items: 4, total: 5600.00, status: 'processing', date: '2026-07-19', paymentMethod: 'Card' },
];

export const customers = [
  { id: 1, name: 'Rajesh Kumar', email: 'rajesh@trendykart.in', phone: '+91 98765 43210', totalOrders: 24, totalSpent: 48500, status: 'active', joinDate: '2025-03-15', city: 'Mumbai' },
  { id: 2, name: 'Priya Sharma', email: 'priya@beautybox.in', phone: '+91 87654 32109', totalOrders: 18, totalSpent: 62300, status: 'active', joinDate: '2025-04-22', city: 'Delhi' },
  { id: 3, name: 'Mohammed Irfan', email: 'irfan@stylestreet.in', phone: '+91 76543 21098', totalOrders: 12, totalSpent: 21800, status: 'active', joinDate: '2025-06-10', city: 'Hyderabad' },
  { id: 4, name: 'Sneha Patel', email: 'sneha@fashionvibe.in', phone: '+91 65432 10987', totalOrders: 32, totalSpent: 95400, status: 'active', joinDate: '2025-01-08', city: 'Ahmedabad' },
  { id: 5, name: 'Amit Verma', email: 'amit@gadgetzone.in', phone: '+91 54321 09876', totalOrders: 28, totalSpent: 78200, status: 'active', joinDate: '2025-02-14', city: 'Bangalore' },
  { id: 6, name: 'Deepa Nair', email: 'deepa@organicglow.in', phone: '+91 43210 98765', totalOrders: 8, totalSpent: 12500, status: 'active', joinDate: '2025-08-05', city: 'Kochi' },
  { id: 7, name: 'Vikram Singh', email: 'vikram@vikramstore.in', phone: '+91 32109 87654', totalOrders: 15, totalSpent: 34200, status: 'active', joinDate: '2025-05-20', city: 'Jaipur' },
  { id: 8, name: 'Anita Desai', email: 'anita@craftcorner.in', phone: '+91 21098 76543', totalOrders: 6, totalSpent: 8900, status: 'inactive', joinDate: '2025-07-12', city: 'Pune' },
  { id: 9, name: 'Suresh Reddy', email: 'suresh@techmart.in', phone: '+91 10987 65432', totalOrders: 45, totalSpent: 142000, status: 'active', joinDate: '2024-11-30', city: 'Chennai' },
  { id: 10, name: 'Kavita Joshi', email: 'kavita@joshifashions.in', phone: '+91 09876 54321', totalOrders: 10, totalSpent: 18700, status: 'active', joinDate: '2025-09-01', city: 'Lucknow' },
  { id: 11, name: 'Rohit Mehta', email: 'rohit@mehtaenterprises.in', phone: '+91 98712 34560', totalOrders: 52, totalSpent: 185000, status: 'active', joinDate: '2024-09-15', city: 'Surat' },
  { id: 12, name: 'Fatima Khan', email: 'fatima@zarafashions.in', phone: '+91 87612 34509', totalOrders: 14, totalSpent: 28400, status: 'active', joinDate: '2025-06-28', city: 'Kolkata' },
];

export const topProducts = [
  { name: 'Thermal Shipping Labels', sales: 623, revenue: '₹1,15,255' },
  { name: 'Non-Transparent Courier Bag', sales: 512, revenue: '₹2,15,040' },
  { name: 'BOPP Brown Tape', sales: 445, revenue: '₹1,24,600' },
  { name: 'Transparent POD Courier Bag', sales: 328, revenue: '₹1,24,640' },
  { name: '3-Ply Corrugated Box', sales: 276, revenue: '₹2,48,400' },
];

export const orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export const statusColors = {
  pending: { bg: 'rgba(245, 158, 11, 0.12)', color: '#F59E0B' },
  processing: { bg: 'rgba(59, 130, 246, 0.12)', color: '#3B82F6' },
  shipped: { bg: 'rgba(124, 92, 252, 0.12)', color: '#7C5CFC' },
  delivered: { bg: 'rgba(16, 185, 129, 0.12)', color: '#10B981' },
  cancelled: { bg: 'rgba(239, 68, 68, 0.12)', color: '#EF4444' },
};

export const faqData = [
  {
    category: 'Shipping & Delivery',
    questions: [
      { q: 'How long does delivery take?', a: 'Standard delivery takes 3-5 business days for metro cities and 5-7 business days for other locations. Express delivery (1-2 days) is available for select pincodes at an additional charge.' },
      { q: 'Do you offer free shipping?', a: 'Yes! We offer free shipping on all orders above ₹2,000. For orders below ₹2,000, a flat shipping fee of ₹99 is applicable.' },
      { q: 'Do you deliver Pan-India?', a: 'Yes, we deliver to 500+ cities across India through our logistics partners including Delhivery, BlueDart, and DTDC.' },
      { q: 'Can I track my order?', a: 'Absolutely! Once your order is shipped, you will receive a tracking number via SMS and email. You can also track your order on our Track Order page.' },
    ],
  },
  {
    category: 'Products',
    questions: [
      { q: 'Are your courier bags marketplace compliant?', a: 'Yes, all our courier bags meet the packaging requirements of Flipkart, Amazon, Myntra, and Meesho. We regularly update our products to match changing marketplace guidelines.' },
      { q: 'What thickness are your courier bags?', a: 'Our standard courier bags are 50-60 microns for transparent and 55-65 microns for opaque bags. Bubble-lined bags are 70+ microns. All meet marketplace minimum requirements.' },
      { q: 'Do you offer custom printing on bags?', a: 'Yes! We offer custom printing for bulk orders (minimum 5,000 pieces). Contact our sales team via the Bulk Order form for custom branding options and pricing.' },
      { q: 'What size courier bag should I use?', a: 'It depends on your product. For small items like accessories, 6×8" works. For clothing, 10×12" or 12×15" is ideal. For bulky items, go with 16×20" or larger. Feel free to order sample packs to test.' },
    ],
  },
  {
    category: 'Orders & Payment',
    questions: [
      { q: 'What payment methods do you accept?', a: 'We accept UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards (Visa, MasterCard, RuPay), Net Banking from all major Indian banks, and Bank Transfer for bulk orders.' },
      { q: 'Do you provide GST invoices?', a: 'Yes, we provide proper GST invoices on every order. If you need a GST invoice for your business, simply enter your GSTIN during checkout. You can claim input tax credit on all packaging expenses.' },
      { q: 'What is the minimum order quantity?', a: 'There is no minimum order quantity! You can order as few as 1 piece. However, we offer significant bulk discounts starting from quantities as low as 50-100 pieces.' },
      { q: 'Can I cancel my order?', a: 'Orders can be cancelled within 2 hours of placing them, provided they have not been dispatched yet. Contact our support team immediately if you need to cancel.' },
    ],
  },
  {
    category: 'Returns & Refunds',
    questions: [
      { q: 'What is your return policy?', a: 'We offer a 7-day hassle-free return policy on unused and unopened products. If you receive a damaged or defective product, we will replace it at no extra cost.' },
      { q: 'How do I initiate a return?', a: 'Contact our support team via WhatsApp, email, or phone with your order number and photos of the issue. We will arrange a pickup and process the return within 24 hours.' },
      { q: 'How long do refunds take?', a: 'Refunds are processed within 3-5 business days after we receive the returned product. The amount will be credited to your original payment method.' },
    ],
  },
  {
    category: 'Bulk Orders',
    questions: [
      { q: 'Do you offer special pricing for bulk orders?', a: 'Yes! Our pricing is tiered — the more you order, the less you pay per unit. For very large orders (10,000+ pieces), contact our sales team for custom wholesale pricing.' },
      { q: 'Can I get a sample before bulk ordering?', a: 'Absolutely! We offer sample packs at regular pricing. Once you are satisfied with the quality, you can place a bulk order with confidence.' },
      { q: 'Do you offer credit terms for regular buyers?', a: 'Yes, we offer 15-30 day credit terms for verified businesses with a consistent order history. Contact our sales team to set up a credit account.' },
    ],
  },
];
