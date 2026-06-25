export default function ResultsScreen({ questions, userAnswers, config, onRetake, onReset }) {
  const { answers, saved } = userAnswers
  const correct = questions.filter((q, i) => answers[i] === q.correct).length
  const total = questions.length
  const pct = Math.round((correct / total) * 100)
  const wrong = total - correct
  const unanswered = answers.filter(a => a === null).length
  const savedCount = saved ? saved.filter(s => s).length : 0
  const savedCorrect = saved ? questions.filter((q, i) => saved[i] && answers[i] === q.correct).length : 0

  const getGrade = () => {
    if (pct >= 90) return { emoji: "🏆", text: "Outstanding!", color: "#f59e0b" }
    if (pct >= 80) return { emoji: "🎉", text: "Excellent!", color: "#10b981" }
    if (pct >= 60) return { emoji: "💪", text: "Good effort!", color: "#3b82f6" }
    if (pct >= 40) return { emoji: "📚", text: "Keep practicing!", color: "#f97316" }
    return { emoji: "🔄", text: "Need more review!", color: "#f87171" }
  }
  const grade = getGrade()

  return (
    <div className="screen">
      <div className="card">
        {/* Score Hero */}
        <div style={{
          textAlign: "center", marginBottom: 28,
          background: "linear-gradient(135deg, #1e293b, #0f172a)",
          borderRadius: 16, padding: "28px 20px",
          border: "1px solid #334155"
        }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>{grade.emoji}</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: grade.color, marginBottom: 4 }}>{grade.text}</h2>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, margin: "16px 0" }}>
            <div style={{ position: "relative", width: 100, height: 100, flexShrink: 0 }}>
              <svg width="100" height="100" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="50" cy="50" r="42" fill="none" stroke="#334155" strokeWidth="8" />
                <circle cx="50" cy="50" r="42" fill="none" stroke={grade.color} strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - pct / 100)}`}
                  strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }} />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 22, fontWeight: 800 }}>{correct}/{total}</span>
                <span style={{ fontSize: 12, color: grade.color, fontWeight: 700 }}>{pct}%</span>
              </div>
            </div>
            <div style={{ textAlign: "left" }}>
              <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 8 }}>
                {config.difficulty} difficulty · {total} questions
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ background: "#064e3b", color: "#10b981", padding: "3px 12px", borderRadius: 99, fontSize: 12, fontWeight: 700, display: "inline-block", width: "fit-content" }}>
                  ✓ {correct} correct
                </span>
                <span style={{ background: "#450a0a", color: "#f87171", padding: "3px 12px", borderRadius: 99, fontSize: 12, fontWeight: 700, display: "inline-block", width: "fit-content" }}>
                  ✗ {wrong} wrong
                </span>
                {unanswered > 0 && (
                  <span style={{ background: "#451a03", color: "#fb923c", padding: "3px 12px", borderRadius: 99, fontSize: 12, fontWeight: 700, display: "inline-block", width: "fit-content" }}>
                    ⏭ {unanswered} unanswered
                  </span>
                )}
                {savedCount > 0 && (
                  <span style={{ background: "#3b0764", color: "#a78bfa", padding: "3px 12px", borderRadius: 99, fontSize: 12, fontWeight: 700, display: "inline-block", width: "fit-content" }}>
                    ★ {savedCorrect}/{savedCount} saved correct
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Review */}
        <p style={{ color: "#f59e0b", fontWeight: 700, fontSize: 13, marginBottom: 14 }}>
          📋 DETAILED REVIEW & AI FEEDBACK
        </p>

        {questions.map((q, i) => {
          const isCorrect = answers[i] === q.correct
          const isSaved = saved ? saved[i] : false
          const isUnanswered = answers[i] === null
          let borderColor = "#334155"
          let bgColor = "transparent"
          let icon = "❓"
          let statusText = "Not answered"

          if (isCorrect) {
            borderColor = "#10b981"
            bgColor = "#064e3b22"
            icon = "✅"
            statusText = "Correct"
          } else if (isUnanswered) {
            borderColor = "#fb923c"
            bgColor = "#451a0322"
            icon = "⏭"
            statusText = "Skipped"
          } else {
            borderColor = "#f87171"
            bgColor = "#450a0a22"
            icon = "❌"
            statusText = "Wrong"
          }

          return (
            <div key={i} style={{
              border: `1px solid ${borderColor}`,
              borderRadius: 10, padding: "16px 18px", marginBottom: 12,
              background: bgColor,
              borderLeft: `4px solid ${borderColor}`
            }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ fontSize: 18, flexShrink: 0, marginTop: 2 }}>{icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <p style={{ fontWeight: 700, fontSize: 14 }}>Q{i + 1} · {q.question}</p>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      {isSaved && <span style={{ color: "#a78bfa", fontSize: 12 }}>★ Saved</span>}
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
                        background: isCorrect ? "#064e3b" : isUnanswered ? "#451a03" : "#450a0a",
                        color: isCorrect ? "#10b981" : isUnanswered ? "#fb923c" : "#f87171"
                      }}>{statusText}</span>
                    </div>
                  </div>

                  {/* Show correct answer always */}
                  <p style={{ color: "#10b981", fontSize: 13, marginBottom: 6 }}>
                    Correct answer: <strong>{q.correct}</strong> — {q.options[q.correct]}
                  </p>

                  {!isCorrect && (
                    <p style={{ color: isUnanswered ? "#fb923c" : "#f87171", fontSize: 13, marginBottom: 8 }}>
                      Your answer: {answers[i] ? `${answers[i]} — ${q.options[answers[i]]}` : "Not answered"}
                    </p>
                  )}

                  {/* AI Explanations */}
                  {q.explanations && (
                    <div style={{ marginTop: 8 }}>
                      {!isCorrect && answers[i] && q.explanations[answers[i]] && (
                        <div style={{
                          background: "#1e293b", borderRadius: 8, padding: "10px 14px", marginBottom: 8,
                          fontSize: 13, color: "#f87171", display: "flex", gap: 8, borderLeft: "3px solid #f87171"
                        }}>
                          <span style={{ flexShrink: 0 }}>🤖</span>
                          <span><strong>Why your answer is wrong:</strong> {q.explanations[answers[i]]}</span>
                        </div>
                      )}
                      {/* Show explanations for all wrong options */}
                      <div style={{
                        background: "#0f172a", borderRadius: 8, padding: "10px 14px",
                        fontSize: 12, color: "#94a3b8"
                      }}>
                        <p style={{ fontWeight: 600, marginBottom: 6, color: "#f59e0b", fontSize: 11 }}>
                          WHY OTHER OPTIONS ARE WRONG:
                        </p>
                        {Object.entries(q.explanations).map(([opt, exp]) => (
                          <div key={opt} style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                            <span style={{
                              width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              background: opt === q.correct ? "#064e3b" : "#334155",
                              color: opt === q.correct ? "#10b981" : "#94a3b8",
                              fontSize: 10, fontWeight: 700
                            }}>{opt}</span>
                            <span>{exp}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <button className="btn-primary" style={{ background: "#f59e0b" }} onClick={onRetake}>
            🔄 Retake Quiz
          </button>
          <button className="btn-secondary" onClick={onReset}>
            ↑ Upload New PPT
          </button>
        </div>
      </div>
    </div>
  )
}