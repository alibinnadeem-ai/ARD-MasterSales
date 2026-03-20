import "./globals.css";

export const metadata = {
  title: "ARD City Sales Intelligence",
  description: "ARD City dynamic sales intelligence system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
