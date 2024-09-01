import React, { useState } from "react";
import {
  Button,
  Container,
  Typography,
  TextField,
  CircularProgress,
  FormHelperText,
} from "@mui/material";

const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) {
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError("Please select a file.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.imageUrl) {
        const fullImageUrl = `http://localhost:3001${result.imageUrl}`;
        setImageUrl(fullImageUrl);
        setError(null);
      }
    } catch (error) {
      console.error("Loading error:", error);
      setError("An error occurred while uploading the file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="main-container">
      <Container maxWidth="xs">
        <Typography variant="h4" gutterBottom>
          Sea Surface Temperature Display
        </Typography>
        <TextField
          type="file"
          fullWidth
          variant="outlined"
          margin="normal"
          onChange={handleFileUpload}
          aria-label="file input"
        />
        <FormHelperText sx={{ textAlign: "center" }}>
          {selectedFile
            ? `Selected file: ${selectedFile.name}`
            : "No file selected"}
        </FormHelperText>

        {error && <div className="error">{error}</div>}

        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Download and Generate"}
        </Button>
      </Container>
      {imageUrl && (
        <div className="map-wrapper">
          <Typography variant="h6" gutterBottom>
            Generated Map:
          </Typography>
          <img
            src={imageUrl}
            alt="Sea Surface Temperature Map"
            className="map-image"
          />
        </div>
      )}
    </main>
  );
};

export default App;

