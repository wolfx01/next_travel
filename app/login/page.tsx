"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// We'll import the CSS module-ish or just global if unique enough.
// Original path: style/login/log.css. I'll assume we copy it to globals or app/styles.
import styles from "../styles/auth.module.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('userName', data.userName);
        window.location.href = "/";
      } else {
        setError(data.message || "An error occurred");
      }
    } catch (err) {
      setError("Failed to connect to server");
    }
  };

  return (
    <main className={styles.authContainer}>
      <form onSubmit={handleSubmit} className={styles.authForm}>
        <div className={styles.kool}>
          <h1>Hello, Welcome!</h1>
          <p>Don&apos;t have an account?</p>
          <button type="button" onClick={() => router.push('/register')}>Register</button>
        </div>
        <div className={styles.singup}>
          <h1>Log In</h1>
          <input 
            type="email" 
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
          {error && <div id="error-message" style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
          <div className={styles.dbutton}><input type="submit" value="Login" id="submit" className={styles.submitBtn} /></div>
        </div>
      </form>
    </main>
  );
}
