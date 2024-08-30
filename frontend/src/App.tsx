import React, { useState } from "react";

const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };
  const handleSubmit = async () => {
    if (!selectedFile) {
      alert("Please select a file.");
      return;
    }

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
        console.log(fullImageUrl);
        setImageUrl(fullImageUrl);
      }
    } catch (error) {
      console.error("Loading error:", error);
      alert("An error occurred while uploading the file.");
    }
  };

  return (
    <main>
      <h1>Sea surface temperature display</h1>
      <input type="file" onChange={handleFileUpload} />
      <button onClick={handleSubmit}>Download and generate</button>

      {imageUrl && (
        <div className="map-wrapper">
          <h2>Generated map:</h2>
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

