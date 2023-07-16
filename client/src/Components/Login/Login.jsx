import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import "./Login.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("https://bucket-u67q.onrender.com/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.user._id) {
          localStorage.setItem("id", data.user._id);
          localStorage.setItem("isSigned", "true");
        } else {
          console.log("there is not _id is coming from backend");
        }
        navigate("/bucket");
      } else {
        console.log("log in failed");
      }
    } catch (error) {
      console.log(error);
    }
  };
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const handleRegisterNowClick = () => {
    navigate("/");
  };
  return (
    <div className="card_signin">
      <form onSubmit={handleSubmit}>
        <div className="login_form">
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter Your Email"
          />
        </div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Enter Your Password"
        />

        <button
          type="button"
          className="show_password"
          onClick={togglePasswordVisibility}
        >
          {showPassword ? <FiEyeOff /> : <FiEye />}
        </button>

        <button type="submit" className="submit_login">
          Sign In
        </button>
      </form>
      <div className="register_now">
        <p>Don't have an account ?</p>
        <button onClick={handleRegisterNowClick}>Register Now</button>
      </div>
    </div>
  );
};

export default LoginPage;
