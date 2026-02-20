import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function ChooseCategories() {
  const router = useRouter();
  const { country, language, teamA, teamB } = router.query;

  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState([]);
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

  const toggleCategory = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(c => c !== id));
    } else {
      if (selected.length >= 8) return;
      setSelected([...selected, id]);
    }
  };

  const next = () => {
    if (selected.length < 4) return;

    router.push({
      pathname: "/game/board",
      query: {
        country,
        language,
        teamA,
        teamB,
        categories: selected.join(",")
      }
    });
  };

  if (loading) return <p>تحميل الأقسام...</p>;

  return (
    <div style={{ padding: 40 }}>
      <h1>📂 اختر الأقسام</h1>

      <p style={{ fontSize: 18 }}>
        عدد الأقسام المختارة:
        <strong> {selected.length} / 8</strong>
      </p>

      <div style={{ display: "flex", gap: 15, flexWrap: "wrap" }}>
        {categories.map(c => {
          const active = selected.includes(c.id);
          return (
            <div
              key={c.id}
              onClick={() => toggleCategory(c.id)}
              style={{
                padding: "18px 26px",
                borderRadius: 12,
                cursor: "pointer",
                background: active ? "#16a34a" : "#e5e7eb",
                color: active ? "white" : "black",
                fontSize: 18
              }}
            >
              {c.name?.[language] || c.name?.ar}
            </div>
          );
        })}
      </div>

      <br />

      <button
        onClick={next}
        disabled={selected.length < 4}
        style={{
          padding: "14px 30px",
          fontSize: 18,
          cursor: selected.length < 4 ? "not-allowed" : "pointer",
          opacity: selected.length < 4 ? 0.5 : 1
        }}
      >
        ▶️ التالي
      </button>

      {selected.length < 4 && (
        <p style={{ color: "red", marginTop: 10 }}>
          لازم تختار 4 أقسام على الأقل
        </p>
      )}
    </div>
  );
}
