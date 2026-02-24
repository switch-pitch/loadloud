import Script from "next/script";
import "./globals.css";

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
      <body>
        {children}
        <Script src="https://unpkg.com/@mux/mux-player" strategy="afterInteractive" type="module" />
      </body>
    </html>
  );
}
