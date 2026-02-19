import { useState, useEffect } from "react";
import questions from "../questions/armenia_questions.json";

export default function Home() {
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [teamA, setTeamA] = useState(0);
  const [teamB, setTeamB] = useState(0);
  const [timer, setTimer] = useState(0);
  const [usedOptions, setUsedOptions] = useState({
    flip: false,
    x2: false,
    friendCall: false,
    swapQuestion: false,
    doubleAnswer: false
  });

  const sections = [...new Set(questions.map(q => q.section))];

  // Start timer when question is selected
  useEffect(() => {
    if (selectedQuestion) {
      setTimer(40); // default 40 seconds
      const interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 0) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [selectedQuestion]);

  const applyOption = (option, team) => {
    if (usedOptions[option]) return;
    setUsedOptions(prev => ({ ...prev, [option]: true }));

    switch (option) {
      case "flip":
        // Flip: النقاط للآخرين
        const points = selectedQuestion.difficulty;
        if (team === "A") setTeamB(prev => prev + points);
        else setTeamA(prev => prev + points);
        break;
      case "x2":
        // ضعّف النقاط
        if (team === "A") setTeamA(prev => prev + selectedQuestion.difficulty);
        else setTeamB(prev => prev + selectedQuestion.difficulty);
        break;
      case "friendCall":
        setTimer(40); // 40 ثانية جديدة عند الاتصال
        break;
      case "swapQuestion":
        // خد السؤال التالي
        const sectionQuestions = questions.filter(q => q.section === selectedQuestion.section);
        const nextQ = sectionQuestions[Math.floor(Math.random() * sectionQuestions.length)];
        setSelectedQuestion(nextQ);
        break;
      case "doubleAnswer":
        // تقدر تعطي إجابتين
        // هذه مجرد علامة، الفريق يستخدمها عند اختيار الإجابات
        alert("ميزة: أجب إجابتين مفعّلة لهذا السؤال!");
        break;
      default:
        break;
    }
  };

  const markCorrect = team => {
    let points = selectedQuestion.difficulty;
    if (usedOptions.x2) points *= 2;

    if (team === "A") setTeamA(prev => prev + points);
    else setTeamB(prev => prev + points);

    setSelectedQuestion(null);
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0f172a", color: "white", padding: 30, fontFamily: "sans-serif" }}>
      <h1 style={{ textAlign: "center", marginBottom: 40 }}>🔥 QTIME</h1>

      {!selectedQuestion && (
        <>
          <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
            {sections.map(section => (
              <div key={section}>
                <h2>{section}</h2>
                {[200, 400, 600].map(value => {
                  const q = questions.find(item => item.section === section && item.difficulty === value);
                  if (!q) return null;
                  return (
                    <button
                      key={value}
                      onClick={() => setSelectedQuestion(q)}
                      style={{ display: "block", margin: 10, padding: 10, fontSize: 18, cursor: "pointer" }}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 50, textAlign: "center" }}>
            <h2>النقاط</h2>
            <p>الفريق الأول: {teamA}</p>
            <p>الفريق الثاني: {teamB}</p>
          </div>
        </>
      )}

      {selectedQuestion && (
        <div style={{ textAlign: "center" }}>
          <h2>{selectedQuestion.question.ar}</h2>
          <p>⏱ الوقت المتبقي: {timer} ثانية</p>

          <div style={{ margin: 20 }}>
            <h3>اختر الخيار للفريق:</h3>
            {Object.keys(usedOptions).map(opt => (
              <button
                key={opt}
                disabled={usedOptions[opt]}
                onClick={() => applyOption(opt, "A")}
                style={{ margin: 5, padding: 10, fontSize: 16 }}
              >
                {opt.replace(/([A-Z])/g, " $1")}
              </button>
            ))}
          </div>

          <div style={{ marginTop: 20 }}>
            <button onClick={() => markCorrect("A")} style={{ margin: 10, padding: 10, fontSize: 16 }}>
              الفريق الأول صح
            </button>
            <button onClick={() => markCorrect("B")} style={{ margin: 10, padding: 10, fontSize: 16 }}>
              الفريق الثاني صح
            </button>
          </div>

          <button onClick={() => setSelectedQuestion(null)} style={{ marginTop: 20, padding: 10 }}>
            رجوع للقائمة
          </button>
        </div>
      )}
    </div>
  );
}
