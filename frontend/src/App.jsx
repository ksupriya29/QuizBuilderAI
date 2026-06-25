import { useState } from "react"
import "./index.css"
import UploadScreen from "./components/UploadScreen"
import SlideSelection from "./components/SlideSelection"
import ConfigScreen from "./components/ConfigScreen"
import QuizScreen from "./components/QuizScreen"
import ResultsScreen from "./components/ResultsScreen"

export default function App() {
  const [screen, setScreen] = useState("upload")
  const [parsedData, setParsedData] = useState(null)
  const [questions, setQuestions] = useState([])
  const [userAnswers, setUserAnswers] = useState({ answers: [], saved: [] })
  const [config, setConfig] = useState({ numQuestions: 10, difficulty: "Medium" })

  const stepMap = {
    upload: "Step 1 of 4",
    slides: "Step 2 of 4",
    config: "Step 3 of 4",
    quiz: "Quiz",
    results: "Complete"
  }

  return (
    <div>
      <header className="app-header">
        <h1>🎯 AI Quiz Generator</h1>
        <span className="step-label">{stepMap[screen]}</span>
      </header>

      {screen === "upload" && (
        <UploadScreen onContinue={(data) => { setParsedData(data); setScreen("slides") }} />
      )}
      {screen === "slides" && (
        <SlideSelection
          parsedData={parsedData}
          onContinue={(filteredData) => { setParsedData(filteredData); setScreen("config") }}
        />
      )}
      {screen === "config" && (
        <ConfigScreen
          parsedData={parsedData}
          onGenerated={(qs, cfg) => { setQuestions(qs); setConfig(cfg); setScreen("quiz") }}
        />
      )}
      {screen === "quiz" && (
        <QuizScreen
          questions={questions}
          onFinish={(result) => { setUserAnswers(result); setScreen("results") }}
        />
      )}
      {screen === "results" && (
        <ResultsScreen
          questions={questions}
          userAnswers={userAnswers}
          config={config}
          onRetake={() => { setUserAnswers({ answers: [], saved: [] }); setScreen("quiz") }}
          onReset={() => { setParsedData(null); setQuestions([]); setUserAnswers({ answers: [], saved: [] }); setScreen("upload") }}
        />
      )}
    </div>
  )
}