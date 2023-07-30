import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [filename, setFilename] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const isSigned = localStorage.getItem('isSigned');
  const id = localStorage.getItem('id');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append('filename', filename);
      formData.append('images', imageFile);

      const response = await fetch(`https://bucket-u67q.onrender.com/bucket/${id}`, {
        method: 'POST',
        body: formData,
      });


  
  if (response.ok) {
    console.log('Data successfully sent to the backend!');
    setIsSuccess(true);
  } else {
    console.error('Failed to send data to the backend.');
  }
} catch (error) {
  console.error('Error sending data:', error);
}
};

useEffect(() => {
if (isSuccess) {
  setTimeout(() => {
    setIsSuccess(false);
    navigate('/bucket');
  }, 5000);
}
}, [isSuccess, navigate]);

  useEffect(() => {
    if (isSigned !== 'true') {
      navigate('/login');
    }
  }, [isSigned, navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
  };

  return (
    <div className='container-home'>
      <h1>Bucket</h1>
      {isSuccess ? (
        <div className='success-container'>
          <p>Success! Image uploaded successfully! <br /> Redirecting in 5 seconds</p>
          <img
            src={'https://i.pinimg.com/originals/b9/88/b7/b988b7c3e84e1f83ef9447157831b460.gif'}
            alt='Success'
          />
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <label>
            Filename:
            <input type='text' value={filename} onChange={(e) => setFilename(e.target.value)} />
          </label>
          <br />
          <label>
            Image:
            <input type='file' accept='image/*' onChange={handleFileChange} />
          </label>
          <br />
          <div className='home-submit'>
            <button type='submit'>Submit</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Home;
