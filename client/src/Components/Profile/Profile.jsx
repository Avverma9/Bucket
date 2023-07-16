import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

const Profile = () => {
  const [data, setData] = useState({});
  const id = localStorage.getItem('id');
  const navigate = useNavigate();
  const isSigned = localStorage.getItem('isSigned');

  useEffect(() => {
    fetch(`http://localhost:5000/user/${id}`)
      .then((response) => response.json())
      .then((data) => setData(data))
      .catch((error) => console.log(error));
  }, []);

  useEffect(() => {
    if (isSigned !== 'true') {
      navigate('/login');
    }
  }, [isSigned, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('id');
    localStorage.removeItem('isSigned');
    navigate('/login');
  };

  return (
    <div className='profile-container'>
      <div className='profile-image'>
        <img src={data.images} alt='Profile' />
      </div>
      <div className='profile-info'>
        <h4 className='profile-name'>{data.name}</h4>
        <h5 className='profile-email'>{data.email}</h5>
        <h5 className='profile-mobile'>{data.mobile}</h5>

       
      </div>
      <button className='logout-button' onClick={handleLogout}>
        <FontAwesomeIcon icon={faSignOutAlt} /> Log out
      </button>
    </div>
  );
};

export default Profile;
