import React, { useState, useEffect } from "react";
import { AiTwotoneDelete } from "react-icons/ai";
import { S3 } from "aws-sdk";
import {
  Button,
  Container,
  Box,
  Typography,
  CircularProgress,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Paper,
  IconButton,
  Tooltip,
  TablePagination,
  Toolbar,
  AppBar,
} from "@mui/material";
import { Photo, InsertDriveFile } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Configure AWS S3
const s3 = new S3({
  region: "ap-south-1",
  credentials: {
    accessKeyId: "AKIARRSTFGSV74HCL27W",
    secretAccessKey: "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",
  },
});

const FileUploader = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [displayedFiles, setDisplayedFiles] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [continuationToken, setContinuationToken] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchFileList();
  }, []);

  useEffect(() => {
    // Filter files based on search query
    setDisplayedFiles(
      fileList.filter((file) =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [fileList, searchQuery]);

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  const uploadFile = () => {
    if (!selectedFile) {
      toast.error("No file selected.");
      return;
    }

    setLoading(true);
    const params = {
      ACL: "public-read",
      Body: selectedFile,
      Bucket: "avverma",
      Key: selectedFile.name,
    };

    s3.putObject(params, (err, data) => {
      setLoading(false);
      if (err) {
        toast.error("Error uploading file. Check console for details.");
      } else {
        toast.success("File uploaded successfully.");
        setSelectedFile(null); // Clear selected file after successful upload
        fetchFileList(); // Fetch the updated file list
      }
    });
  };

  const deleteFile = (fileName) => {
    const params = {
      Bucket: "avverma",
      Key: fileName,
    };

    s3.deleteObject(params, (err, data) => {
      if (err) {
        toast.error("Error deleting file. Check console for details.");
      } else {
        // Remove the deleted file from the state
        setFileList((prevList) =>
          prevList.filter((file) => file.name !== fileName)
        );
        setDisplayedFiles((prevList) =>
          prevList.filter((file) => file.name !== fileName)
        );
        toast.success("File deleted successfully.");
      }
    });
  };

  const deleteSelectedFiles = () => {
    selectedFiles.forEach((fileName) => deleteFile(fileName));
    setSelectedFiles([]);
  };

  const fetchFileList = () => {
    const params = {
      Bucket: "avverma",
      MaxKeys: 1000, // Number of items per request
      ...(continuationToken ? { ContinuationToken: continuationToken } : {}),
    };

    s3.listObjectsV2(params, (err, data) => {
      if (err) {
        toast.error("Error fetching file list. Check console for details.");
      } else {
        const fileDetails = data.Contents.map((item) => ({
          name: item.Key,
          lastModified: item.LastModified,
          url: s3.getSignedUrl("getObject", {
            Bucket: "avverma",
            Key: item.Key,
            Expires: 60 * 5, // URL expires in 5 minutes
          }),
        }));

        // Sort files by date (latest first)
        fileDetails.sort(
          (a, b) => new Date(b.lastModified) - new Date(a.lastModified)
        );

        setFileList(fileDetails);
        setDisplayedFiles(fileDetails);

        // Check if there's more data to fetch
        setContinuationToken(
          data.IsTruncated ? data.NextContinuationToken : null
        );
        setHasMore(data.IsTruncated);
      }
    });
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      setSelectedFiles(displayedFiles.map((file) => file.name));
    } else {
      setSelectedFiles([]);
    }
  };

  const handleClick = (fileName) => {
    const selectedIndex = selectedFiles.indexOf(fileName);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedFiles, fileName);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedFiles.slice(1));
    } else if (selectedIndex === selectedFiles.length - 1) {
      newSelected = newSelected.concat(selectedFiles.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedFiles.slice(0, selectedIndex),
        selectedFiles.slice(selectedIndex + 1)
      );
    }
    setSelectedFiles(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <ToastContainer />
      <Box textAlign="center" mb={4}>
        <Typography variant="h4" gutterBottom>
          Bucket Manager
        </Typography>
        <input
          type="file"
          onChange={handleFileInput}
          style={{ display: "none" }}
          id="file-upload"
        />
        <label htmlFor="file-upload">
          <Button
            variant="contained"
            color="primary"
            component="span"
            sx={{ mr: 2 }}
          >
            Select File
          </Button>
        </label>
        <Button
          variant="contained"
          color="secondary"
          onClick={uploadFile}
          disabled={loading || !selectedFile}
          sx={{ ml: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : "Upload"}
        </Button>
        {selectedFile && (
          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            Selected File: {selectedFile.name}
          </Typography>
        )}
      </Box>

      {error && (
        <Typography color="error" textAlign="center" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <AppBar position="static" color="default" sx={{ mb: 2 }}>
        <Toolbar>
          <TextField
            label="Search"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ mr: 2, flex: 1 }}
          />
          <Button
            variant="contained"
            color="error"
            onClick={deleteSelectedFiles}
            disabled={selectedFiles.length === 0}
            sx={{ ml: 2 }}
          >
            Delete Selected
          </Button>
        </Toolbar>
      </AppBar>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={
                    selectedFiles.length > 0 &&
                    selectedFiles.length < displayedFiles.length
                  }
                  checked={
                    displayedFiles.length > 0 &&
                    selectedFiles.length === displayedFiles.length
                  }
                  onChange={handleSelectAllClick}
                />
              </TableCell>
              <TableCell>Preview</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Last Modified</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedFiles
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((file) => (
                <TableRow
                  key={file.name}
                  selected={selectedFiles.indexOf(file.name) !== -1}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedFiles.indexOf(file.name) !== -1}
                      onChange={() => handleClick(file.name)}
                    />
                  </TableCell>
                  <TableCell>
                    {file.name.match(/\.(jpeg|jpg|gif|png)$/) ? (
                      <img
                        src={file.url}
                        alt={file.name}
                        className="image-preview"
                      />
                    ) : (
                      <Photo style={{ width: 50, height: 50 }} />
                    )}
                  </TableCell>
                  <TableCell>{file.name}</TableCell>
                  <TableCell>
                    {new Date(file.lastModified).toLocaleString()}
                  </TableCell>

                  <TableCell>
                    <Tooltip title="Download">
                      <IconButton
                        component="a"
                        href={file.url}
                        target="_blank"
                        rel="noopener"
                      >
                        <Photo />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton onClick={() => deleteFile(file.name)}>
                        <AiTwotoneDelete />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>

        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100, 150, 200]}
          component="div"
          count={displayedFiles.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <style jsx>{`
        .image-preview {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        .image-preview:hover {
          transform: scale(1.5);
          z-index: 1;
        }
      `}</style>
    </Container>
  );
};

export default FileUploader;
