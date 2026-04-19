"use client";

import { useState } from "react";
import Link from "next/link";
import { FiMail, FiLock } from "react-icons/fi";

export default function LoginPage() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        remember: false,
    });

    function handleChange(e) {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    }

    function handleSubmit(e) {
        e.preventDefault();
        console.log("Login data:", formData);
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
                        <h1>Welcome back</h1>
                        <p>Login to manage your assets, savings goals, and transactions.</p>
                    </div>

                    <form className="auth-form-theme" onSubmit={handleSubmit}>
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
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="auth-row-theme">
                            <label className="auth-check-theme">
                                <input
                                    type="checkbox"
                                    name="remember"
                                    checked={formData.remember}
                                    onChange={handleChange}
                                />
                                <span>Remember me</span>
                            </label>

                            <Link href="/forgot-password" className="auth-text-link">
                                Forgot Password?
                            </Link>
                        </div>

                        <button type="submit" className="auth-submit-btn">
                            Login
                        </button>
                    </form>

                    <p className="auth-footer-text">
                        Don&apos;t have an account? <Link href="/signup">Sign up here</Link>
                    </p>
                </div>
            </div>
        </main>
    );
}