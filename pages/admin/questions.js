import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../lib/firebase";
import { useRouter } from "next/router";

export default function QuestionsAdmin() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState([]);
  const [countries, setCountries] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [questions, setQuestions] = useState([]);

  const [categoryId, setCategoryId] = useState("");
  const [difficulty, setDifficulty] = useState(200);
  const [selectedCountries, setSelectedCountries] = useState([]);

  const [questionText, setQuestionText] = useState({});
  const [answerText, setAnswerText] = useState({});

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/admin/login");
      } else {
        fetchAll();
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const fetchAll = async () => {
    const [catSnap, countrySnap, langSnap, qSnap] = await Promise.all([
      getDocs(collection(db, "categories")),
      getDocs(collection(db, "countries")),
      getDocs(collection(db, "languages")),
      getDocs(collection(db, "questions"))
    ]);

    setCategories(catSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(c => c.active));
    setCountries(countrySnap.docs.map(d => d.data()).filter(c => c.active));
    setLanguages(langSnap.docs.map(d => d.data()).filter(l => l.active));
    setQuestions(qSnap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const toggle = (value, list, setList) => {
    setList(
      list.includes(value)
        ? list.filter(v => v !== value)
        : [...list, value]
    );
  };

  const addQuestion = async () => {
    if (!categoryId || selectedCountries.length === 0) {
      alert("اختر القسم والدولة");
      return;
    }

    await addDoc(collection(db, "questions"), {
      categoryId,
      difficulty,
      countries: selectedCountries,
      question: questionText,
      answer: answerText,
      active: true
    });

    setQuestionText({});
    setAnswerText({});
    setSelectedCountries([]);
    fetchAll();
  };

  const toggleActive = async (id, current) => {
    await updateDoc(doc(db, "questions", id), {
      active: !current
    });
    fetchAll();
  };

  if (loading) return <p>جاري التحميل...</p>;

  return (
    <div style={{ padding: 40 }}>
      <h1>إدارة الأسئلة</h1>

      <h3>إضافة سؤال جديد</h3>

      <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
        <option value="">اختر القسم</option>
        {categories.map(c => (
          <option key={c.id} value={c.id}>{c.name.ar}</option>
        ))}
      </select>

      <br /><br />

      <select value={difficulty} onChange={(e) => setDifficulty(Number(e.target.value))}>
        <option value={200}>200</option>
        <option value={400}>400</option>
        <option value={600}>600</option>
      </select>

      <br /><br />

      <strong>الدول:</strong><br />
      {countries.map(c => (
        <label key={c.code} style={{ marginRight: 10 }}>
          <input
            type="checkbox"
            checked={selectedCountries.includes(c.code)}
            onChange={() => toggle(c.code, selectedCountries, setSelectedCountries)}
          />{" "}
          {c.name.ar}
        </label>
      ))}

      <br /><br />

      <strong>نص السؤال:</strong>
      {languages.map(l => (
        <div key={l.code}>
          <input
            placeholder={`السؤال (${l.code})`}
            onChange={(e) =>
              setQuestionText(prev => ({ ...prev, [l.code]: e.target.value }))
            }
          />
        </div>
      ))}

      <br />

      <strong>الجواب:</strong>
      {languages.map(l => (
        <div key={l.code}>
          <input
            placeholder={`الجواب (${l.code})`}
            onChange={(e) =>
              setAnswerText(prev => ({ ...prev, [l.code]: e.target.value }))
            }
          />
        </div>
      ))}

      <br />
      <button onClick={addQuestion}>➕ إضافة السؤال</button>

      <hr style={{ margin: "30px 0" }} />

      <h3>الأسئلة الحالية</h3>
      {questions.map(q => (
        <div key={q.id} style={{ marginBottom: 10 }}>
          <strong>{q.question?.ar || "—"}</strong>
          {" "}({q.difficulty})
          {" "}— {q.active ? "🟢" : "🔴"}
          <button
            onClick={() => toggleActive(q.id, q.active)}
            style={{ marginLeft: 10 }}
          >
            تغيير الحالة
          </button>
        </div>
      ))}
    </div>
  );
}