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

export default function CategoriesAdmin() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [languages, setLanguages] = useState([]);

  // form
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState({});
  const [iconUrl, setIconUrl] = useState("");

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
    const [catSnap, langSnap] = await Promise.all([
      getDocs(collection(db, "categories")),
      getDocs(collection(db, "languages"))
    ]);

    setCategories(catSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLanguages(langSnap.docs.map(d => d.data()).filter(l => l.active));
  };

  const resetForm = () => {
    setEditId(null);
    setName({});
    setIconUrl("");
  };

  const saveCategory = async () => {
    if (Object.keys(name).length === 0) {
      alert("اكتب اسم القسم");
      return;
    }

    const payload = {
      name,
      icon: iconUrl || null,
      active: true
    };

    if (editId) {
      await updateDoc(doc(db, "categories", editId), payload);
    } else {
      await addDoc(collection(db, "categories"), payload);
    }

    resetForm();
    fetchAll();
  };

  const toggleActive = async (id, current) => {
    await updateDoc(doc(db, "categories", id), {
      active: !current
    });
    fetchAll();
  };

  const deleteCategory = async (id) => {
    if (!confirm("متأكد تبي تحذف القسم؟")) return;

    await deleteDoc(doc(db, "categories", id));
    fetchAll();
  };

  const startEdit = (cat) => {
    setEditId(cat.id);
    setName(cat.name || {});
    setIconUrl(cat.icon || "");
  };

  if (loading) return <p>جاري التحميل...</p>;

  return (
    <div style={{ padding: 40 }}>
      <h1>إدارة الأقسام</h1>

      {/* FORM */}
      <h3>{editId ? "✏️ تعديل قسم" : "➕ إضافة قسم"}</h3>

      {languages.map(l => (
        <input
          key={l.code}
          placeholder={`اسم القسم (${l.code})`}
          value={name[l.code] || ""}
          onChange={e =>
            setName(prev => ({ ...prev, [l.code]: e.target.value }))
          }
        />
      ))}

      <br /><br />

      <input
        placeholder="رابط أيقونة القسم (اختياري)"
        value={iconUrl}
        onChange={e => setIconUrl(e.target.value)}
      />

      <br /><br />

      <button onClick={saveCategory}>
        {editId ? "💾 حفظ التعديل" : "➕ إضافة القسم"}
      </button>

      {editId && (
        <button onClick={resetForm} style={{ marginLeft: 10 }}>
          ❌ إلغاء
        </button>
      )}

      <hr />

      {/* LIST */}
      <h3>الأقسام
