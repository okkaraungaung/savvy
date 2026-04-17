import Dashboard from "@/components/Dashboard";
import Header from "@/components/Header";

export default function HomePage() {
  return (
    <main className="page-wrap">
      <div className="container">
        <Header />
        <Dashboard />
      </div>
    </main>
  );
}
