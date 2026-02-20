import { useEffect, useState } from "react";
import { collection, addDoc, getDocs, updateDoc, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../lib/firebase";
import { useRouter } from "next/router";

export default function LanguagesAdmin() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [languages, setLanguages] = useState([]);

  const [code, setCode] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/admin/login");
      } else {
        setLoading(false);
        fetchLanguages();
      }
    });
    return () => unsub();
  }, []);

  const fetchLanguages = async () => {
    const snapshot = await getDocs(collection(db, "languages"));
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setLanguages(data);
  };

  const addLanguage = async () => {
    if (!code || !name) {
      alert("الرجاء تعبئة جميع الحقول");
      return;
    }

    // منع التكرار
    const exists = languages.find(
      l => l.code.toLowerCase() === code.toLowerCase()
    );
    if (exists) {
      alert("هذه اللغة مضافة مسبقًا");
      return;
    }

    await addDoc(collection(db, "languages"), {
      code: code.toLowerCase(),
      name,
      active: true
    });

    setCode("");
    setName("");
    fetchLanguages();
  };

  const toggleActive = async (id, current) => {
    await updateDoc(doc(db, "languages", id), {
      active: !current
    });
    fetchLanguages();
  };

  if (loading) return <p>جاري التحميل...</p>;

  return (
    <div style={{ padding: 40 }}>
      <h1>إدارة اللغات</h1>

      <h3>إضافة لغة جديدة</h3>
      <input
        placeholder="كود اللغة (مثال: ar)"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <br /><br />
      <input
        placeholder="اسم اللغة"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <br /><br />
      <button onClick={addLanguage}>➕ إضافة اللغة</button>

      <hr style={{ margin: "30px 0" }} />

      <h3>اللغات الحالية</h3>
      {languages.length === 0 && <p>لا توجد لغات بعد</p>}

      {languages.map(lang => (
        <div key={lang.id} style={{ marginBottom: 10 }}>
          <strong>{lang.code}</strong> – {lang.name}
          {" "}
          {lang.active ? "🟢" : "🔴"}
          <button
            onClick={() => toggleActive(lang.id, lang.active)}
            style={{ marginLeft: 10 }}
          >
            تغيير الحالة
          </button>
        </div>
      ))}
    </div>
  );
}
