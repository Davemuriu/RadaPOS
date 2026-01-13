import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlayCircle,
  ArrowRight,
  WifiOff,
  Zap,
  Sun,
  Moon,
  LayoutDashboard,
  Store,
  ShoppingBag,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';
import '../styles/LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const testimonials = [
    {
      name: "Brian Mwangi",
      role: "Founder, Nairobi Coffee House",
      content: "We used to struggle with internet outages halting sales. RadaPOS Offline Mode saved us during the busy morning rush. It just works."
    },
    {
      name: "Joy Kendi",
      role: "Organizer, Rift Valley Festival",
      content: "Managing 50 vendors at a festival is a nightmare. RadaPOS gave us real-time visibility on every stall's performance. The hardware agnostic setup was a breeze."
    },
    {
      name: "Kevin Omondi",
      role: "Director, Urban Wear",
      content: "The inventory alerts are a lifesaver. I know exactly when to restock without being at the shop physically. Best investment for our chain."
    }
  ];

  return (
    <div className="landing-wrapper">

      {/* 1. NAVIGATION */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">
            <div className="logo-icon"><Zap size={16} color="black" fill="black" /></div> Rada<span>POS</span>
          </div>

          <div className="nav-links">
            <a onClick={() => scrollToSection('features')}>Features</a>
            <a onClick={() => scrollToSection('solutions')}>Solutions</a>
            <a onClick={() => scrollToSection('testimonials')}>Stories</a>
            <a onClick={() => scrollToSection('login-section')} className="active-link">Login</a>
          </div>

          <div className="nav-actions">
            <button className="theme-btn" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION WITH VIDEO BACKGROUND */}
      <header className="hero">
        {/* Background Video Layer */}
        <div className="hero-video-background">
          <video autoPlay loop muted playsInline className="video-bg">
            {/* Placeholder video - Replace with your actual asset */}
            <source src="https://assets.mixkit.co/videos/preview/mixkit-people-working-in-a-busy-restaurant-kitchen-4361-large.mp4" type="video/mp4" />
          </video>
          <div className="video-overlay-gradient"></div>
        </div>

        <div className="container hero-content-layer">
          <div className="pill-badge">
            <span className="pill-dot"></span> New: Multi-Location Sync Live
          </div>

          <h1 className="hero-title">
            The Pulse of Your Payments. <br />
            <span>Anywhere, Anytime.</span>
          </h1>

          <p className="hero-subtitle">
            From bustling retail stores to high-volume festivals, RadaPOS offers the speed,
            reliability, and insights you need to sell without limits.
          </p>

          {/* Replaced Buttons with simple scroll indicator or clean space */}
          <div className="scroll-indicator" onClick={() => scrollToSection('features')}>
            <span>Discover More</span>
            <div className="arrow-down"></div>
          </div>
        </div>
      </header>

      {/* 3. BENTO GRID - GLASSMORPHISM ON GREEN */}
      <section className="features" id="features">
        {/* Ambient Green Background */}
        <div className="green-ambient-bg"></div>

        <div className="container relative-z">
          <div className="section-head">
            <h2>The RadaPOS <span>Promise</span></h2>
            <p>Engineered for speed, built for reliability.</p>
          </div>

          <div className="bento-grid">

            {/* Card 1: Lightning Fast */}
            <div className="card glass-card">
              <div className="card-label"><Zap size={14} fill="white" /> Speed</div>
              <h3>Lightning-Fast Checkout</h3>
              <p>Don't let long lines kill your sales. Process transactions in seconds so you can serve more customers, faster.</p>
            </div>

            {/* Card 2: Offline Mode */}
            <div className="card glass-card">
              <div className="notification-pill">
                <WifiOff size={16} className="text-red" />
                <div>
                  <strong>Internet Disconnected</strong>
                  <span>Offline Mode Active</span>
                </div>
              </div>
              <div className="card-content-bottom">
                <h4>Works Without Wi-Fi</h4>
                <p>Business continues. Sales sync automatically once you're back online.</p>
              </div>
            </div>

            {/* Card 3: Hardware Agnostic */}
            <div className="card glass-card center-content">
              <div className="hardware-icon-group">
                <div className="h-icon">iPad</div>
                <div className="h-icon">Android</div>
                <div className="h-icon">Web</div>
              </div>
              <div className="video-caption">Hardware Agnostic</div>
            </div>

            {/* Card 4: Stat */}
            <div className="card glass-card card-stat">
              <div className="chart-bars">
                <span></span><span></span><span></span><span className="active"></span><span></span>
              </div>
              <div className="big-stat">0.2s</div>
              <p className="stat-label">Transaction Speed</p>
            </div>

            {/* Card 5: Intelligence */}
            <div className="card glass-card">
              <div className="icon-row">
                <TrendingUp size={32} />
              </div>
              <div className="bottom-block">
                <h4>Real-Time Intelligence</h4>
                <p>Track inventory and sales spikes as they happen. Make data-driven decisions on the go.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. FIXED vs EVENTS (Comparison Section) */}
      <section className="solutions" id="solutions">
        <div className="container">
          <div className="section-head">
            <h2>One System, <span>Endless Possibilities</span></h2>
          </div>

          <div className="comparison-grid">
            {/* Fixed Business */}
            <div className="solution-card">
              <div className="sol-icon fixed"><Store size={32} /></div>
              <h3>For Fixed Businesses</h3>
              <p className="sol-sub">Retail Stores, Restaurants, Cafes, and Salons.</p>
              <hr className="divider" />
              <ul className="feature-list">
                <li><CheckCircle2 size={16} /> <strong>Smart Inventory:</strong> Auto-deduct stock & low-inventory alerts.</li>
                <li><CheckCircle2 size={16} /> <strong>Customer Loyalty:</strong> CRM to track history and reward regulars.</li>
                <li><CheckCircle2 size={16} /> <strong>Staff Management:</strong> Set permissions & track shifts.</li>
              </ul>
            </div>

            {/* Events */}
            <div className="solution-card">
              <div className="sol-icon event"><ShoppingBag size={32} /></div>
              <h3>For Events & Pop-Ups</h3>
              <p className="sol-sub">Music Festivals, Food Trucks, Trade Shows.</p>
              <hr className="divider" />
              <ul className="feature-list">
                <li><CheckCircle2 size={16} /> <strong>Hardware Agnostic:</strong> Run on iPads, Android, or handhelds.</li>
                <li><CheckCircle2 size={16} /> <strong>Peak Traffic:</strong> Handle thousands of transactions per hour.</li>
                <li><CheckCircle2 size={16} /> <strong>Instant Setup:</strong> Train temp staff in 5 minutes.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TESTIMONIALS */}
      <section className="testimonials" id="testimonials">
        <div className="container">
          <div className="section-head">
            <h2>Trusted by <span>Locals</span></h2>
          </div>
          <div className="test-grid">
            {testimonials.map((t, i) => (
              <div key={i} className="t-card">
                <p>"{t.content}"</p>
                <div className="t-user">
                  <div className="t-avatar">{t.name[0]}</div>
                  <div>
                    <strong>{t.name}</strong>
                    <span>{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. LOGIN PORTAL SECTION (Separated) */}
      <section className="login-section" id="login-section">
        <div className="container">
          <div className="section-head">
            <h2>Login to <span>RadaPOS</span></h2>
            <p>Select your user role to continue.</p>
          </div>

          <div className="portal-grid">
            <div className="portal-card" onClick={() => navigate('/login')}>
              <div className="p-icon-box vendor"><Store size={24} /></div>
              <div className="p-text">
                <strong>Vendor Portal</strong>
                <span>Manage Store</span>
              </div>
              <ArrowRight size={16} className="arrow" />
            </div>
            <div className="portal-card" onClick={() => navigate('/login')}>
              <div className="p-icon-box cashier"><ShoppingBag size={24} /></div>
              <div className="p-text">
                <strong>Cashier Terminal</strong>
                <span>Start Selling</span>
              </div>
              <ArrowRight size={16} className="arrow" />
            </div>
            <div className="portal-card" onClick={() => navigate('/login')}>
              <div className="p-icon-box admin"><LayoutDashboard size={24} /></div>
              <div className="p-text">
                <strong>Admin Console</strong>
                <span>System View</span>
              </div>
              <ArrowRight size={16} className="arrow" />
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="copyright">
            <p>© 2026 RadaPOS Systems. All rights reserved.</p>
            <div className="links">
              <span>Privacy</span>
              <span>Terms</span>
              <span>Contact</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;