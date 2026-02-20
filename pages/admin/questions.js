import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../lib/firebase";
import { useRouter } from "next/router";

export default function QuestionsAdmin() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("form");

  const [categories, setCategories] = useState([]);
  const [countries, setCountries] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [questions, setQuestions] = useState([]);

  // form
  const [editId, setEditId] = useState(null);
  const [categoryId, setCategoryId] = useState("");
  const [difficulty, setDifficulty] = useState(200);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [questionText, setQuestionText] = useState({});
  const [answerText, setAnswerText] = useState({});
  const [mediaType, setMediaType] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");

  // bulk add
  const [bulkMode, setBulkMode] = useState(false);

  // filters
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) router.push("/admin/login");
      else {
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
    setList(list.includes(value) ? list.filter(v => v !== value) : [...list, value]);
  };

  const resetForm = (keepFixed = false) => {
    setEditId(null);
    if (!keepFixed) {
      setCategoryId("");
      setDifficulty(200);
      setSelectedCountries([]);
    }
    setQuestionText({});
    setAnswerText({});
    setMediaType("");
    setMediaUrl("");
  };

  const saveQuestion = async () => {
    if (!categoryId || selectedCountries.length === 0) {
      alert("اختر القسم والدولة");
      return;
    }

    const payload = {
      categoryId,
      difficulty,
      countries: selectedCountries,
      question: questionText,
      answer: answerText,
      media: mediaType && mediaUrl ? { type: mediaType, url: mediaUrl } : null,
      active: true
    };

    if (editId) {
      await updateDoc(doc(db, "questions", editId), payload);
    } else {
      await addDoc(collection(db, "questions"), payload);
    }

    resetForm(bulkMode);
    fetchAll();
  };

  const deleteQuestion = async (id) => {
    if (confirm("متأكد تبي تحذف السؤال؟")) {
      await deleteDoc(doc(db, "questions", id));
      fetchAll();
    }
  };

  if (loading) return <p>جاري التحميل...</p>;

  return (
    <div style={{ padding: 40 }}>
      <h1>إدارة الأسئلة</h1>

      {/* Bulk Mode */}
      <label style={{ display: "block", marginBottom: 15 }}>
        <input
          type="checkbox"
          checked={bulkMode}
          onChange={() => setBulkMode(!bulkMode)}
        />{" "}
        🔁 إضافة عدة أسئلة بنفس القسم والقيمة والدولة
      </label>

      {/* CATEGORY CARDS */}
      <strong>القسم:</strong>
      <div style={{ display: "flex", gap: 10, margin: "10px 0" }}>
        {categories.map(c => (
          <div
            key={c.id}
            onClick={() => setCategoryId(c.id)}
            style={{
              padding: "10px 16px",
              borderRadius: 8,
              cursor: "pointer",
              background: categoryId === c.id ? "#2563eb" : "#e5e7eb",
              color: categoryId === c.id ? "white" : "black"
            }}
          >
            {c.name.ar}
          </div>
        ))}
      </div>

      {/* DIFFICULTY CARDS */}
      <strong>قيمة السؤال:</strong>
      <div style={{ display: "flex", gap: 12, margin: "10px 0" }}>
        {[200, 400, 600].map(val => (
          <div
            key={val}
            onClick={() => setDifficulty(val)}
            style={{
              padding: "14px 20px",
              borderRadius: 10,
              cursor: "pointer",
              fontWeight: "bold",
              background: difficulty === val ? "#16a34a" : "#e5e7eb",
              color: difficulty === val ? "white" : "black"
            }}
          >
            {val}
          </div>
        ))}
      </div>

      {/* COUNTRIES */}
      <strong>الدول:</strong><br />
      {countries.map(c => (
        <label key={c.code} style={{ marginRight: 10 }}>
          <input
            type="checkbox"
            checked={selectedCountries.includes(c.code)}
            onChange={() => toggle(c.code, selectedCountries, setSelectedCountries)}
          /> {c.name.ar}
        </label>
      ))}

      <hr />

      {/* QUESTION TEXT */}
      <strong>السؤال:</strong>
      {languages.map(l => (
        <input
          key={l.code}
          placeholder={`السؤال (${l.code})`}
          value={questionText[l.code] || ""}
          onChange={e =>
            setQuestionText(prev => ({ ...prev, [l.code]: e.target.value }))
          }
        />
      ))}

      <br /><br />

      {/* ANSWER */}
      <strong>الجواب:</strong>
      {languages.map(l => (
        <input
          key={l.code}
          placeholder={`الجواب (${l.code})`}
          value={answerText[l.code] || ""}
          onChange={e =>
            setAnswerText(prev => ({ ...prev, [l.code]: e.target.value }))
          }
        />
      ))}

      <br /><br />

      {/* MEDIA */}
      <strong>مرفق (اختياري):</strong><br />
      <select value={mediaType} onChange={e => setMediaType(e.target.value)}>
        <option value="">بدون</option>
        <option value="image">صورة</option>
        <option value="video">فيديو</option>
      </select>

      {mediaType && (
        <>
          <br />
          <input
            placeholder="رابط الصورة أو الفيديو"
            value={mediaUrl}
            onChange={e => setMediaUrl(e.target.value)}
          />
        </>
      )}

      <br /><br />

      <button onClick={saveQuestion}>💾 حفظ السؤال</button>

      <hr />

      {/* QUESTIONS LIST */}
      <h3>الأسئلة الحالية</h3>
      {questions.map(q => (
        <div key={q.id}>
          <strong>{q.question?.ar}</strong> ({q.difficulty})
          <button onClick={() => deleteQuestion(q.id)}>🗑</button>
        </div>
      ))}
    </div>
  );
}
