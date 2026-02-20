import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useRouter } from "next/router";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/admin");
    } catch (err) {
      setError("الإيميل أو كلمة المرور غير صحيحة");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#0f172a",
      color: "white",
      fontFamily: "sans-serif"
    }}>
      <form
        onSubmit={handleLogin}
        style={{
          backgroundColor: "#1e293b",
          padding: 30,
          borderRadius: 12,
          width: 320
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: 20 }}>
          دخول الأدمن
        </h2>

        {error && (
          <p style={{ color: "#f87171", marginBottom: 10 }}>
            {error}
          </p>
        )}

        <input
          type="email"
          placeholder="الإيميل"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 10,
            borderRadius: 8,
            border: "none"
          }}
        />

        <input
          type="password"
          placeholder="كلمة المرور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 20,
            borderRadius: 8,
            border: "none"
          }}
        />

        <button
          type="submit"
          style={{
            width: "100%",
            padding: 12,
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 16
          }}
        >
          تسجيل الدخول
        </button>
      </form>
    </div>
  );
}