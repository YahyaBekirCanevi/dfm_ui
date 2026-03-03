import React from "react";
import { FileUploader } from "./FileUploader";
import { AnalysisResult } from "./AnalysisResult";

interface SidebarProps {
  file: File | null;
  setFile: (file: File | null) => void;
  analyzeModel: () => void;
  loading: boolean;
  analysisData: any;
  analysisError: string | null;
}

export function Sidebar({
  file,
  setFile,
  analyzeModel,
  loading,
  analysisData,
  analysisError,
}: SidebarProps) {
  return (
    <aside>
      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
        }}
      >
        <h2
          style={{
            fontSize: "18px",
            marginBottom: "15px",
            color: "#333",
          }}
        >
          Upload Model
        </h2>
        <FileUploader onFileLoaded={setFile} />

        <div
          style={{
            marginTop: "20px",
            borderTop: "1px solid #eee",
            paddingTop: "20px",
          }}
        >
          <p style={{ fontSize: "14px", color: "#666" }}>
            {file ? `Current file: ${file.name}` : "No file selected"}
          </p>
        </div>
      </div>

      <div
        className="api-tester"
        style={{
          marginTop: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <button
          onClick={analyzeModel}
          disabled={!file || loading}
          className="send-button"
          style={{
            backgroundColor: file ? "#4a90e2" : "#ccc",
            color: "white",
            padding: "12px",
            borderRadius: "8px",
            border: "none",
            fontWeight: "bold",
            cursor: file ? "pointer" : "not-allowed",
            transition: "all 0.2s",
          }}
        >
          {loading ? "Analyzing..." : "Run DFM Analysis"}
        </button>

        <AnalysisResult data={analysisData} error={analysisError} />
      </div>
    </aside>
  );
}
