import React from "react";
import { Link } from "react-router-dom";
import "./footer.css";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="footer">
      {/* TOP WAVE */}
      <div className="footer-wave">
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none">
          <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="#09090f"/>
        </svg>
      </div>

      <div className="footer-main">
        <div className="footer-container">

          {/* BRAND */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo"><Logo /></Link>
            <p>Your one-stop destination for movies & entertainment. Book tickets, explore showtimes, and never miss a movie.</p>
            <div className="footer-socials">
              <a href="#" className="social-btn" title="Website">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
              </a>
              <a href="#" className="social-btn" title="Facebook">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
              <a href="#" className="social-btn" title="Instagram">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              <a href="#" className="social-btn" title="Twitter">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* EXPLORE */}
          <div className="footer-col">
            <h4>Explore</h4>
            <Link to="/">🏠 Home</Link>
            <Link to="/movies">🎬 Movies</Link>
            <Link to="/my-bookings">🎟️ My Bookings</Link>
            <Link to="/movies?category=in_theatres">🎭 Now Showing</Link>
            <Link to="/movies?category=coming_soon">🆕 Coming Soon</Link>
          </div>

          {/* SUPPORT */}
          <div className="footer-col">
            <h4>Support</h4>
            <a href="#">❓ Help Center</a>
            <a href="#">📋 Terms & Conditions</a>
            <a href="#">🔒 Privacy Policy</a>
            <a href="#">♿ Accessibility</a>
            <a href="#">📞 Contact Us</a>
          </div>

          {/* APP / INFO */}
          <div className="footer-col">
            <h4>Experience</h4>
            <div className="footer-app-badge">
              <span>📱</span>
              <div>
                <p>Download App</p>
                <span>Coming Soon</span>
              </div>
            </div>
            <div className="footer-stats">
              <div className="stat">
                <strong>500+</strong>
                <span>Movies</span>
              </div>
              <div className="stat">
                <strong>50+</strong>
                <span>Theatres</span>
              </div>
              <div className="stat">
                <strong>10K+</strong>
                <span>Users</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <p>© {new Date().getFullYear()} <span>CineHub</span>. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#">Privacy</a>
            <span>•</span>
            <a href="#">Terms</a>
            <span>•</span>
            <a href="#">Cookies</a>
          </div>
          <p className="footer-made">Made with ❤️ for movie lovers</p>
        </div>
      </div>
    </footer>
  );
}