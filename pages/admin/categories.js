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

  // form state
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
    if (!name || Object.keys(name).length === 0) {
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

  const deleteCategory = async (id
