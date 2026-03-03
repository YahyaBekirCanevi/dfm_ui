import { useState } from "react";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { ModelViewer } from "../components/ModelViewer";

export function ViewerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const analyzeModel = async () => {
    if (!file) {
      alert("Please load a model first.");
      return;
    }

    setLoading(true);
    setAnalysisError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("https://dfm-service-4xf0.onrender.com/analyze", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Analysis failed: ${res.statusText}`);
      }

      const data = await res.json();
      setAnalysisData(data);
    } catch (error) {
      setAnalysisError(String(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="app"
      style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}
    >
      <Header />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 3fr",
          gap: "20px",
        }}
      >
        <Sidebar
          file={file}
          setFile={setFile}
          analyzeModel={analyzeModel}
          loading={loading}
          analysisData={analysisData}
          analysisError={analysisError}
        />

        <main>
          <ModelViewer file={file} analysisData={analysisData} />
        </main>
      </div>
    </div>
  );
}
