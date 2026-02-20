import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function GameBoard() {
  const router = useRouter();
  const { country, language, teamA, teamB, categories } = router.query;

  const [cats, setCats] = useState([]);
  const [usedCards, setUsedCards] = useState({}); // category_value => true
  const [usedQuestions, setUsedQuestions] = useState({}); // questionId => true
  const [loading, setLoading] = useState(true);

  // Question modal
  const [showQuestion, setShowQuestion] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentValue, setCurrentValue] = useState(null);
  const [currentCategory, setCurrentCategory] = useState(null);

  useEffect(() => {
    if (!categories) return;
    fetchCategories();
  }, [categories]);

  const fetchCategories = async () => {
    const ids = categories.split(",");
    const snap = await getDocs(collection(db, "categories"));
    const data = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(c => ids.includes(c.id));

    setCats(data);
    setLoading(false);
  };

  const openQuestion = async (categoryId, value) => {
    const cardKey = `${categoryId}_${value}`;
    if (usedCards[cardKey]) return;

    // جلب أسئلة مناسبة
    const q = query(
      collection(db, "questions"),
      where("active", "==", true),
      where("categoryId", "==", categoryId),
      where("difficulty", "==", value),
      where("countries", "array-contains", country)
    );

    const snap = await getDocs(q);
    const pool = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(q => !usedQuestions[q.id]);

    if (pool.length === 0) {
      alert("ما في أسئلة متبقية بهالمستوى");
      return;
    }

    // اختيار سؤال عشوائي
    const picked = pool[Math.floor(Math.random() * pool.length)];

    setUsedCards(prev => ({ ...prev, [cardKey]: true }));
    setUsedQuestions(prev => ({ ...prev, [picked.id]: true }));

    setCurrentCategory(categoryId);
    setCurrentValue(value);
    setCurrentQuestion(picked);
    setShowQuestion(true);
  };

  const closeQuestion = () => {
    setShowQuestion(false);
    setCurrentQuestion(null);
    setCurrentCategory(null);
    setCurrentValue(null);
  };

  if (loading) return <p>تحميل لوحة اللعب...</p>;

  return (
    <div style={{ padding: 40 }}>
      <h1>🎮 لوحة اللعب</h1>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 30 }}>
        <div style={{ fontSize: 20 }}>🔵 {teamA}</div>
        <div style={{ fontSize: 20 }}>🔴 {teamB}</div>
      </div>

      {/* BOARD */}
      {cats.map(c => (
        <div key={c.id} style={{ marginBottom: 25 }}>
          <h3>{c.name?.[language] || c.name?.ar}</h3>

          <div style={{ display: "flex", gap: 15 }}>
            {[200, 400, 600].map(val => {
              const key = `${c.id}_${val}`;
              const disabled = usedCards[key];

              return (
                <div
                  key={val}
                  onClick={() => openQuestion(c.id, val)}
                  style={{
                    padding: "16px 28px",
                    borderRadius: 10,
                    cursor: disabled ? "not-allowed" : "pointer",
                    background: disabled ? "#9ca3af" : "#2563eb",
                    color: "white",
                    fontSize: 18,
                    opacity: disabled ? 0.5 : 1
                  }}
                >
                  {val}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* QUESTION MODAL */}
      {showQuestion && currentQuestion && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <div
            style={{
              background: "white",
              padding: 30,
              borderRadius: 12,
              maxWidth: 700,
              width: "90%"
            }}
          >
            <h2>
              {currentQuestion.question?.[language] ||
                currentQuestion.question?.ar}
            </h2>

            {/* Media */}
            {currentQuestion.media?.type === "image" && (
              <img
                src={currentQuestion.media.url}
                alt="question"
                style={{ maxWidth: "100%", marginTop: 15 }}
              />
            )}

            {currentQuestion.media?.type === "video" && (
              <video
                src={currentQuestion.media.url}
                controls
                style={{ maxWidth: "100%", marginTop: 15 }}
              />
            )}

            <hr />

            <button
              onClick={closeQuestion}
              style={{ padding: "10px 20px", fontSize: 16 }}
            >
              إغلاق السؤال
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
