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

  const resetForm = () => {
    setEditId(null);
    setCategoryId("");
    setDifficulty(200);
    setSelectedCountries([]);
    setQuestionText({});
    setAnswerText({});
    setMediaType("");
    setMediaUrl("");
    setTab("form");
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

    resetForm();
    fetchAll();
  };

  const toggleActive = async (id, current) => {
    await updateDoc(doc(db, "questions", id), { active: !current });
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
        <button onClick={() => setTab("all")}>📚 كل الأسئلة</button>{" "}
        <button onClick={() => setTab("byCategory")}>📂 حسب القسم</button>
      </div>

      {/* FORM */}
      {tab === "form" && (
        <>
          <h3>{editId ? "✏️ تعديل سؤال" : "➕ إضافة سؤال"}</h3>

          <select value={categoryId} onChange={e => setCategoryId(e.target.value)}>
            <option value="">اختر القسم</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name.ar}</option>
            ))}
          </select>

          <br /><br />

          {/* 🎯 Difficulty Cards */}
          <strong>قيمة السؤال:</strong>
          <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
            {[200, 400, 600].map(val => (
              <div
                key={val}
                onClick={() => setDifficulty(val)}
                style={{
                  padding: "16px 24px",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontWeight: "bold",
                  background: difficulty === val ? "#3b82f6" : "#e5e7eb",
                  color: difficulty === val ? "white" : "black"
                }}
              >
                {val}
              </div>
            ))}
          </div>

          <br />

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

          <br /><br />

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

          <strong>مرفق السؤال (اختياري):</strong><br />
          <select value={mediaType} onChange={e => setMediaType(e.target.value)}>
            <option value="">بدون</option>
            <option value="image">صورة</option>
            <option value="video">فيديو</option>
          </select>

          {mediaType && (
            <>
              <br /><br />
              <input
                placeholder="رابط الصورة أو الفيديو"
                value={mediaUrl}
                onChange={e => setMediaUrl(e.target.value)}
              />
            </>
          )}

          <br /><br />

          <button onClick={saveQuestion}>
            {editId ? "💾 حفظ التعديل" : "➕ إضافة"}
          </button>
          {editId && <button onClick={resetForm}>❌ إلغاء</button>}
        </>
      )}

      {/* ALL QUESTIONS */}
      {tab === "all" && (
        <>
          <h3>📚 كل الأسئلة</h3>
          <input
            placeholder="🔍 بحث"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          <hr />

          {filteredQuestions.map(q => (
            <div key={q.id}>
              <strong>{q.question?.ar}</strong> ({q.difficulty})
              <button onClick={() => {
                setEditId(q.id);
                setCategoryId(q.categoryId);
                setDifficulty(q.difficulty);
                setSelectedCountries(q.countries);
                setQuestionText(q.question || {});
                setAnswerText(q.answer || {});
                setMediaType(q.media?.type || "");
                setMediaUrl(q.media?.url || "");
                setTab("form");
              }}>✏️</button>
              <button onClick={() => toggleActive(q.id, q.active)}>👁</button>
              <button onClick={() => deleteQuestion(q.id)}>🗑</button>
            </div>
          ))}
        </>
      )}

      {/* BY CATEGORY */}
      {tab === "byCategory" && (
        <>
          <h3>📂 الأسئلة حسب القسم</h3>

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
                <button onClick={() => {
                  setEditId(q.id);
                  setCategoryId(q.categoryId);
                  setDifficulty(q.difficulty);
                  setSelectedCountries(q.countries);
                  setQuestionText(q.question || {});
                  setAnswerText(q.answer || {});
                  setMediaType(q.media?.type || "");
                  setMediaUrl(q.media?.url || "");
                  setTab("form");
                }}>✏️</button>
                <button onClick={() => deleteQuestion(q.id)}>🗑</button>
              </div>
            ))}
        </>
      )}
    </div>
  );
}
