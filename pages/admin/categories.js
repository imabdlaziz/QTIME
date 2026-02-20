import { useEffect, useState } from "react";
import { collection, addDoc, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useRouter } from "next/router";

export default function CategoriesAdmin() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [countries, setCountries] = useState("");

  // حماية الصفحة
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/admin/login");
      } else {
        fetchCategories();
        setLoading(false);
      }
    });
  }, []);

  const fetchCategories = async () => {
    const snapshot = await getDocs(collection(db, "categories"));
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setCategories(data);
  };

  const addCategory = async () => {
    if (!nameAr || !nameEn) {
      alert("الرجاء تعبئة أسماء القسم");
      return;
    }

    await addDoc(collection(db, "categories"), {
      name: {
        ar: nameAr,
        en: nameEn
      },
      countries: countries.split(",").map(c => c.trim()),
      active: true
    });

    setNameAr("");
    setNameEn("");
    setCountries("");
    fetchCategories();
  };

  const toggleActive = async (id, current) => {
    await updateDoc(doc(db, "categories", id), {
      active: !current
    });
    fetchCategories();
  };

  if (loading) return <p>جاري التحميل...</p>;

  return (
    <div style={{ padding: 40 }}>
      <h1>إدارة الأقسام</h1>

      <h3>إضافة قسم جديد</h3>
      <input
        placeholder="اسم القسم بالعربي"
        value={nameAr}
        onChange={e => setNameAr(e.target.value)}
      />
      <br /><br />
      <input
        placeholder="اسم القسم بالإنجليزي"
        value={nameEn}
        onChange={e => setNameEn(e.target.value)}
      />
      <br /><br />
      <input
        placeholder="الدول (مثال: KW,SA)"
        value={countries}
        onChange={e => setCountries(e.target.value)}
      />
      <br /><br />
      <button onClick={addCategory}>➕ إضافة</button>

      <hr style={{ margin: "30px 0" }} />

      <h3>الأقسام الحالية</h3>
      {categories.map(cat => (
        <div key={cat.id} style={{ marginBottom: 10 }}>
          <strong>{cat.name.ar}</strong> ({cat.name.en})  
          — دول: {cat.countries?.join(", ")}  
          — الحالة: {cat.active ? "🟢 مفعل" : "🔴 مخفي"}
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