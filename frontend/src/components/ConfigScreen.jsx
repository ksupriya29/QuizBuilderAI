import { useState } from "react"
import axios from "axios"

const DIFFICULTIES = ["Simple", "Medium", "Complex"]

export default function ConfigScreen({ parsedData, onGenerated }) {
  const [numQuestions, setNumQuestions] = useState(10)
  const [difficulty, setDifficulty] = useState("Medium")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const generate = async () => {
    setLoading(true); setError("")
    try {
      const slideText = parsedData.slides.map(s => `Slide ${s.slide}: ${s.text}`).join("\n\n")
      const res = await axios.post("http://localhost:5000/generate", {
        slide_text: slideText,
        num_questions: numQuestions,
        difficulty
      })
      onGenerated(res.data.questions, { numQuestions, difficulty })
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to generate. Check your API key."
      setError(msg)
    }
    setLoading(false)
  }

  return (
    <div className="screen">
      <div className="card">
        <div style={{ background: "#0f172a", borderRadius: 8, padding: "12px 16px", marginBottom: 28, color: "#94a3b8", fontSize: 14 }}>
          📄 {parsedData?.slide_count} slides loaded
        </div>

        <label style={{ fontWeight: 700, fontSize: 15 }}>Number of questions</label>
        <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "12px 0 4px" }}>
          <input type="range" min={5} max={30} value={numQuestions}
            onChange={e => setNumQuestions(Number(e.target.value))}
            style={{ flex: 1, accentColor: "#f59e0b" }} />
          <span style={{ color: "#f59e0b", fontWeight: 700, fontSize: 20 }}>{numQuestions}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b", fontSize: 12, marginBottom: 28 }}>
          <span>min 5</span><span>max 30</span>
        </div>

        <label style={{ fontWeight: 700, fontSize: 15 }}>Difficulty level</label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, margin: "12px 0 24px" }}>
          {DIFFICULTIES.map(d => (
            <button key={d} onClick={() => setDifficulty(d)} style={{
              padding: "14px 0", borderRadius: 10, border: "none",
              fontWeight: 700, fontSize: 15, cursor: "pointer",
              background: difficulty === d ? "#f59e0b" : "#334155",
              color: difficulty === d ? "#0f172a" : "#94a3b8"
            }}>{d}</button>
          ))}
        </div>

        {error && <p className="error-msg">⚠️ {error}</p>}

        {loading ? (
          <div style={{ textAlign: "center" }}>
            <div className="spinner" />
            <p style={{ color: "#94a3b8" }}>AI is building your quiz...</p>
          </div>
        ) : (
          <button className="btn-primary" onClick={generate}>⚡ Generate Quiz</button>
        )}
      </div>
    </div>
  )
}