import Script from "next/script";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter"
});

export const metadata = {
  title: "loadloud",
  description: "Продакшн полного цикла: реклама, клипы, фильмы и креатив."
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/xxu7csb.css" />
      </head>
      <body className={inter.variable}>
        {children}
        <Script src="https://unpkg.com/@mux/mux-player" strategy="afterInteractive" type="module" />
      </body>
    </html>
  );
}
