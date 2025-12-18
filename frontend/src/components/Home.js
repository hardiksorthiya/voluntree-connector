import React from 'react';
import { Link } from 'react-router-dom';
import '../css/Home.css';

const Home = () => {
  const token = localStorage.getItem('token');
  
  return (
    <div className="home">
      <main className="home-main">
        <section className="hero">
          <h2>Connect. Volunteer. Make a Difference.</h2>
          <p>Join thousands of volunteers and organizations making an impact in their communities through Volunteer Connect.</p>
          <div className="hero-buttons">
            {token ? (
              <Link to="/profile" className="btn-primary btn-large">Go to Profile</Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary btn-large">Get Started</Link>
                <Link to="/login" className="btn-secondary btn-large">Login</Link>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;

