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
  const [name, setName] = useState({}); // { ar: "", en: "" }
  const [iconUrl, setIconUrl] = useState("");

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
    const [catSnap, langSnap] = await Promise.all([
      getDocs(collection(db, "categories")),
      getDocs(collection(db, "languages
