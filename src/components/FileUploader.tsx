import React, { useCallback, useState } from "react";

interface FileUploaderProps {
  onFileLoaded: (file: File) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileLoaded }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        onFileLoaded(files[0] as File);
      }
    },
    [onFileLoaded],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        onFileLoaded(files[0] as File);
      }
    },
    [onFileLoaded],
  );

  return (
    <div
      className={`file-uploader ${isDragging ? "dragging" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        border: "2px dashed #4a90e2",
        borderRadius: "12px",
        padding: "40px",
        textAlign: "center",
        backgroundColor: isDragging ? "rgba(74, 144, 226, 0.1)" : "transparent",
        transition: "all 0.3s ease",
        cursor: "pointer",
        margin: "20px 0",
      }}
    >
      <input
        type="file"
        id="fileInput"
        onChange={handleFileChange}
        accept=".step,.stp"
        style={{ display: "none" }}
      />
      <label htmlFor="fileInput" style={{ cursor: "pointer" }}>
        <div style={{ fontSize: "48px", marginBottom: "10px" }}>📁</div>
        <p style={{ color: "#666" }}>
          Drag & drop your file here, or click to browse
        </p>
        <span style={{ fontSize: "12px", color: "#999" }}>
          Accepts .step, .stp files
        </span>
      </label>
    </div>
  );
};
