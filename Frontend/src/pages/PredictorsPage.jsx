import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Card from "../components/Card";
import heartImage from "../assets/heart.png";
import lungImage from "../assets/lung.png";
import HospitalImage from "../assets/Hospital.png";
import brainImage from "../assets/brain.png";
import diabetesImage from "../assets/diabetes.png";
import breastImage from "../assets/breast.png";
import { UserContext } from "../context/UserContext";
import "../App.css";

function PredictorsPage() {
  const { userInfo } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLinkClick = (path) => {
    if (userInfo) {
      navigate(path);
    } else {
      toast.info("Please log in to access this predictor.");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    }
  };

  return (
    <div className="predictor-container">
      <ToastContainer />
      <p className="description">
        The Comprehensive Heart Disease Prediction Suite leverages advanced AI technology to enable early 
        detection and accurate prediction of heart disease. By utilizing powerful machine learning algorithms 
        and the widely recognized Cleveland heart disease dataset, our system identifies critical indicators 
        that signal potential cardiac conditions. This allows for timely medical intervention and the development 
        of personalized treatment strategies. Our mission is to transform cardiovascular healthcare through 
        predictive intelligence—reducing the risk, severity, and long-term impact of heart disease while 
        improving patient outcomes and quality of life.
      </p>
      <div className="card-container">
        <div
          onClick={() => handleLinkClick("/predictors/heart")}
          className="card"
          style={{ textDecoration: "none" }}
        >
          <Card
            image={HospitalImage}
            title="Heart Disease"
            description="Heart Health Revolution: AI-driven early detection and prevention of heart disease."
          />
        </div>


      </div>
    </div>
  );
}

export default PredictorsPage;
