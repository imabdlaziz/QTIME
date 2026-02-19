import { useState, useEffect } from "react";
import questions from "../questions/armenia_questions.json";

export default function Home() {
  // 🔹 حالات اللعبة
  const [selectedSections, setSelectedSections] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentQuestions, setCurrentQuestions] = useState({});
  const [teamA, setTeamA] = useState(0);
  const [teamB, setTeamB] = useState(0);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [timer, setTimer] = useState(0);
  const [winner, setWinner] = useState(null);
  const [usedValues, setUsedValues] = useState({});
  const [optionsUsed, setOptionsUsed] = useState({
    flip: false,
    doublePoints: false,
    rest: false,
    friendCall: false,
    doubleAnswer: false
  });
  const [restActive, setRestActive] = useState(false); // لمنع الفريق الثاني

  const sections = [...new Set(questions.map(q => q.section))];

  // 🔹 اختيار الأقسام
  const toggleSection = sec => {
    if (selectedSections.includes(sec)) {
      setSelectedSections(selectedSections.filter(s => s !== sec));
    } else if (selectedSections.length < 8) {
      setSelectedSections([...selectedSections, sec]);
    } else {
      alert("يمكنك اختيار حتى 8 أقسام فقط");
    }
  };

  // 🔹 بدء اللعبة
  const startGame = () => {
    if (selectedSections.length < 4) {
      alert("اختر على الأقل 4 أقسام للبدء!");
      return;
    }
    setGameStarted(true);
    const tempQuestions = {};
    selectedSections.forEach(sec => {
      tempQuestions[sec] = questions.filter(q => q.section === sec);
    });
    setCurrentQuestions(tempQuestions);

    // تهيئة usedValues لكل قسم
    const tempUsed = {};
    selectedSections.forEach(sec => {
      tempUsed[sec] = [];
    });
    setUsedValues(tempUsed);
  };

  // 🔹 اختيار سؤال من قيمة معينة
  const selectQuestionValue = (section, value) => {
    if (usedValues[section].includes(value)) return;

    const q = currentQuestions[section].find(q => q.difficulty === value);
    if (!q) return;

    setSelectedQuestion({ ...q, section });
    setTimer(40); // مؤقت تلقائي
    setUsedValues(prev => ({
      ...prev,
      [section]: [...prev[section], value]
    }));
  };

  // 🔹 المؤقت
  useEffect(() => {
    if (selectedQuestion && timer > 0) {
      const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [selectedQuestion, timer]);

  // 🔹 استخدام خيارات اللعب قبل السؤال
  const useOptionBeforeQuestion = option => {
    if (optionsUsed[option]) return;
    setOptionsUsed(prev => ({ ...prev, [option]: true }));

    switch (option) {
      case "flip":
        alert("ميزة Flip مفعّلة: النقاط ستضرب ×3 وتُخصم من الفريق الثاني إذا نجحتم!");
        break;
      case "doublePoints":
        alert("ميزة Double Points مفعّلة: النقاط ستتضاعف للفريق الذي أجاب!");
        break;
      case "rest":
        alert("ميزة Rest مفعّلة: الفريق الثاني يفقد 2 فرصة للإجابة على هذا السؤال");
        setRestActive(true);
        break;
      default:
        break;
    }
  };

  // 🔹 استخدام خيارات بعد اختيار السؤال
  const useOptionAfterQuestion = option => {
    if (optionsUsed[option]) return;
    setOptionsUsed(prev => ({ ...prev, [option]: true }));

    switch (option) {
      case "friendCall":
        setTimer(40); // 40 ثانية للشخص الذي اتصل به
        alert("اتصال بصديق: اعطه السؤال وسيجيب خلال 40 ثانية!");
        break;
      case "doubleAnswer":
        alert("ميزة Double Answer مفعّلة: الفريق يمكنه إعطاء إجابتين لهذا السؤال!");
        break;
      default:
        break;
    }
  };

  // 🔹 تسجيل الفريق الذي أجاب
  const markCorrect = team => {
    if (!selectedQuestion) return;
    let points = selectedQuestion.difficulty;

    if (optionsUsed.doublePoints) points *= 2;
    if (optionsUsed.flip) points *= 3; // يمكن تعديل خصم الفريق الآخر لاحقاً

    if (team === "A") setTeamA(prev => prev + points);
    else if (team === "B" && !restActive) setTeamB(prev => prev + points);

    setSelectedQuestion(null);
    setRestActive(false);

    // التحقق إذا انتهت كل الأسئلة
    let allDone = true;
    for (let sec of selectedSections) {
      if (usedValues[sec].length < 3) {
        allDone = false;
        break;
      }
    }
    if (allDone) {
      if (teamA > teamB) setWinner("الفريق الأول");
      else if (teamB > teamA) setWinner("الفريق الثاني");
      else setWinner("تعادل");
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0f172a", color: "white", padding: 20, fontFamily: "sans-serif" }}>
      <h1 style={{ textAlign: "center", marginBottom: 30 }}>🔥 QTIME</h1>

      {/* اختيار الأقسام */}
      {!gameStarted && !winner && (
        <>
          <h2>اختر الأقسام للعب (4–8 أقسام)</h2>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {sections.map(sec => (
              <button
                key={sec}
                onClick={() => toggleSection(sec)}
                style={{
                  padding: 10,
                  backgroundColor: selectedSections.includes(sec) ? "#4ade80" : "#1e293b",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  minWidth: 100
                }}
              >
                {sec}
              </button>
            ))}
          </div>

          <h3>خيارات قبل اختيار السؤال:</h3>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {["flip", "doublePoints", "rest"].map(opt => (
              <button
                key={opt}
                onClick={() => useOptionBeforeQuestion(opt)}
                disabled={optionsUsed[opt]}
                style={{ padding: 10, backgroundColor: "#3b82f6", color: "white", border: "none", cursor: "pointer" }}
              >
                {opt.replace(/([A-Z])/g, " $1")}
              </button>
            ))}
          </div>

          <button
            onClick={startGame}
            style={{ marginTop: 20, padding: 10, fontSize: 18, cursor: "pointer" }}
          >
            ابدأ اللعبة
          </button>
        </>
      )}

      {/* عرض الأقسام داخل اللعبة */}
      {gameStarted && !selectedQuestion && !winner && (
        <>
          <h2>الأسئلة حسب الأقسام</h2>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            {selectedSections.map(sec => (
              <div key={sec} style={{ backgroundColor: "#1e293b", padding: 20, borderRadius: 15 }}>
                <h3 style={{ textAlign: "center" }}>{sec}</h3>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
                  {[200, 400, 600].map(val => (
                    <button
                      key={val}
                      disabled={usedValues[sec].includes(val)}
                      onClick={() => selectQuestionValue(sec, val)}
                      style={{
                        padding: 10,
                        minWidth: 60,
                        backgroundColor: usedValues[sec].includes(val) ? "#64748b" : "#3b82f6",
                        color: "white",
                        border: "none",
                        cursor: "pointer"
                      }}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 30 }}>
            <h2>النقاط</h2>
            <p>الفريق الأول: {teamA}</p>
            <p>الفريق الثاني: {teamB}</p>
          </div>
        </>
      )}

      {/* عرض السؤال + خيارات بعد اختيار السؤال */}
      {selectedQuestion && (
        <div style={{ textAlign: "center" }}>
          <h2>{selectedQuestion.question.ar}</h2>
          <p>⏱ الوقت المتبقي: {timer} ثانية</p>

          <h3>خيارات بعد اختيار السؤال:</h3>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {["friendCall", "doubleAnswer"].map(opt => (
              <button
                key={opt}
                onClick={() => useOptionAfterQuestion(opt)}
                disabled={optionsUsed[opt]}
                style={{ padding: 10, backgroundColor: "#facc15", color: "black", border: "none", cursor: "pointer" }}
              >
                {opt.replace(/([A-Z])/g, " $1")}
              </button>
            ))}
          </div>

          <div style={{ marginTop: 20 }}>
            <button onClick={() => markCorrect("A")} style={{ margin: 10, padding: 10 }}>الفريق الأول صح</button>
            <button onClick={() => markCorrect("B")} style={{ margin: 10, padding: 10 }}>الفريق الثاني صح</button>
            <button onClick={() => markCorrect(null)} style={{ margin: 10, padding: 10 }}>لا أحد</button>
          </div>
        </div>
      )}

      {/* شاشة الفائز */}
      {winner && (
        <div style={{ textAlign: "center", marginTop: 50 }}>
          <h1>🏆 الفائز: {winner} 🏆</h1>
          <p>الفريق الأول: {teamA} نقاط</p>
          <p>الفريق الثاني: {teamB} نقاط</p>
        </div>
      )}
    </div>
  );
}
