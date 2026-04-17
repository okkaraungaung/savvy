import "./globals.css";

export const metadata = {
  title: "SaveCircle",
  description: "Track cash, gold, and crypto savings",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
