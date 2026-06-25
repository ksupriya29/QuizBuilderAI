import { useState, useRef } from "react"
import axios from "axios"

const FILE_ICONS = {
  ".pptx": "📊",
  ".ppt":  "📊",
  ".docx": "📝",
  ".doc":  "📝",
  ".pdf":  "📄",
  ".txt":  "📃",
  ".csv":  "📋",
  ".xlsx": "📗",
}

const FILE_ACCEPT = ".pptx,.ppt,.docx,.doc,.pdf,.txt,.csv,.xlsx"

const FILE_HINT = ".pptx, .ppt, .docx, .doc, .pdf, .txt, .csv, .xlsx"

export default function UploadScreen({ onContinue }) {
  const [file, setFile] = useState(null)
  const [parsed, setParsed] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef()

  const handleFile = async (f) => {
    setError(""); setParsed(null)
    if (!f) return

    const ext = "." + f.name.split(".").pop().toLowerCase()
    if (!FILE_ACCEPT.includes(ext)) {
      setError(`Unsupported file type. Accepted: ${FILE_HINT}`)
      return
    }
    if (f.size > 50 * 1024 * 1024) {
      setError("File too large. Max 50MB.")
      return
    }

    setFile(f); setLoading(true)
    try {
      const form = new FormData()
      form.append("file", f)
      const res = await axios.post("http://localhost:5000/parse", form)
      setParsed(res.data)
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to parse file. Make sure backend is running."
      setError(msg)
    }
    setLoading(false)
  }

  const fileIcon = file ? (FILE_ICONS["." + file.name.split(".").pop().toLowerCase()] || "📄") : "📂"

  return (
    <div className="screen">
      <div className="card">
        <div
          onClick={() => inputRef.current.click()}
          onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          style={{
            border: `2px dashed ${dragging ? "#f59e0b" : "#475569"}`,
            borderRadius: 12, padding: "48px 24px",
            textAlign: "center", cursor: "pointer",
            background: dragging ? "#1e3a5f22" : "transparent"
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>{fileIcon}</div>
          <p style={{ fontWeight: 700, fontSize: 18 }}>Drag & drop your file here</p>
          <p style={{ color: "#94a3b8", fontSize: 13, marginTop: 6 }}>
            or click to browse · {FILE_HINT} · max 50MB
          </p>
          <input
            ref={inputRef}
            type="file"
            accept={FILE_ACCEPT}
            style={{ display: "none" }}
            onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
          />
        </div>

        {error && <p className="error-msg">⚠️ {error}</p>}
        {loading && <div className="spinner" />}

        {parsed && (
          <div className="success-badge">
            <span style={{ fontSize: 24 }}>✅</span>
            <div>
              <p style={{ fontWeight: 700 }}>{file.name}</p>
              <p style={{ color: "#94a3b8", fontSize: 13 }}>
                {parsed.file_type} · {parsed.slide_count} sections · {parsed.word_count} words extracted
              </p>
            </div>
            <span style={{ marginLeft: "auto", color: "#10b981", fontWeight: 700 }}>✓ Ready</span>
          </div>
        )}

        <div style={{ marginTop: 24 }}>
          <button className="btn-primary" disabled={!parsed} onClick={() => onContinue(parsed)}>
            Continue →
          </button>
        </div>
      </div>
    </div>
  )
}