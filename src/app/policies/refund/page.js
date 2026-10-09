import Link from 'next/link';
import { whatsappUrl } from '@/lib/whatsapp';

export const metadata = {
  title: 'Refund Policy | EcommerceWale',
  description: 'Refund Policy for EcommerceWale',
};

export default function RefundPolicy() {
  return (
    <div className="container section" style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Refund & Return Policy</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>Last updated: October 9, 2026</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', lineHeight: '1.7' }}>
        <p>Thank you for shopping at EcommerceWale.</p>
        <p>If, for any reason, You are not completely satisfied with a purchase We invite You to review our policy on refunds and returns.</p>

        <h2>1. Conditions for Returns</h2>
        <p>In order for the Goods to be eligible for a return, please make sure that:</p>
        <ul style={{ listStyleType: 'disc', paddingLeft: '2rem' }}>
          <li>The Goods were purchased in the last 7 days</li>
          <li>The Goods are in the original packaging</li>
          <li>The Goods were not used or damaged</li>
          <li>You have the receipt or proof of purchase</li>
        </ul>

        <h2>2. Non-returnable Items</h2>
        <p>The following Goods cannot be returned:</p>
        <ul style={{ listStyleType: 'disc', paddingLeft: '2rem' }}>
          <li>Custom printed or branded packaging materials</li>
          <li>Goods made to Your specifications or clearly personalized</li>
          <li>Goods which according to their nature are not suitable to be returned, deteriorate rapidly or where the date of expiry is over</li>
        </ul>

        <h2>3. Returning Goods</h2>
        <p>You are responsible for the cost and risk of returning the Goods to Us. You should send the Goods to our warehouse address provided by our support team.</p>
        <p>We cannot be held responsible for Goods damaged or lost in return shipment. Therefore, We recommend an insured and trackable mail service.</p>

        <h2>4. Refunds</h2>
        <p>We will reimburse You no later than 7 days from the day on which We receive the returned Goods. We will use the same means of payment as You used for the Order, and You will not incur any fees for such reimbursement.</p>

        <h2>5. Contact Us</h2>
        <p>If you have any questions about our Returns and Refunds Policy, please contact us:</p>
        <ul style={{ listStyleType: 'disc', paddingLeft: '2rem' }}>
          <li><a href={whatsappUrl('Hi EcommerceWale! I need help with a return or refund for my order.')} target="_blank" rel="noopener noreferrer">Message our team on WhatsApp</a></li>
          <li><Link href="/contact">Visit our contact page</Link></li>
        </ul>
      </div>
    </div>
  );
}
