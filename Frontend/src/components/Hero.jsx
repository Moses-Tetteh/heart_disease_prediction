import React from "react";
import { Link } from "react-router-dom"; // Import Link from React Router
import homepageImage from "../assets/homepage.png";

function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>AI-Enabled Cardiac Risk Assessment Tool</h1>
        <p>
          AI in Cardiology: A Comprehensive Suite for Rapid Heart 
          Disease Diagnosis and Prevention
        </p>
        <Link to="/predictors" style={{ textDecoration: "none" }}>
          <div className="pos">
            <button className="btn btn-primary">Diagnose Now</button>
          </div>
        </Link>
      </div>
      <div className="hero-image">
        <img src={homepageImage} alt="AI Multi-Disease Diagnostic Suite" />
      </div>
    </section>
  );
}

export default Hero;
