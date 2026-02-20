import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useRouter } from "next/router";

export default function GameSetup() {
  const router = useRouter();

  const [countries, setCountries] = useState([]);
  const [languages, setLanguages] = useState([]);

  const [country, setCountry] = useState("");
  const [language, setLanguage] = useState("");
  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");

  useEffect(() => {
    fetchSetupData();
  }, []);

  const fetchSetupData = async () => {
    const countrySnap = await getDocs(collection(db, "countries"));
    const langSnap = await getDocs(collection(db, "languages"));

    setCountries(countrySnap.docs.map(d => d.data()).filter(c => c.active));
    setLanguages(langSnap.docs.map(d => d.data()).filter(l => l.active));
  };

  const startGame = () => {
    if (!country || !language || !teamA || !teamB) {
      alert("عبّ كل البيانات");
      return;
    }

    router.push({
      pathname: "/game/board",
      query: {
        country,
        language,
        teamA,
        teamB
      }
    });
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>🎮 بدء اللعبة</h1>

      <strong>اختر الدولة:</strong>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", margin: "10px 0" }}>
        {countries.map(c => (
          <div
            key={c.code}
            onClick={() => setCountry(c.code)}
            style={{
              padding: "10px 16px",
              borderRadius: 8,
              cursor: "pointer",
              background: country === c.code ? "#2563eb" : "#e5e7eb",
              color: country === c.code ? "white" : "black"
            }}
          >
            {c.name.ar}
          </div>
        ))}
      </div>

      <strong>اختر اللغة:</strong>
      <div style={{ display: "flex", gap: 10, margin: "10px 0" }}>
        {languages.map(l => (
          <div
            key={l.code}
            onClick={() => setLanguage(l.code)}
            style={{
              padding: "10px 16px",
              borderRadius: 8,
              cursor: "pointer",
              background: language === l.code ? "#16a34a" : "#e5e7eb",
              color: language === l.code ? "white" : "black"
            }}
          >
            {l.name}
          </div>
        ))}
      </div>

      <hr />

      <input
        placeholder="اسم الفريق الأول"
        value={teamA}
        onChange={e => setTeamA(e.target.value)}
      />
      <br /><br />
      <input
        placeholder="اسم الفريق الثاني"
        value={teamB}
        onChange={e => setTeamB(e.target.value)}
      />

      <br /><br />
      <button onClick={startGame} style={{ padding: "12px 24px", fontSize: 16 }}>
        ▶️ ابدأ اللعبة
      </button>
    </div>
  );
}