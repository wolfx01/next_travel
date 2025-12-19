import "../styles/about.css";

export default function About() {
  return (
    <main className="about-container">
        <section className="about-hero">
            <div className="about-hero-content">
                <h1>Our Journey, Your Adventure</h1>
                <p>We believe in exploring the world, creating unforgettable memories, and living beyond limits. Join us on an adventure of a lifetime.</p>
            </div>
        </section>

        <section className="about-section">
            <h2>Our Story</h2>
            <p>Founded in 2025, Travel Beyond Limits started with a simple idea: to make travel accessible, enjoyable, and enriching for everyone. What began as a small blog sharing travel tips and hidden gems has grown into a comprehensive platform dedicated to helping you discover the world's most breathtaking destinations. Our team of passionate travelers and tech enthusiasts works tirelessly to bring you personalized recommendations, authentic experiences, and seamless planning tools.</p>
            <p>We've journeyed across continents, climbed mountains, explored ancient ruins, and relaxed on pristine beaches. Every experience has fueled our desire to share the magic of travel with you. We understand that every traveler is unique, and that's why we're committed to providing diverse options and insights to match your individual wanderlust.</p>
        </section>

        <section className="about-section">
            <h2>Our Mission & Values</h2>
            <div className="values-grid">
                <div className="value-card">
                    <i className="fas fa-globe-americas"></i>
                    <h3>Explore</h3>
                    <p>Inspiring curiosity and encouraging discovery of new cultures and landscapes.</p>
                </div>
                <div className="value-card">
                    <i className="fas fa-heart"></i>
                    <h3>Connect</h3>
                    <p>Fostering meaningful connections between travelers and local communities.</p>
                </div>
                <div className="value-card">
                    <i className="fas fa-lightbulb"></i>
                    <h3>Innovate</h3>
                    <p>Utilizing cutting-edge technology to simplify travel planning and enhance experiences.</p>
                </div>
                <div className="value-card">
                    <i className="fas fa-leaf"></i>
                    <h3>Sustain</h3>
                    <p>Promoting responsible and sustainable tourism practices for a better future.</p>
                </div>
            </div>
        </section>

        <section className="about-section cta-section">
            <h2>Ready for Your Next Adventure?</h2>
            <p>Let us help you plan the perfect trip. Explore our destinations or get personalized recommendations from our AI assistant.</p>
        </section>
    </main>
  );
}
