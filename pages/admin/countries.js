import { useEffect, useState } from "react";
import { collection, addDoc, getDocs, updateDoc, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../lib/firebase";
import { useRouter } from "next/router";

export default function CountriesAdmin() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [countries, setCountries] = useState([]);

  const [code, setCode] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");

  // حماية الصفحة
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/admin/login");
      } else {
        fetchCountries();
        setLoading(false);
      }
    });
  }, []);

  const fetchCountries = async () => {
    const snapshot = await getDocs(collection(db, "countries"));
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setCountries(data);
  };

  const addCountry = async () => {
    if (!code || !nameAr || !nameEn) {
      alert("الرجاء تعبئة جميع الحقول");
      return;
    }

    await addDoc(collection(db, "countries"), {
      code: code.toUpperCase(),
      name: {
        ar: nameAr,
        en: nameEn
      },
      active: true
    });

    setCode("");
    setNameAr("");
    setNameEn("");
    fetchCountries();
  };

  const toggleActive = async (id, current) => {
    await updateDoc(doc(db, "countries", id), {
      active: !current
    });
    fetchCountries();
  };

  if (loading) return <p>جاري التحميل...</p>;

  return (
    <div style={{ padding: 40 }}>
      <h1>إدارة الدول</h1>

      <h3>إضافة دولة جديدة</h3>

      <input
        placeholder="كود الدولة (مثال: KW)"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <br /><br />

      <input
        placeholder="اسم الدولة بالعربي"
        value={nameAr}
        onChange={(e) => setNameAr(e.target.value)}
      />
      <br /><br />

      <input
        placeholder="اسم الدولة بالإنجليزي"
        value={nameEn}
        onChange={(e) => setNameEn(e.target.value)}
      />
      <br /><br />

      <button onClick={addCountry}>➕ إضافة الدولة</button>

      <hr style={{ margin: "30px 0" }} />

      <h3>الدول الحالية</h3>

      {countries.length === 0 && <p>لا توجد دول بعد</p>}

      {countries.map(country => (
        <div key={country.id} style={{ marginBottom: 10 }}>
          <strong>{country.code}</strong> – {country.name.ar} ({country.name.en})
          {" "}
          {country.active ? "🟢" : "🔴"}
          <button
            onClick={() => toggleActive(country.id, country.active)}
            style={{ marginLeft: 10 }}
          >
            تغيير الحالة
          </button>
        </div>
      ))}
    </div>
  );
}