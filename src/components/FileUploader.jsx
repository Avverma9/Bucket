/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { S3 } from "aws-sdk";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Grid,
  Box,
  Container,
  CircularProgress,
  IconButton,
  Tooltip,
  TextField,
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
        fetchFileList(); // Fetch the updated file list
        toast.success("File deleted successfully.");
      }
    });
  };

  const fetchFileList = (token = null) => {
    const params = {
      Bucket: "avverma",
      MaxKeys: 24, // Number of items per page
      ...(token ? { ContinuationToken: token } : {}),
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
            Expires: 60 * 5,
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

  const loadMoreFiles = () => {
    if (continuationToken) {
      fetchFileList(continuationToken);
    }
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

      <Box mb={4}>
        <TextField
          label="Search"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 2 }}
        />
      </Box>

      <Typography variant="h5" gutterBottom textAlign="center">
        Uploaded Files
      </Typography>
      <Grid container spacing={2}>
        {displayedFiles.map((file, index) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
            <Card
              sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                boxShadow: 3,
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <CardContent sx={{ flex: 1, p: 2 }}>
                <Typography variant="h6" noWrap>
                  {file.name}
                </Typography>
                <Typography color="textSecondary" noWrap>
                  {new Date(file.lastModified).toLocaleDateString()}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: 200,
                    overflow: "hidden",
                    mt: 2,
                    borderRadius: 1,
                  }}
                >
                  {file.name.match(/\.(jpeg|jpg|gif|png)$/) ? (
                    <img
                      src={file.url}
                      alt={file.name}
                      style={{
                        width: "100%",
                        height: "auto",
                        maxHeight: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        width: "100%",
                        height: "100%",
                        bgcolor: "background.default",
                      }}
                    >
                      <Tooltip title={`File: ${file.name}`} arrow>
                        <IconButton>
                          {file.name.match(/\.(pdf)$/) ? (
                            <InsertDriveFile color="action" fontSize="large" />
                          ) : (
                            <Photo color="action" fontSize="large" />
                          )}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                </Box>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  color="error"
                  onClick={() => deleteFile(file.name)}
                  sx={{ mx: "auto" }}
                >
                  Delete
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={loadMoreFiles}
          disabled={!hasMore || loading}
        >
          {loading ? <CircularProgress size={24} /> : "Load More"}
        </Button>
      </Box>
    </Container>
  );
};

export default FileUploader;
