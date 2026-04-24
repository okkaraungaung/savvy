"use client";

import { ArrowLeft, PiggyBank, Users, Target } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AboutPage() {
    const router = useRouter();

    return (
        <main className="page-wrap">
            <div className="container">
                <div className="header header-with-back">
                    <div className="header-left">
                        <button className="back-btn-inline" onClick={() => router.back()}>
                            <ArrowLeft size={18} />
                        </button>

                        <div>
                            <h1>About Savvy</h1>
                            <p>A simple savings and asset tracking app.</p>
                        </div>
                    </div>
                </div>

                <div className="about-hero card modern-card">
                    <h2>Save smarter, together.</h2>
                    <p>
                        Savvy helps you track your assets, goals, transactions, and group
                        savings in one clean dashboard.
                    </p>
                </div>

                <div className="about-grid">
                    <div className="card about-card modern-card">
                        <PiggyBank size={28} />
                        <h3>Track Assets</h3>
                        <p className="muted">Manage your money, savings, and valuable assets easily.</p>
                    </div>

                    <div className="card about-card modern-card">
                        <Target size={28} />
                        <h3>Set Goals</h3>
                        <p className="muted">Create saving goals and follow your progress clearly.</p>
                    </div>

                    <div className="card about-card modern-card">
                        <Users size={28} />
                        <h3>Group Savings</h3>
                        <p className="muted">Create or join groups using invite codes.</p>
                    </div>
                </div>
                <div className="about-sections">

                    {/* ABOUT SAVVY */}
                    <div className="card about-section modern-card">
                        <h3>About Savvy</h3>
                        <p>
                            Savvy is a modern financial tracking application designed to help users
                            manage their assets, monitor transactions, and achieve savings goals
                            efficiently. It provides a clean and intuitive interface that allows
                            individuals and groups to stay organized and in control of their finances.
                            Whether you are saving alone or with others, Savvy simplifies the process
                            and makes financial planning more accessible.
                        </p>
                    </div>

                    {/* HOW TO USE */}
                    <div className="card about-section modern-card">
                        <h3>How to Use Savvy</h3>
                        <p>
                            Getting started with Savvy is simple. First, create or log in to your
                            account. Then, you can add your assets, record transactions, and set
                            savings goals. You can also create or join a group using an invite code
                            to manage shared finances with friends or family. Use the dashboard to
                            track your progress and make better financial decisions over time.
                        </p>
                    </div>

                    {/* DEVELOPERS */}
                    <div className="card about-section modern-card">
                        <h3>About the Developers</h3>
                        <p>
                            Savvy is developed as a student project with a focus on combining modern
                            web technologies and practical financial tools. The goal of the project is
                            to demonstrate real-world application development using frameworks like
                            Next.js and Supabase, while also providing a useful and user-friendly
                            experience. The developers are continuously improving Savvy by adding new
                            features and enhancing performance.
                        </p>
                    </div>

                </div>
            </div>
        </main>
    );
}