import React, { useState } from "react";
import "../App.css";
import { FiUpload, FiFileText } from "react-icons/fi";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import Loader from "react-loader-spinner";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import axios from "axios";

const StrokePage = () => {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
  });

  const [predictionResult, setPredictionResult] = useState({
    status: "",
    prediction: "",
    confidence: ""
  });

  const [error, setError] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageUploaded, setImageUploaded] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUploadImage = (e) => {
    const file = e.target.files[0];
    if (file?.type.startsWith("image/")) {
      setImageFile(file);
      setImageUploaded(true);
      setError("");
    } else {
      setError("Please upload a valid image file (JPEG/PNG)");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      setError("Please upload a brain scan image");
      return;
    }

    setLoading(true);
    const formDataToSend = new FormData();
    formDataToSend.append("scan_image", imageFile);
    formDataToSend.append("name", formData.name);
    formDataToSend.append("age", formData.age);
    formDataToSend.append("gender", formData.gender);

    try {
      const response = await axios.post(
        "http://localhost:8080/api/v1/predict/stroke-pred",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true, // ⬅️ Send cookies
        }
      );

      if (response.data.status === "success") {
        setPredictionResult({
          status: response.data.status,
          prediction: response.data.prediction,
          confidence: response.data.confidence
        });
        setShowResult(true);
        setError("");
      } else {
        throw new Error(response.data.message || "Prediction failed");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Prediction request failed");
      console.error("Prediction error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRePredict = () => {
    setShowResult(false);
    setPredictionResult({ status: "", prediction: "", confidence: "" });
    setFormData({ name: "", age: "", gender: "" });
    setImageFile(null);
    setImageUploaded(false);
  };

  const generateDynamicPDF = async () => {
    try {
      const response = await fetch("/StrokeReport.pdf");
      if (!response.ok) throw new Error("PDF template not found");

      const existingPdfBytes = await response.arrayBuffer();
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const { width, height } = firstPage.getSize();

      const fields = [
        { label: "Patient Name:", value: formData.name, size: 14 },
        { label: "Age:", value: formData.age, size: 14 },
        { label: "Gender:", value: formData.gender === "M" ? "Male" : "Female", size: 14 },
        { label: "Scan Result:", value: predictionResult.prediction.toUpperCase(), size: 16 },
        { label: "Confidence Level:", value: predictionResult.confidence, size: 14 },
        { label: "Date of Analysis:", value: new Date().toLocaleDateString(), size: 14 }
      ];

      let yOffset = height - 250;
      fields.forEach(({ label, value, size }) => {
        firstPage.drawText(`${label} ${value}`, {
          x: 50,
          y: yOffset,
          size,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        });
        yOffset -= 28;
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `stroke_report_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      setError("Failed to generate PDF report");
      console.error("PDF generation error:", err);
    }
  };

  return (
    <div className="stroke-container">
      <h1 className="stroke-header">Brain Stroke Detection Analysis</h1>

      {loading && (
        <div className="stroke-loader">
          <Loader type="TailSpin" color="#2c3e50" height={80} width={80} />
          <p>Analyzing Brain Scan...</p>
        </div>
      )}

      {!showResult && !loading && (
        <form className="stroke-form" onSubmit={handleSubmit}>
          <div className="stroke-input-group">
            <input
              type="text"
              name="name"
              placeholder="Patient Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              type="number"
              name="age"
              placeholder="Age"
              value={formData.age}
              onChange={handleChange}
              min="1"
              max="120"
              required
            />
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="">Select Gender</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
          </div>

          <div className="stroke-upload-section">
            <div className="stroke-upload-box">
              <label className={imageUploaded ? "uploaded" : ""}>
                <FiUpload className="upload-icon" />
                {imageUploaded ? "Scan Uploaded" : "Upload Brain Scan"}
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={handleUploadImage}
                  hidden
                />
              </label>
              {/* <button type="button" className="sample-btn" onClick={() => setShowModal(true)}>
                <FiFileText /> View Sample Scans
              </button> */}
            </div>

            <button type="submit" className="analyze-btn" disabled={!imageUploaded}>
              Analyze Scan
            </button>
          </div>
        </form>
      )}

      {showResult && (
        <div className="stroke-results">
          <div className="result-card">
            <h2>Analysis Report</h2>
            <div className="patient-info">
              <p><span>Name:</span> {formData.name}</p>
              <p><span>Age:</span> {formData.age}</p>
              <p><span>Gender:</span> {formData.gender === "M" ? "Male" : "Female"}</p>
            </div>
            <div className={`prediction ${predictionResult.prediction.toLowerCase()}`}>
              <h3>Result: {predictionResult.prediction.toUpperCase()}</h3>
              <p>Confidence: {predictionResult.confidence}</p>
            </div>
            <div className="report-actions">
              {/* <button onClick={generateDynamicPDF} className="report-btn">
                Download Full Report
              </button> */}
              <button onClick={handleRePredict} className="reanalyze-btn">
                New Analysis
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="stroke-modal">
          <div className="modal-content">
            <h3>Sample Brain Scans</h3>
            <div className="sample-buttons">
              <a href="/samples/stroke_positive.zip" download className="sample-download">
                Positive Stroke Examples
              </a>
              <a href="/samples/stroke_negative.zip" download className="sample-download">
                Normal Brain Scans
              </a>
            </div>
            <button className="close-modal" onClick={() => setShowModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {error && <div className="stroke-error">{error}</div>}
    </div>
  );
};

export default StrokePage;
