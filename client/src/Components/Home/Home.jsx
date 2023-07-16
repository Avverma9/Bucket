import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Home.css";

const Home = () => {
  const navigate = useNavigate();
  const [filename, setFilename] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const isSigned = localStorage.getItem("isSigned");
  const id = localStorage.getItem("id");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("filename", filename);
      formData.append("images", imageFile);

      const response = await fetch(
        `https://bucket-u67q.onrender.com/bucket/${id}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        console.log("Data successfully sent to the backend!");
        // Do something with the response if needed
      } else {
        console.error("Failed to send data to the backend.");
      }
    } catch (error) {
      console.error("Error sending data:", error);
    }
  };
  // will check if user is logged in or not
  useEffect(() => {
    if (isSigned !== "true") {
      navigate("/login");
    }
  }, [isSigned, navigate]);

  //===========================
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
  };

  return (
    <div className="container-home">
      <h1>Bucket</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Filename:
          <input
            type="text"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
          />
        </label>
        <br />
        <label>
          Image:
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </label>
        <br />
        <div className="home-submit">
          <button type="submit">Submit</button>
        </div>
      </form>
    </div>
  );
};

export default Home;
