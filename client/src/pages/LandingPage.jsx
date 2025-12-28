import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="landing-container">
            <nav className="navbar">
                <h1>RadaPOS</h1>
                <button className="btn-secondary" onClick={() => navigate('/login')}>Login</button>
            </nav>

            <header className="hero-section">
                <h2>Powering High-Traffic Events</h2>
                <p>The fastest, most reliable POS for festivals, pop-up markets, and busy vendors.</p>
                <div className="stats">
                    <div className="stat-box">
                        <h3>500+</h3>
                        <p>Events Supported</p>
                    </div>
                    <div className="stat-box">
                        <h3>10k+</h3>
                        <p>Transactions Processed</p>
                    </div>
                </div>
                <button className="btn-primary" onClick={() => navigate('/register')}>Get Started</button>
            </header>

            <section className="testimonials">
                <h3>Trusted by Vendors</h3>
                <blockquote>"RadaPOS saved our sales during the chaos of Nairobi Burger Fest. It just works."</blockquote>
                <cite>- Mutua, Grill Master</cite>
            </section>
        </div>
    );
};

export default LandingPage;