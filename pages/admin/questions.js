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
  const [tab, setTab] = useState("form"); // form | all | byCategory

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

  // UX helpers
  const [bulkMode, setBulkMode] = useState(false);
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
    setList(
      list.includes(value)
        ? list.filter(v => v !== value)
        : [...list, value]
    );
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

  const filteredQuestions = questions.filter(q =>
    Object.values(q.question || {}).join(" ").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <p>جاري التحميل...</p>;

  return (
    <div style={{ padding: 40 }}>
      <h1>إدارة الأسئلة</h1>

      {/* Tabs */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setTab("form")}>➕ إضافة / تعديل</button>{" "}
        <button onClick={() => setTab("all")}>🔍 كل الأسئلة</button>{" "}
        <button onClick={() => setTab("byCategory")}>📂 حسب القسم</button>
      </div>

      {/* ================= FORM TAB ================= */}
      {tab === "form" && (
        <>
          <label style={{ display: "block", marginBottom: 15 }}>
            <input
              type="checkbox"
              checked={bulkMode}
              onChange={() => setBulkMode(!bulkMode)}
            />{" "}
            🔁 إضافة عدة أسئلة بنفس الإعدادات
          </label>

          {/* CATEGORY CARDS */}
          <strong>القسم:</strong>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", margin: "10px 0" }}>
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

          {/* COUNTRY CARDS */}
          <strong>الدول:</strong>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", margin: "10px 0" }}>
            {countries.map(c => (
              <div
                key={c.code}
                onClick={() => toggle(c.code, selectedCountries, setSelectedCountries)}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  cursor: "pointer",
                  background: selectedCountries.includes(c.code) ? "#f59e0b" : "#e5e7eb",
                  color: selectedCountries.includes(c.code) ? "white" : "black"
                }}
              >
                {c.name.ar}
              </div>
            ))}
          </div>

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
        </>
      )}

      {/* ================= ALL QUESTIONS TAB ================= */}
      {tab === "all" && (
        <>
          <input
            placeholder="🔍 بحث عن سؤال"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <hr />
          {filteredQuestions.map(q => (
            <div key={q.id}>
              <strong>{q.question?.ar}</strong> ({q.difficulty})
              <button onClick={() => deleteQuestion(q.id)}>🗑</button>
            </div>
          ))}
        </>
      )}

      {/* ================= BY CATEGORY TAB ================= */}
      {tab === "byCategory" && (
        <>
          <div style={{ marginBottom: 15 }}>
            {categories.map(c => (
              <button
                key={c.id}
                onClick={() => setFilterCategory(c.id)}
                style={{
                  marginRight: 8,
                  background: filterCategory === c.id ? "#3b82f6" : "#e5e7eb",
                  color: filterCategory === c.id ? "white" : "black",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: 6
                }}
              >
                {c.name.ar}
              </button>
            ))}
          </div>

          {questions
            .filter(q => q.categoryId === filterCategory)
            .map(q => (
              <div key={q.id}>
                <strong>{q.question?.ar}</strong> ({q.difficulty})
                <button onClick={() => deleteQuestion(q.id)}>🗑</button>
              </div>
            ))}
        </>
      )}
    </div>
  );
}
