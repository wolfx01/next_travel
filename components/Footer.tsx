"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import '@fortawesome/fontawesome-free/css/all.min.css';

export default function Footer() {
  const pathname = usePathname();

  if (pathname === '/profile') return null;

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3 className="footer-logo"> Travel</h3>
          <p className="footer-description">
            Your smart travel guide to discover the world's best destinations with AI-powered recommendations.
          </p>
          <div className="social-links">
            <a href="#"><i className="fab fa-facebook"></i></a>
            <a href="#"><i className="fab fa-twitter"></i></a>
            <a href="#"><i className="fab fa-instagram"></i></a>
            <a href="#"><i className="fab fa-linkedin"></i></a>
          </div>
        </div>
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul className="footer-links">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/countries">Countries</Link></li>
            <li><Link href="/places">Places</Link></li>
            <li><Link href="/chatbot">AI Assistant</Link></li>
            <li><Link href="/about">About Us</Link></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Contact Info</h4>
          <div className="contact-info">
            <p><i className="fas fa-envelope"></i>itsbilalchouichou@mail.com</p>
            <p><i className="fas fa-phone"></i> +212 658013891</p>
            <p><i className="fas fa-map-marker-alt"></i> Morocco</p>
          </div>
        </div>
        <div className="footer-section">
          <h4>Newsletter</h4>
          <p className="newsletter-desc">
            <i className="fas fa-paper-plane" style={{ marginRight: '10px', color: '#00bcd4' }}></i>
            Subscribe to get travel updates
          </p>
          <form className="newsletter-form">
            <input type="email" placeholder="Your email" required />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2025 Explo. All rights reserved. | Designed with ❤️ for travelers</p>
      </div>
    </footer>
  );
}
