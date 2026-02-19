import { useState } from "react";
import questions from "../questions/armenia_questions.json";

export default function Home() {
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [teamA, setTeamA] = useState(0);
  const [teamB, setTeamB] = useState(0);

  const sections = [...new Set(questions.map(q => q.section))];

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#0f172a",
      color: "white",
      padding: "40px",
      fontFamily: "sans-serif"
    }}>

      <h1 style={{ textAlign: "center", marginBottom: "40px" }}>
        🔥 QTIME
      </h1>

      {!selectedQuestion && (
        <>
          <div style={{ display: "flex", gap: "20px", justifyContent: "center" }}>
            {sections.map(section => (
              <div key={section}>
                <h2>{section}</h2>
                {[200, 400, 600].map(value => {
                  const q = questions.find(
                    item => item.section === section && item.difficulty === value
                  );
                  return (
                    <button
                      key={value}
                      onClick={() => setSelectedQuestion(q)}
                      style={{
                        display: "block",
                        margin: "10px 0",
                        padding: "10px 20px",
                        fontSize: "18px",
                        cursor: "pointer"
                      }}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <div style={{ marginTop: "50px", textAlign: "center" }}>
            <h2>النقاط</h2>
            <p>الفريق الأول: {teamA}</p>
            <p>الفريق الثاني: {teamB}</p>
          </div>
        </>
      )}

      {selectedQuestion && (
        <div style={{ textAlign: "center" }}>
          <h2>{selectedQuestion.question.ar}</h2>

          <button
            onClick={() => setTeamA(teamA + selectedQuestion.difficulty)}
            style={{ margin: "20px" }}
          >
            الفريق الأول صح
          </button>

          <button
            onClick={() => setTeamB(teamB + selectedQuestion.difficulty)}
            style={{ margin: "20px" }}
          >
            الفريق الثاني صح
          </button>

          <br />

          <button
            onClick={() => setSelectedQuestion(null)}
            style={{ marginTop: "20px" }}
          >
            رجوع
          </button>
        </div>
      )}
    </div>
  );
}
