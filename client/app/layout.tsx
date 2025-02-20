import Header from "./components/Header";
import Footer from "./components/Footer";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Header />

        <main className="main-content">{children}</main> {/* This pushes the footer down */}

        <Footer />
      </body>
    </html>
  );
}
