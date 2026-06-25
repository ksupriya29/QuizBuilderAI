import { useState, useEffect } from "react"

export default function QuizScreen({ questions, onFinish }) {
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState(Array(questions.length).fill(null))
  const [saved, setSaved] = useState(Array(questions.length).fill(false))
  const [timeLeft, setTimeLeft] = useState(questions.length * 60)

  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft(p => {
        if (p <= 1) { clearInterval(t); return 0 }
        return p - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [])

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0")
  const secs = String(timeLeft % 60).padStart(2, "0")
  const q = questions[current]
  const progress = ((current + 1) / questions.length) * 100

  const answeredCount = answers.filter(a => a !== null).length
  const savedCount = saved.filter(s => s).length

  const select = (opt) => {
    const updated = [...answers]
    updated[current] = opt
    setAnswers(updated)
  }

  const toggleSave = () => {
    const updated = [...saved]
    updated[current] = !updated[current]
    setSaved(updated)
  }

  const goToQuestion = (idx) => setCurrent(idx)

  const handleSubmit = () => {
    onFinish({ answers, saved })
  }

  return (
    <div className="screen">
      <div className="card">
        {/* Progress & Timer */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, background: "#334155", borderRadius: 99, height: 8 }}>
            <div style={{ width: `${progress}%`, background: "#10b981", height: 8, borderRadius: 99, transition: "width 0.3s" }} />
          </div>
          <span style={{ background: "#1e293b", border: "1px solid #475569", borderRadius: 8, padding: "4px 12px", fontSize: 14, color: "#f59e0b", fontWeight: 700 }}>
            ⏱ {mins}:{secs}
          </span>
        </div>

        {/* Question Navigator */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20, padding: "10px 0", borderBottom: "1px solid #334155" }}>
          {questions.map((_, i) => {
            const isAnswered = answers[i] !== null
            const isSaved = saved[i]
            const isCurrent = current === i
            let bg = "#334155"
            let label = `${i + 1}`
            if (isCurrent) { bg = "#f59e0b"; label = `▶${i + 1}` }
            else if (isAnswered && isSaved) { bg = "#7c3aed"; label = `★${i + 1}` }
            else if (isAnswered) { bg = "#10b981"; label = `✓${i + 1}` }
            else if (isSaved) { bg = "#7c3aed55"; label = `☆${i + 1}` }
            return (
              <button key={i} onClick={() => goToQuestion(i)} style={{
                width: 36, height: 36, borderRadius: 8, border: isCurrent ? "2px solid #fff" : "none",
                background: bg, color: isCurrent ? "#0f172a" : "#fff",
                fontWeight: 700, fontSize: 12, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s"
              }}>{label}</button>
            )
          })}
        </div>

        {/* Question */}
        <p style={{ color: "#f59e0b", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
          QUESTION {current + 1} OF {questions.length}
        </p>
        <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, lineHeight: 1.5 }}>{q.question}</p>

        {/* Options */}
        {Object.entries(q.options).map(([key, val]) => (
          <div key={key} onClick={() => select(key)} style={{
            display: "flex", alignItems: "center", gap: 14,
            padding: "16px 18px", borderRadius: 10, marginBottom: 10,
            border: `2px solid ${answers[current] === key ? "#f59e0b" : "#334155"}`,
            background: answers[current] === key ? "#f59e0b11" : "#0f172a",
            cursor: "pointer", transition: "all 0.15s"
          }}>
            <span style={{
              width: 32, height: 32, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: 14, flexShrink: 0,
              background: answers[current] === key ? "#f59e0b" : "#334155",
              color: answers[current] === key ? "#0f172a" : "#94a3b8"
            }}>{key}</span>
            <span style={{ fontSize: 15 }}>{val}</span>
            {answers[current] === key && <span style={{ marginLeft: "auto", color: "#f59e0b" }}>✓</span>}
          </div>
        ))}

        {/* Save for Review Button */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
          <button onClick={toggleSave} style={{
            background: "transparent", border: `1px solid ${saved[current] ? "#7c3aed" : "#475569"}`,
            color: saved[current] ? "#a78bfa" : "#94a3b8",
            padding: "8px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s"
          }}>
            {saved[current] ? "★ Saved for Review" : "☆ Save for Review"}
          </button>
        </div>

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20, gap: 12 }}>
          <button className="btn-secondary" disabled={current === 0}
            onClick={() => setCurrent(p => p - 1)}>← Previous</button>
          {current < questions.length - 1 ? (
            <button className="btn-primary" style={{ width: "auto", padding: "12px 28px" }}
              onClick={() => setCurrent(p => p + 1)}>Next →</button>
          ) : (
            <button className="btn-primary" style={{ width: "auto", padding: "12px 28px", background: "#10b981" }}
              onClick={handleSubmit}>Submit ✓</button>
          )}
        </div>

        {/* Stats Bar */}
        <div style={{
          marginTop: 20, padding: "12px 16px", background: "#0f172a", borderRadius: 10,
          display: "flex", justifyContent: "space-around", fontSize: 12, color: "#94a3b8"
        }}>
          <span>📝 <strong style={{ color: "#f1f5f9" }}>{answeredCount}</strong>/{questions.length} answered</span>
          <span>⭐ <strong style={{ color: "#a78bfa" }}>{savedCount}</strong> saved</span>
          <span>❓ <strong style={{ color: "#f87171" }}>{questions.length - answeredCount}</strong> unanswered</span>
        </div>
      </div>
    </div>
  )
}