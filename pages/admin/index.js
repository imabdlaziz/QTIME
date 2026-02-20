import { useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useRouter } from "next/router";

export default function Admin() {
  const router = useRouter();

  useEffect(() => {
    onAuthStateChanged(auth, user => {
      if (!user) router.push("/admin/login");
    });
  }, [router]);

  return (
    <div style={{ padding: 40 }}>
      <h1>لوحة تحكم الأدمن</h1>
      <button onClick={() => signOut(auth)}>تسجيل خروج</button>
    </div>
  );
}