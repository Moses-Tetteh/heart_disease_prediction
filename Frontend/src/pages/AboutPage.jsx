import React from "react";
import "../App.css";

function AboutPage() {
  return (
    <section className="our__team">
      <div className="container">
        <div className="team__content">
          <h6 className="subtitle">About the Project</h6>
          <h2>
            Revolutionizing <span className="highlight">Cardiac Healthcare through</span> AI Innovation
          </h2>
          <p className="about__description">
            Our AI-powered heart disease prediction system is designed to assist in the early detection and accurate prediction of cardiovascular conditions. By leveraging the Cleveland heart disease dataset and advanced machine learning algorithms, the system analyzes patient data to identify key risk factors and provide real-time diagnostic support.
          </p>

          <p className="about__description">
            The platform offers a fast, reliable, and user-friendly interface for inputting patient medical information. It then performs intelligent analysis to assess heart disease risk and generate actionable insights — all aimed at enabling timely intervention and improving patient outcomes.
          </p>

          <p className="about__description">
            This initiative embodies our commitment to the future of predictive and personalized cardiac care — where artificial intelligence enhances clinical decision-making, empowers patients, and helps save lives.
          </p>

          <p className="about__description">
            Whether you're a healthcare provider seeking risk assessment tools or a patient aiming to understand your heart health better, our platform delivers <strong>accessible, accurate, and AI-driven diagnostics</strong> at your fingertips.
          </p>
        </div>
      </div>
    </section>
  );
}

export default AboutPage;
