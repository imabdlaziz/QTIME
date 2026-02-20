import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function GameBoard() {
  const router = useRouter();
  const { country, language, teamA, teamB, categories } = router.query;

  const [cats, setCats] = useState([]);
  const [used, setUsed] = useState({}); // categoryId_value => true
  const [loading, setLoading] = useState(true);

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

  const selectQuestion = (categoryId, value) => {
    const key = `${categoryId}_${value}`;
    if (used[key]) return;

    setUsed(prev => ({ ...prev, [key]: true }));

    alert(`سؤال من قسم ${categoryId} بقيمة ${value}`);
    // المرحلة الجاية: نجيب السؤال الحقيقي ونفتحه
  };

  if (loading) return <p>تحميل لوحة اللعب...</p>;

  return (
    <div style={{ padding: 40 }}>
      <h1>🎮 لوحة اللعب</h1>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 30 }}>
        <div style={{ fontSize: 20 }}>🔵 {teamA}</div>
        <div style={{ fontSize: 20 }}>🔴 {teamB}</div>
      </div>

      {cats.map(c => (
        <div key={c.id} style={{ marginBottom: 25 }}>
          <h3>{c.name?.[language] || c.name?.ar}</h3>

          <div style={{ display: "flex", gap: 15 }}>
            {[200, 400, 600].map(val => {
              const key = `${c.id}_${val}`;
              const disabled = used[key];

              return (
                <div
                  key={val}
                  onClick={() => selectQuestion(c.id, val)}
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
    </div>
  );
}
