import { useState } from "react"

export default function SlideSelection({ parsedData, onContinue }) {
  const [selectedSlides, setSelectedSlides] = useState(
    parsedData.slides.map(s => s.slide)
  )

  const toggleSlide = (slideNum) => {
    setSelectedSlides(prev =>
      prev.includes(slideNum)
        ? prev.filter(s => s !== slideNum)
        : [...prev, slideNum]
    )
  }

  const selectAll = () => setSelectedSlides(parsedData.slides.map(s => s.slide))
  const deselectAll = () => setSelectedSlides([])

  const filteredSlides = parsedData.slides.filter(s => selectedSlides.includes(s.slide))
  const totalWords = filteredSlides.reduce((sum, s) => sum + s.text.split(" ").length, 0)

  return (
    <div className="screen">
      <div className="card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800 }}>📋 Select Slides</h2>
            <p style={{ color: "#94a3b8", fontSize: 13, marginTop: 4 }}>
              {parsedData.slide_count} slides · {parsedData.word_count} words total
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={selectAll} style={{
              background: "#334155", border: "none", color: "#f1f5f9",
              padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer"
            }}>Select All</button>
            <button onClick={deselectAll} style={{
              background: "#334155", border: "none", color: "#f1f5f9",
              padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer"
            }}>Clear</button>
          </div>
        </div>

        <div style={{ background: "#0f172a", borderRadius: 12, padding: "4px 0", marginBottom: 20 }}>
          {parsedData.slides.map((slide, i) => {
            const isSelected = selectedSlides.includes(slide.slide)
            return (
              <div key={slide.slide} onClick={() => toggleSlide(slide.slide)} style={{
                display: "flex", alignItems: "flex-start", gap: 14,
                padding: "14px 18px", cursor: "pointer", transition: "all 0.15s",
                borderBottom: i < parsedData.slides.length - 1 ? "1px solid #1e293b" : "none",
                opacity: isSelected ? 1 : 0.4,
                background: isSelected ? "#1e3a5f22" : "transparent"
              }}>
                <div style={{
                  width: 24, height: 24, borderRadius: 6, flexShrink: 0, marginTop: 1,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: isSelected ? "#10b981" : "#334155",
                  color: "#fff", fontSize: 13, fontWeight: 700,
                  transition: "all 0.15s"
                }}>
                  {isSelected ? "✓" : ""}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
                    Slide {slide.slide}
                  </p>
                  <p style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {slide.text}
                  </p>
                </div>
                <span style={{ color: "#64748b", fontSize: 11, flexShrink: 0 }}>
                  {slide.text.split(" ").length} words
                </span>
              </div>
            )
          })}
        </div>

        {selectedSlides.length === 0 && (
          <p style={{ color: "#f87171", fontSize: 13, textAlign: "center", marginBottom: 16 }}>
            ⚠️ Please select at least one slide
          </p>
        )}

        <div style={{
          background: "linear-gradient(135deg, #1e293b, #0f172a)", border: "1px solid #334155",
          borderRadius: 10, padding: "14px 18px", marginBottom: 20,
          display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <span style={{ color: "#94a3b8", fontSize: 13 }}>
            Selected: <strong style={{ color: "#f59e0b" }}>{selectedSlides.length}</strong> of {parsedData.slides.length} slides
          </span>
          <span style={{ color: "#94a3b8", fontSize: 13 }}>
            Words: <strong style={{ color: "#10b981" }}>{totalWords}</strong>
          </span>
        </div>

        <button className="btn-primary" disabled={selectedSlides.length === 0}
          onClick={() => onContinue({
            ...parsedData,
            slides: filteredSlides,
            slide_count: filteredSlides.length,
            word_count: totalWords
          })}>
          Continue with {selectedSlides.length} slides →
        </button>
      </div>
    </div>
  )
}