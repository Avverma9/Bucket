import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [images, setImages] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userData = new FormData();
      userData.append("name", name);
      userData.append("email", email);
      userData.append("mobile", mobile);
      userData.append("password", password);

      // append each image file to the formData
      for (let i = 0; i < images.length; i++) {
        userData.append("images", images[i]);
      }

      const res = await fetch("https://bucket-u67q.onrender.com/register", {
        method: "POST",
        body: userData,
      });

      const data = await res.json();
      console.log(data);

      navigate("/login"); // Redirect to the login page after successful registration
    } catch (error) {
      console.error(error);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);

    // show preview of image
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(files[0]);
  };
  const handleLogin = () => {
    navigate("/login");
  };
  return (
    <div className="register-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div className="register-field">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="register-field">
          <label htmlFor="email">Email:</label>
          <input
            type="text"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="register-field">
          <label htmlFor="mobile">Mobile:</label>
          <input
            type="text"
            id="mobile"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
          />
        </div>
        <div className="register-field">
          <label htmlFor="password">Password:</label>
          <input
            type="text"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="register-field">
          <label htmlFor="profile-picture">Choose Profile Picture:</label>
          <input
            type="file"
            id="profile-picture"
            multiple
            onChange={handleImageChange}
          />
        </div>
        <div className="image-preview">
          {previewImage && (
            <img src={previewImage} alt="Preview" className="circular-image" />
          )}
        </div>
        <button type="submit">Sign Up</button>
      </form>

      <div>
        <p>Already have an account ?</p>
      </div>
      <button onClick={handleLogin}> Sign in </button>
    </div>
  );
};

export default RegisterPage;
