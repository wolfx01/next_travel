"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from "../styles/auth.module.css";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (username.length < 3) {
      setError("Username must be at least 3 characters long.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
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
          <h1>Welcome Back!</h1>
          <p>Already have an account?</p>
          <button type="button" onClick={() => router.push('/login')}>Login</button>
        </div>
        <div className={styles.singup}>
          <h1>Register</h1>
          <input 
            type="text" 
            placeholder="Username" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required 
            minLength={3}
          />
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
            minLength={8}
          />
          {error && <div id="error-message" style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
          <div className={styles.dbutton}><input type="submit" value="Register" id="submit" className={styles.submitBtn} /></div>
        </div>
      </form>
    </main>
  );
}
