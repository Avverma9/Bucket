/* eslint-disable no-unused-vars */
// src/App.js
import React from "react";
import FileUploader from "./components/FileUploader";
import MenuAppBar from "./components/Header";

function App() {
  return (
    <div className="App">
      <MenuAppBar/>
      <FileUploader />
    </div>
  );
}

export default App;
