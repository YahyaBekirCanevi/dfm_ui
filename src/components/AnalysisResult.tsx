import { useRef, useEffect } from "react";

interface AnalysisResultProps {
  data: any;
  error?: string | null;
}

export function AnalysisResult({ data, error }: AnalysisResultProps) {
  const responseInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (responseInputRef.current) {
      if (error) {
        responseInputRef.current.value = error;
      } else if (data) {
        responseInputRef.current.value = JSON.stringify(data.dfm_feedback, null, 2);
      } else {
        responseInputRef.current.value = "";
      }
    }
  }, [data, error]);

  return (
    <div style={{ marginTop: "10px" }}>
      <h3 style={{ fontSize: "14px", marginBottom: "5px", color: "#666" }}>
        Analysis Result
      </h3>
      <textarea
        ref={responseInputRef}
        readOnly
        placeholder="DFM report will appear here..."
        className="response-area"
        style={{
          width: "100%",
          height: "300px",
          borderRadius: "8px",
          border: "1px solid #ddd",
          padding: "10px",
          fontSize: "12px",
          fontFamily: "monospace",
          backgroundColor: "#fafafa",
          color: "#333",
        }}
      />
    </div>
  );
}
