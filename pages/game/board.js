import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function GameBoard() {
  const router = useRouter();
  const { country, language, teamA, teamB } = router.query;

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!country) return;
    fetchCategories();
  }, [country]);

  const fetchCategories = async () => {
    const snap = await getDocs(collection(db, "categories"));
    const data = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(c => c.active && c.countries?.includes(country));

    setCategories(data);
    setLoading(false);
  };

  if (!country) return <p>جاري التحميل...</p>;
  if (loading) return <p>تحميل لوحة اللعب...</p>;

  return (
    <div style={{ padding: 40 }}>
      <h1>🎮 لوحة اللعب</h1>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 30 }}>
        <div>🔵 {teamA}</div>
        <div>🔴 {teamB}</div>
      </div>

      <h3>الأقسام</h3>

      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        {categories.map(c => (
          <div
            key={c.id}
            style={{
              padding: "20px 30px",
              borderRadius: 12,
              background: "#2563eb",
              color: "white",
              fontSize: 18,
              cursor: "pointer"
            }}
          >
            {c.name?.[language] || c.name?.ar}
          </div>
        ))}
      </div>
    </div>
  );
}