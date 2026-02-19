import { useState, useEffect } from "react";
import questions from "../questions/armenia_questions.json";

export default function Home() {
  const [selectedSections, setSelectedSections] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentQuestions, setCurrentQuestions] = useState({});
  const [teamA, setTeamA] = useState(0);
  const [teamB, setTeamB] = useState(0);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [timer, setTimer] = useState(0);
  const [usedOptions, setUsedOptions] = useState({
    flip: false,
    x2: false,
    friendCall: false,
    swapQuestion: false,
    doubleAnswer: false
  });
  const [usedValues, setUsedValues] = useState({});
  const [winner, setWinner] = useState(null);

  const sections = [...new Set(questions.map(q => q.section))];

  // اختيار قسم
  const toggleSection = section => {
    if (selectedSections.includes(section)) {
      setSelectedSections(selectedSections.filter(s => s !== section));
    } else if (selectedSections.length < 8) {
      setSelectedSections([...selectedSections, section]);
    } else {
      alert("يمكنك اختيار حتى 8 أقسام فقط");
    }
  };

  // بدء اللعبة
  const startGame = () => {
    if (selectedSections.length < 4) {
      alert("اختر على الأقل 4 أقسام للبدء!");
      return;
    }
    setGameStarted(true);
    // تجهيز الأسئلة لكل قسم
    const tempQuestions = {};
    selectedSections.forEach(sec => {
      tempQuestions[sec] = questions.filter(q => q.section === sec);
    });
    setCurrentQuestions(tempQuestions);
    // تهيئة usedValues
    const tempUsed = {};
    selectedSections.forEach(sec => {
      tempUsed[sec] = [];
    });
    setUsedValues(tempUsed);
  };

  // اختيار قيمة السؤال من القسم
  const selectQuestionValue = (section, value) => {
    if (usedValues[section].includes(value)) return;

    const q = currentQuestions[section].find(q => q.difficulty === value);
    if (!q) return;

    setSelectedQuestion({ ...q, section });
    setTimer(40); // مؤقت 40 ثانية تلقائي
    setUsedValues(prev => ({
      ...prev,
      [section]: [...prev[section], value]
    }));
  };

  // عداد الوقت
  useEffect(() => {
    if (selectedQuestion && timer > 0) {
      const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [selectedQuestion, timer]);

  // تسجيل الفريق الذي أجاب
  const markCorrect = team => {
    let points = selectedQuestion.difficulty;
    if (usedOptions.x2) points *= 2;

    if (team === "A") setTeamA(prev => prev + points);
    else if (team === "B") setTeamB(prev => prev + points);

    setSelectedQuestion(null);
