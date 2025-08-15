import React, { useState, useContext } from "react";
import "../App.css";
import LoginVector from "../assets/LoginVector.png";
import { UserContext } from "../context/UserContext";
import { useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { setUserInfo } = useContext(UserContext);
  const navigate = useNavigate();

  async function login(e) {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill out all fields");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/v1/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include"
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Email or password does not match");
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return;
      }

      const userInfo = await response.json();
      setUserInfo(userInfo);

      // ✅ Save token to localStorage
      if (userInfo.token) {
        localStorage.setItem("accessToken", userInfo.token);
        toast.success("Login successful! Redirecting...");
        setTimeout(() => navigate("/"), 3000);
      } else {
        toast.error("Login successful but token missing.");
      }

    } catch (error) {
      console.error("Login error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  }

  function loginAsGuest() {
    setEmail("guestuser10@gmail.com");
    setPassword("12345678");
  }

  return (
    <div className="login-page">
      <ToastContainer />
      <div className="login-container">
        <div className="login-form-container">
          <h2 className="login-title">Log In</h2>
          <form className="login-form" onSubmit={login}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" className="login-button">Log In</button>
          </form>
          <button onClick={loginAsGuest} className="guest-login-button">
            Log in as Guest
          </button>
          <div className="login-footer">
            <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
          </div>
        </div>
        <div className="login-image">
          <img src={LoginVector} alt="Login Vector" />
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
