import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { RiFileCopyLine, RiDeleteBinLine } from "react-icons/ri";

import "bootstrap/dist/css/bootstrap.min.css";
import "./Bucket.css";

const Bucket = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [bucketCount, setBucketCount] = useState(0);
  const isSigned = localStorage.getItem("isSigned");
  const id = localStorage.getItem("id");

  const itemsPerPage = 15;
  const maxVisiblePages = 6;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://bucket-u67q.onrender.com/bucket/${id}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch data from the backend.");
        }
        const { buckets, bucketCount } = await response.json();
        setData(buckets);
        setBucketCount(bucketCount); // Add this line to set the bucketCount state
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (location.pathname === "/bucket") {
      fetchData();
    }
  }, [location]);

  useEffect(() => {
    if (isSigned !== "true") {
      navigate("/login");
    }
  }, [isSigned, navigate]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCopyUrl = (url, id) => {
    navigator.clipboard.writeText(url);
    alert("Image URL copied to clipboard!");
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`https://bucket-u67q.onrender.com/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        // Remove the deleted item from the data
        const updatedData = data.filter((item) => item._id !== id);
        setData(updatedData);
        const { bucketCount } = await response.json();
        setBucketCount(bucketCount); // Update the bucketCount state with the new value
       
      } else {
        throw new Error("Failed to delete the item.");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Error deleting item. Please try again.");
    }
  };

  // Pagination
  const filteredData =
    data.length > 0
      ? data.filter((item) =>
          item.filename.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : [];

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const visiblePages = [];
  const totalPagesToDisplay = Math.min(totalPages, maxVisiblePages);
  let startPage = 1;
  let endPage = totalPagesToDisplay;

  if (currentPage > Math.floor(maxVisiblePages / 2)) {
    startPage = currentPage - Math.floor(maxVisiblePages / 2);
    endPage = startPage + totalPagesToDisplay - 1;
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = endPage - totalPagesToDisplay + 1;
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    visiblePages.push(i);
  }

  const handleNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handlePrevPage = () => {
    setCurrentPage((prevPage) => prevPage - 1);
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container">
      <h1>Bucket</h1>
      <form>
        <input
          type="text"
          placeholder="Search filename"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </form>
      <p>Total Files : {bucketCount}</p> {/* Display the bucketCount here */}
      <div className="card-container">
        {currentData.map((item) => (
          <div className="card" key={item._id}>
            <img className="card-image" src={item.images} alt={item.filename} />
            <div className="card-content">
              <h3 className="card-title">{item.filename}</h3>
              <button
                className="copy-button"
                onClick={() => handleCopyUrl(item.images, item._id)}
              >
                <RiFileCopyLine />
              </button>
              <button
                className="delete-button"
                onClick={() => handleDelete(item._id)}
              >
                <RiDeleteBinLine />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="pagination">
        <button
          className="pagination-button"
          onClick={handlePrevPage}
          disabled={currentPage === 1}
        >
          Prev
        </button>
        {visiblePages.map((page) => (
          <button
            key={page}
            className={`pagination-button ${
              page === currentPage ? "active" : ""
            }`}
            onClick={() => handlePageClick(page)}
          >
            {page}
          </button>
        ))}
        <button
          className="pagination-button"
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Bucket;
