import React from "react";
import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";
import "../App.css";

function FooterPage() {
  return (
    <footer className="footer">
      <div className="container footer__container">
        <div className="footer__left">
          <h4>AI Health Diagnostics</h4>
          <p>
           Empowering early detection and accurate prediction of heart disease through intelligent, 
           AI-driven cardiovascular healthcare solutions.
          </p>
        </div>

        <div className="footer__links">
          <h5>Quick Links</h5>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/predictors">Predictors</a></li>
          </ul>
        </div>

        <div className="footer__social">
          <h5>Connect</h5>
          <div className="social__icons">
            <a href="mailto:aihealth@example.com" target="_blank" rel="noopener noreferrer">
              <FaEnvelope />
            </a>
            <a href="https://github.com/your-repo" target="_blank" rel="noopener noreferrer">
              <FaGithub />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
              <FaLinkedin />
            </a>
          </div>
        </div>
      </div>
      <div className="footer__bottom">
        <p>© {new Date().getFullYear()} AI Health Diagnostics. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default FooterPage;
