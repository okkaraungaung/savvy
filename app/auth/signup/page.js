"use client";

import { useState } from "react";
import Link from "next/link";
import { FiMail, FiLock, FiUser, FiCheckCircle } from "react-icons/fi";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const supabase = createClient();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.name,
        },
      },
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    setMessage("Account created.");
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase.from("profiles").upsert([
        {
          id: user.id,
          current_group_id: null,
        },
      ]);
    }
    router.push("/auth/login");
  }

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <div className="auth-card auth-card-theme">
          <div className="auth-brand-top">
            <img src="/logotran.png" alt="Savvy Logo" className="auth-logo" />
            <span className="auth-brand-name">Savvy</span>
          </div>

          <div className="auth-header">
            <h1>Create account</h1>
            <p>
              Start tracking your wealth journey with a clean and simple
              dashboard.
            </p>
          </div>

          <form className="auth-form-theme" onSubmit={handleSubmit}>
            <div className="auth-input-wrap">
              <label>Full Name</label>
              <div className="auth-input-box">
                <span className="auth-input-icon">
                  <FiUser />
                </span>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="auth-input-wrap">
              <label>Email Address</label>
              <div className="auth-input-box">
                <span className="auth-input-icon">
                  <FiMail />
                </span>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="auth-input-wrap">
              <label>Password</label>
              <div className="auth-input-box">
                <span className="auth-input-icon">
                  <FiLock />
                </span>
                <input
                  type="password"
                  name="password"
                  placeholder="Create password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="auth-input-wrap">
              <label>Confirm Password</label>
              <div className="auth-input-box">
                <span className="auth-input-icon">
                  <FiCheckCircle />
                </span>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>

          {message ? <p className="auth-footer-text">{message}</p> : null}

          <p className="auth-footer-text">
            Already have an account? <Link href="/auth/login">Login here</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
