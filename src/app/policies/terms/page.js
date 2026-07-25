export const metadata = {
  title: 'Terms & Conditions | EcommerceWale',
  description: 'Terms & Conditions for EcommerceWale',
};

export default function TermsConditions() {
  return (
    <div className="container section" style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Terms & Conditions</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>Last updated: July 24, 2026</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', lineHeight: '1.7' }}>
        <p>Welcome to EcommerceWale!</p>
        <p>These terms and conditions outline the rules and regulations for the use of EcommerceWale&apos;s Website, located at https://ecommercewale.in.</p>
        <p>By accessing this website we assume you accept these terms and conditions. Do not continue to use EcommerceWale if you do not agree to take all of the terms and conditions stated on this page.</p>

        <h2>1. License</h2>
        <p>Unless otherwise stated, EcommerceWale and/or its licensors own the intellectual property rights for all material on EcommerceWale. All intellectual property rights are reserved. You may access this from EcommerceWale for your own personal use subjected to restrictions set in these terms and conditions.</p>
        <p>You must not:</p>
        <ul style={{ listStyleType: 'disc', paddingLeft: '2rem' }}>
          <li>Republish material from EcommerceWale</li>
          <li>Sell, rent or sub-license material from EcommerceWale</li>
          <li>Reproduce, duplicate or copy material from EcommerceWale</li>
          <li>Redistribute content from EcommerceWale</li>
        </ul>

        <h2>2. Hyperlinking to our Content</h2>
        <p>The following organizations may link to our Website without prior written approval:</p>
        <ul style={{ listStyleType: 'disc', paddingLeft: '2rem' }}>
          <li>Government agencies;</li>
          <li>Search engines;</li>
          <li>News organizations;</li>
        </ul>

        <h2>3. Product Pricing and Availability</h2>
        <p>All prices are subject to change without notice. We reserve the right to modify or discontinue any product at any time. We shall not be liable to you or any third party for any modification, price change, suspension, or discontinuance of the product.</p>

        <h2>4. Shipping & Delivery</h2>
        <p>We aim to dispatch all orders within 24-48 hours. However, delivery timelines are estimates and not guarantees. We are not responsible for any delays caused by the logistics partner or unforeseen circumstances.</p>
      </div>
    </div>
  );
}
