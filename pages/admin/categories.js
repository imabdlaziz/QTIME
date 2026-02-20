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

export default function CategoriesAdmin() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState([]);
  const [countries, setCountries] = useState([]);
  const [languages, setLanguages] = useState([]);

  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);

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
    const [catsSnap, countriesSnap, langsSnap] = await Promise.all([
      getDocs(collection(db, "categories")),
      getDocs(collection(db, "countries")),
      getDocs(collection(db, "languages"))
    ]);

    setCategories(catsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    setCountries(
      countriesSnap.docs
        .map(d => d.data())
        .filter(c => c.active)
    );
    setLanguages(
      langsSnap.docs
        .map(d => d.data())
        .filter(l => l.active)
    );
  };

  const toggle = (value, list, setList) => {
    setList(
      list.includes(value)
        ? list.filter(v => v !== value)
        : [...list, value]
    );
  };

  const addCategory = async () => {
    if (!nameAr || !nameEn || selectedCountries.length === 0 || selectedLanguages.length === 0) {
      alert("الرجاء تعبئة كل الحقول واختيار دولة ولغة على الأقل");
      return;
    }

    await addDoc(collection(db, "categories"), {
      name: { ar: nameAr, en: nameEn },
      countries: selectedCountries,
      languages: selectedLanguages,
      active: true
    });

    setNameAr("");
    setNameEn("");
    setSelectedCountries([]);
    setSelectedLanguages([]);
    fetchAll();
  };

  const toggleActive = async (id, current) => {
    await updateDoc(doc(db, "categories", id), { active: !current });
    fetchAll();
  };

  if (loading) return <p>جاري التحميل...</p>;

  return (
    <div style={{ padding: 40 }}>
      <h1>إدارة الأقسام</h1>

      <h3>إضافة قسم جديد</h3>

      <input
        placeholder="اسم القسم بالعربي"
        value={nameAr}
        onChange={(e) => setNameAr(e.target.value)}
      />
      <br /><br />

      <input
        placeholder="اسم القسم بالإنجليزي"
        value={nameEn}
        onChange={(e) => setNameEn(e.target.value)}
      />
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
      <strong>اللغات:</strong><br />
      {languages.map(l => (
        <label key={l.code} style={{ marginRight: 10 }}>
          <input
            type="checkbox"
            checked={selectedLanguages.includes(l.code)}
            onChange={() => toggle(l.code, selectedLanguages, setSelectedLanguages)}
          />{" "}
          {l.name}
        </label>
      ))}

      <br /><br />
      <button onClick={addCategory}>➕ إضافة القسم</button>

      <hr style={{ margin: "30px 0" }} />

      <h3>الأقسام الحالية</h3>
      {categories.map(cat => (
        <div key={cat.id} style={{ marginBottom: 10 }}>
          <strong>{cat.name.ar}</strong> ({cat.name.en})
          {" "}— دول: {cat.countries.join(", ")}
          {" "}— لغات: {cat.languages.join(", ")}
          {" "}— {cat.active ? "🟢" : "🔴"}
          <button
            onClick={() => toggleActive(cat.id, cat.active)}
            style={{ marginLeft: 10 }}
          >
            تغيير الحالة
          </button>
        </div>
      ))}
    </div>
  );
}
