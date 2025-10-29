import React, { useState } from "react";
import * as XLSX from "xlsx";

interface LicenseResult {
  licenceNumber: string;
  status?: string;
  [key: string]: any;
}

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<LicenseResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && selected.name.endsWith(".xlsx")) {
      setFile(selected);
      setError(null);
    } else {
      setError("Please upload a valid .txt file");
    }
  };

  const handleSubmit = async () => {
    if (!file) return setError("Please upload a file first.");
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(
        "https://gladconnect-license-verification-production.up.railway.app/api/verify",
        {
          method: "POST",
          body: formData,
        }
      );
      if (res.status === 200) {
        console.log(res);
      }
      if (!res.ok) throw new Error("Failed to verify licences");
      const json = await res.json();
      const items = Array.isArray(json) ? json : json?.data || [];
      setResults(items);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportXLSX = () => {
    if (!results || results.length === 0) return;

    const rows = results.map((r) => ({
      licenceNumber: r.licenceNumber ?? "",
      licensee: r.licensee ?? "",
      status: r.status ?? "",
      expires: r.expires ?? "",
    }));

    const ws = XLSX.utils.json_to_sheet(rows, {
      header: ["licenceNumber", "licensee", "status", "expires"],
    });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Results");
    XLSX.writeFile(
      wb,
      `license-results-${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  return (
    <div
      style={{
        maxWidth: 700,
        margin: "40px auto",
        textAlign: "center",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ color: "#141414" }}>Glad Connect License Verification</h1>

      <div style={{ marginTop: 20 }}>
        <input type="file" accept=".xlsx" onChange={handleFileChange} />
      </div>
      <button
        onClick={handleSubmit}
        disabled={!file || loading}
        style={{
          margin: 10,
          padding: "8px 14px",
          backgroundColor: "#3b3b3b",
          color: "#fff",
          border: "none",
          fontWeight: "bold",
          borderRadius: 6,
          cursor: "pointer",
          width: "20%",
        }}
      >
        {loading ? "Verifying..." : "Upload & Verify"}
      </button>

      {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}

      {results.length > 0 && (
        <div style={{ marginTop: 30, textAlign: "left" }}>
          <h3>Verification Results ({results.length})</h3>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: 10,
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#636363" }}>
                <th
                  style={{
                    border: "1px solid #636363",
                    padding: 8,
                    color: "white",
                  }}
                >
                  Licence Number
                </th>
                <th
                  style={{
                    border: "1px solid #636363",
                    padding: 8,
                    color: "white",
                  }}
                >
                  Licensee
                </th>
                <th
                  style={{
                    border: "1px solid #636363",
                    padding: 8,
                    color: "white",
                  }}
                >
                  Status
                </th>
                <th
                  style={{
                    border: "1px solid #636363",
                    padding: 8,
                    color: "white",
                  }}
                >
                  Expires
                </th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, idx) => (
                <tr key={idx}>
                  <td style={{ border: "1px solid #636363", padding: 8 }}>
                    {r.licenceNumber}
                  </td>
                  <td style={{ border: "1px solid #636363", padding: 8 }}>
                    {r.licensee}
                  </td>
                  <td style={{ border: "1px solid #636363", padding: 8 }}>
                    {r.status || "N/A"}
                  </td>
                  <td style={{ border: "1px solid #636363", padding: 8 }}>
                    {r.expires || "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {results?.length > 0 && (
        <button
          onClick={handleExportXLSX}
          disabled={!file || loading}
          style={{
            marginLeft: 40,
            marginTop: 30,
            padding: "8px 14px",
            backgroundColor: "#3b3b3b",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: "bold",
            width: "20%",
          }}
        >
          {"Export ⬆️"}
        </button>
      )}
    </div>
  );
};

export default App;
